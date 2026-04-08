from __future__ import annotations

import asyncio
import json
import traceback
import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.routes.workers import get_current_user
from app.db.session import AsyncSessionLocal, get_db
from app.engines.payout_engine import PayoutEngine
from app.models.claim import DecisionType, Log, Simulation
from app.models.fraud import FraudSignal
from app.models.payout import PayoutRecord
from app.models.policy import Policy
from app.models.worker import Profile, User
from app.services.forecast_shield_service import payout_message_suffix
from app.services.notification_service import create_notification
from app.services.onboarding_pricing import TIER_MAX_DAILY as ONBOARDING_TIER_MAX_DAILY
from app.services.realtime_service import publish_claim_update
from app.utils.logger import get_logger

log = get_logger(__name__)

router = APIRouter()

TIER_MAX_DAILY: dict[str, float] = dict(ONBOARDING_TIER_MAX_DAILY)


def _product_to_tier(product_code: str | None) -> str:
    if not product_code:
        return "Standard"
    low = str(product_code).lower()
    if "basic" in low:
        return "Basic"
    if "standard" in low:
        return "Standard"
    if "pro" in low:
        return "Pro"
    return "Standard"


def _zone_label(zone_id: str) -> str:
    raw = zone_id.strip().replace("-", "_")
    segs = [s for s in raw.split("_") if s]
    if not segs:
        return zone_id
    if "hitec" in raw.lower():
        return "HITEC City"
    focus = segs[-1]
    return (focus[:1].upper() + focus[1:].lower()) if focus else zone_id


def _initiated_message(scenario: str, zone_label: str) -> str:
    if scenario == "HEAVY_RAIN":
        return f"Heavy rain detected in {zone_label} zone"
    if scenario == "EXTREME_HEAT":
        return f"Extreme heat detected in {zone_label} zone"
    if scenario == "AQI_SPIKE":
        return f"Hazardous AQI spike in {zone_label} zone"
    return f"Zone curfew active — {zone_label}"


def _approved_message(scenario: str, payout: float) -> str:
    p = int(round(float(payout)))
    if scenario == "HEAVY_RAIN":
        return f"₹{p} credited — rain verified in your zone"
    if scenario == "EXTREME_HEAT":
        return f"₹{p} credited — heat stress verified in your zone"
    if scenario == "AQI_SPIKE":
        return f"₹{p} credited — air quality hazard verified in your zone"
    return f"₹{p} credited — curfew disruption verified in your zone"


def _deterministic_demo_payout(expected_slot: float, daily_cap: float, scenario: str, cycle_idx: int) -> float:
    """
    Demo payout tuned for "realistic" judge feel:
    pay ~70%–80% of what a rider would normally earn during the disruption hours.
    Deterministic across repeated demo runs (no random payouts).
    """
    scenario_hours = {
        "HEAVY_RAIN": 5.0,
        "EXTREME_HEAT": 4.0,
        "AQI_SPIKE": 4.0,
        "CURFEW": 6.0,
    }.get(scenario, 4.0)

    # 70–80% target (deterministic across the 2-payout / 1-no-disruption cadence).
    target_frac = [0.72, 0.76, 0.80][cycle_idx % 3]

    expected_total = float(expected_slot) * float(scenario_hours)
    amt = expected_total * float(target_frac)
    amt = min(float(daily_cap), max(0.0, amt))
    return round(amt, 2)


class SimulationRunRequest(BaseModel):
    scenario: Literal["HEAVY_RAIN", "EXTREME_HEAT", "AQI_SPIKE", "CURFEW"]
    zone_id: str = Field(default="", max_length=128)
    worker_id: int | None = None
    fast_mode: bool = True
    fraud_mode: Literal["NONE", "GPS_SPOOF", "RING_FRAUD_5"] = "NONE"
    worker_count: int = Field(1, ge=1, le=50)


class SimulationStartedResponse(BaseModel):
    simulation_id: str


async def _demo_claim_pipeline(
    app: Any,
    body: SimulationRunRequest,
    run_id: str,
    worker_id: int,
) -> None:
    redis = getattr(app.state, "redis", None)
    step_delay = 1.5 if body.fast_mode else 3.0

    try:
        async with AsyncSessionLocal() as db:
            prof_row = (
                await db.execute(select(Profile).where(Profile.user_id == worker_id))
            ).scalar_one_or_none()
            zone_id = (body.zone_id or "").strip()
            if not zone_id and prof_row and (prof_row.zone_id or "").strip():
                zone_id = prof_row.zone_id.strip()
            if not zone_id:
                zone_id = "hyd_central"
            zone_label = _zone_label(zone_id)

            profile = prof_row or SimpleNamespace(
                city="Hyderabad",
                avg_daily_income=650.0,
                total_claims=0,
                total_payouts=0.0,
            )

            pol = (
                await db.execute(
                    select(Policy)
                    .where(Policy.user_id == worker_id, Policy.status == "active")
                    .order_by(Policy.id.desc())
                    .limit(1)
                )
            ).scalar_one_or_none()
            tier = _product_to_tier(pol.product_code if pol else None)
            daily_cap = float(TIER_MAX_DAILY.get(tier, 1000.0))

            sims_for_dna = (
                (
                    await db.execute(
                        select(Simulation)
                        .where(Simulation.user_id == worker_id)
                        .order_by(Simulation.created_at.desc())
                        .limit(800)
                    )
                )
                .scalars()
                .all()
            )

            payout, breakdown, expected_slot = PayoutEngine.compute_demo_dna_payout(
                body.scenario,
                profile,
                daily_cap,
                sims_for_dna,
            )
            # Realistic demo cadence: 2 payouts, then 1 no-disruption (no payout).
            cycle_idx = len(sims_for_dna) % 3
            no_disruption_this_run = cycle_idx == 2
            scenario_hours = {
                "HEAVY_RAIN": 5.0,
                "EXTREME_HEAT": 4.0,
                "AQI_SPIKE": 4.0,
                "CURFEW": 6.0,
            }.get(body.scenario, 4.0)
            # 70–80% target of what the rider would normally earn during the disruption window.
            target_frac = [0.72, 0.76, 0.80][cycle_idx % 3]

            expected_total = round(float(expected_slot) * float(scenario_hours), 2)
            payout_total = round(min(float(daily_cap), expected_total * float(target_frac)), 2)
            payout = payout_total
            loss_total = expected_total  # disruption hours → rider income drops to ~0
            actual_income_total = 0.0

            # Keep payload fields consistent with the new payout math so UI + admin match.
            breakdown["expected"] = expected_total
            breakdown["loss"] = loss_total
            breakdown["disruption_hours"] = scenario_hours
            breakdown["target_frac"] = target_frac

            weather_payload = {"scenario": body.scenario, "zone_id": zone_id, "run_id": run_id}

            sim = Simulation(
                user_id=worker_id,
                is_active=False,
                fraud_flag=False,
                fraud_score=0.1,
                weather_disruption=body.scenario in ("HEAVY_RAIN", "EXTREME_HEAT"),
                traffic_disruption=False,
                event_disruption=body.scenario == "CURFEW",
                final_disruption=not no_disruption_this_run,
                expected_income=float(expected_total),
                actual_income=float(actual_income_total),
                loss=float(loss_total),
                payout=0.0 if no_disruption_this_run else float(payout_total),
                decision=DecisionType.REJECTED if no_disruption_this_run else DecisionType.APPROVED,
                reason=(
                    f"No live disruption found in {zone_label} during this check"
                    if no_disruption_this_run
                    else f"Demo approved — {body.scenario}"
                ),
                weather_data=json.dumps(weather_payload),
            )
            db.add(sim)
            await db.flush()
            await db.refresh(sim)
            cid = sim.id

            await publish_claim_update(
                redis=redis,
                worker_id=worker_id,
                claim_id=cid,
                status="INITIATED",
                message=_initiated_message(body.scenario, zone_label),
                zone_id=zone_id,
                disruption_type=body.scenario,
                correlation_id=run_id,
            )
            await asyncio.sleep(step_delay)
            await create_notification(
                db,
                user_id=worker_id,
                ntype="system",
                title="Claim under review",
                message="Your disruption claim entered verification.",
            )

            await publish_claim_update(
                redis=redis,
                worker_id=worker_id,
                claim_id=cid,
                status="VERIFYING",
                message="Checking OpenWeatherMap signal...",
                zone_id=zone_id,
                disruption_type=body.scenario,
                correlation_id=run_id,
            )
            await asyncio.sleep(step_delay)

            await publish_claim_update(
                redis=redis,
                worker_id=worker_id,
                claim_id=cid,
                status="BEHAVIORAL_CHECK",
                message="Analyzing your activity pattern...",
                zone_id=zone_id,
                disruption_type=body.scenario,
                correlation_id=run_id,
            )
            await asyncio.sleep(step_delay)

            await publish_claim_update(
                redis=redis,
                worker_id=worker_id,
                claim_id=cid,
                status="FRAUD_CHECK",
                message="GPS integrity verified ✓",
                zone_id=zone_id,
                disruption_type=body.scenario,
                correlation_id=run_id,
                fraud_score=0.1,
            )
            await asyncio.sleep(step_delay)

            shields = getattr(app.state, "forecast_shields", None) or {}
            fs_suffix = payout_message_suffix(
                shields if isinstance(shields, dict) else {},
                zone_id,
                datetime.now(timezone.utc),
            )
            if no_disruption_this_run:
                await publish_claim_update(
                    redis=redis,
                    worker_id=worker_id,
                    claim_id=cid,
                    status="CLAIM_REJECTED",
                    message=f"No confirmed disruption in {zone_label}. Monitoring continues in real time.",
                    payout_amount=0.0,
                    zone_id=zone_id,
                    disruption_type=body.scenario,
                    fraud_score=0.1,
                    correlation_id=run_id,
                    payout_breakdown=breakdown,
                    daily_coverage=daily_cap,
                )
            else:
                await publish_claim_update(
                    redis=redis,
                    worker_id=worker_id,
                    claim_id=cid,
                    status="APPROVED",
                    message=_approved_message(body.scenario, payout) + fs_suffix,
                    payout_amount=payout,
                    zone_id=zone_id,
                    disruption_type=body.scenario,
                    fraud_score=0.1,
                    correlation_id=run_id,
                    payout_breakdown=breakdown,
                    daily_coverage=daily_cap,
                )

            if prof_row is not None:
                prof_row.total_claims = int(prof_row.total_claims or 0) + 1
                if not no_disruption_this_run:
                    prof_row.total_payouts = float(prof_row.total_payouts or 0.0) + float(payout)
            if not no_disruption_this_run:
                db.add(PayoutRecord(simulation_id=cid, amount=payout, currency="INR", status="completed"))
            db.add(
                FraudSignal(
                    user_id=worker_id,
                    simulation_id=cid,
                    score=0.1,
                    reason_code="DEMO_SIM",
                    detail="judge_demo_pipeline",
                )
            )
            db.add(
                Log(
                    user_id=worker_id,
                    event_type="simulation_run",
                    detail=f"decision={'REJECTED' if no_disruption_this_run else 'APPROVED'} payout={0.0 if no_disruption_this_run else payout} run={run_id}",
                )
            )
            if no_disruption_this_run:
                await create_notification(
                    db,
                    user_id=worker_id,
                    ntype="system",
                    title="No disruption detected",
                    message="No verified disruption this run. SafeNet is still monitoring your zone.",
                )
            else:
                await create_notification(
                    db,
                    user_id=worker_id,
                    ntype="payout",
                    title=f"₹{int(round(payout))} credited",
                    message="Disruption verified. Payout added to your wallet.",
                )
            await db.commit()

    except Exception as exc:
        log.error(
            "demo_sim_pipeline_failed",
            engine_name="simulation_route",
            simulation_id=run_id,
            error=str(exc),
            traceback=traceback.format_exc(),
        )


@router.post("/run", response_model=SimulationStartedResponse, status_code=202)
async def run_simulation(
    request: Request,
    body: SimulationRunRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.worker_id is not None and body.worker_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="worker_id must match the authenticated user",
        )

    target_wid = body.worker_id if body.worker_id is not None else current_user.id
    user_row = await db.execute(select(User).where(User.id == target_wid))
    if user_row.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="User not found")

    simulation_id = str(uuid.uuid4())
    asyncio.create_task(_demo_claim_pipeline(request.app, body, simulation_id, target_wid))
    return SimulationStartedResponse(simulation_id=simulation_id)
