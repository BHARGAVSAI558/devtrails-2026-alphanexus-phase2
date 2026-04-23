import asyncio
import hashlib
import hmac as hmac_lib
import math
import random
import time
from typing import Any, Optional, Tuple

import anyio
from twilio.base.exceptions import TwilioRestException
from twilio.rest import Client

from app.core.config import settings
from app.utils.logger import get_logger

log = get_logger(__name__)

OTP_EXPIRY_SECONDS = 300
OTP_KEY_PREFIX = "otp:"

# ── TOTP-style deterministic OTP ─────────────────────────────────────────────
# Generates a 6-digit OTP from phone + time window using HMAC-SHA256.
# The same OTP is produced by any process in the same time window,
# so verify works even if a different Render worker handles the request.
# Window = 5 minutes (300s). We accept current + previous window for clock skew.

_TOTP_WINDOW_SECONDS = 300  # 5 minutes per window


def _totp_secret() -> str:
    """Derive a stable secret from JWT_SECRET so no extra env var is needed."""
    return hashlib.sha256(
        f"safenet-otp-{settings.JWT_SECRET}".encode("utf-8")
    ).hexdigest()


def _totp_window(ts: float) -> int:
    return math.floor(ts / _TOTP_WINDOW_SECONDS)


def _totp_generate(phone: str, window: int) -> str:
    secret = _totp_secret()
    msg = f"{phone}:{window}".encode("utf-8")
    digest = hmac_lib.new(secret.encode("utf-8"), msg, hashlib.sha256).hexdigest()
    # Take last 6 decimal digits from the hex digest
    code = str(int(digest[-8:], 16) % 1000000).zfill(6)
    return code


def generate_otp(phone: str) -> str:
    """Generate OTP for current time window."""
    return _totp_generate(phone, _totp_window(time.time()))


def verify_otp_code(phone: str, otp: str) -> bool:
    """
    Verify OTP against current window and previous window (handles clock skew
    and the case where user takes a minute to type).
    """
    now = time.time()
    current_window = _totp_window(now)
    for w in (current_window, current_window - 1):
        if _totp_generate(phone, w) == otp:
            return True
    return False


# ─────────────────────────────────────────────────────────────────────────────


def _twilio_ready() -> bool:
    return bool(
        (settings.TWILIO_ACCOUNT_SID or "").strip()
        and (settings.TWILIO_AUTH_TOKEN or "").strip()
        and (settings.TWILIO_PHONE or "").strip()
    )


def _sync_twilio_send(phone: str, otp: str) -> None:
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    client.messages.create(
        body=f"Your SafeNet OTP is: {otp}. Valid for 5 minutes. Do not share.",
        from_=settings.TWILIO_PHONE,
        to=f"+91{phone}",
    )


def _console_otp_banner(phone: str, otp: str) -> None:
    print(f"\n{'=' * 40}\nOTP for {phone}: {otp}\n{'=' * 40}\n", flush=True)


class OTPService:
    """
    OTP via deterministic TOTP (no memory/Redis store needed).
    Falls back to in-memory store as secondary check for compatibility.
    Twilio sends the real SMS; console prints it as fallback.
    """

    @staticmethod
    def _memory_store(request: Any) -> dict:
        if not hasattr(request.app.state, "otp_store") or request.app.state.otp_store is None:
            request.app.state.otp_store = {}
        return request.app.state.otp_store

    @staticmethod
    async def _store_memory(phone: str, otp: str, request: Any) -> None:
        store = OTPService._memory_store(request)
        store[phone] = {"otp": otp, "expires": time.time() + OTP_EXPIRY_SECONDS}

    @staticmethod
    async def _get_memory(phone: str, request: Any) -> Optional[str]:
        store = OTPService._memory_store(request)
        entry = store.get(phone)
        if not entry:
            return None
        if time.time() < float(entry.get("expires") or 0):
            return str(entry.get("otp") or "")
        store.pop(phone, None)
        return None

    @staticmethod
    async def _store_redis(phone: str, otp: str, redis_client: Any) -> None:
        if redis_client is None:
            return
        try:
            await asyncio.wait_for(
                redis_client.setex(f"{OTP_KEY_PREFIX}{phone}", OTP_EXPIRY_SECONDS, otp),
                timeout=2.5,
            )
        except Exception as exc:
            log.warning("otp_redis_setex_skipped", engine_name="otp_service", error=str(exc))

    @staticmethod
    async def _get_redis(phone: str, redis_client: Any) -> Optional[str]:
        if redis_client is None:
            return None
        try:
            val = await asyncio.wait_for(redis_client.get(f"{OTP_KEY_PREFIX}{phone}"), timeout=2.5)
        except Exception:
            return None
        if val is None:
            return None
        decoded = val.decode() if isinstance(val, (bytes, bytearray)) else val
        return str(decoded) if decoded else None

    @staticmethod
    async def send(phone: str, redis_client: Any, request: Any) -> Tuple[bool, str]:
        # Generate deterministic OTP (same across all Render workers)
        otp = generate_otp(phone)

        # Also store in Redis + memory as backup verification path
        await OTPService._store_redis(phone, otp, redis_client)
        await OTPService._store_memory(phone, otp, request)

        twilio_sent = False
        if _twilio_ready():
            try:
                await asyncio.wait_for(
                    anyio.to_thread.run_sync(_sync_twilio_send, phone, otp),
                    timeout=12.0,
                )
                twilio_sent = True
                log.info(
                    "otp_sms_sent",
                    engine_name="otp_service",
                    decision="twilio",
                    reason_code="SMS_OK",
                    phone_suffix=phone[-4:],
                )
            except TwilioRestException as e:
                log.warning(
                    "otp_twilio_error",
                    engine_name="otp_service",
                    decision="fallback_console",
                    reason_code="TWILIO_REST_ERROR",
                    error=str(e),
                    phone_suffix=phone[-4:],
                )
            except Exception as e:
                log.error(
                    "otp_twilio_failed",
                    engine_name="otp_service",
                    decision="fallback_console",
                    reason_code="SMS_ERROR",
                    error=str(e),
                )

        if not twilio_sent:
            _console_otp_banner(phone, otp)
            log.info(
                "otp_console_fallback",
                engine_name="otp_service",
                decision="console",
                reason_code="OTP_CONSOLE",
                phone_suffix=phone[-4:],
            )

        return True, "Verification code sent"

    @staticmethod
    async def verify(phone: str, otp: str, redis_client: Any, request: Any) -> Tuple[bool, str]:
        if not otp or len(otp) != 6 or not otp.isdigit():
            return False, "Invalid OTP format."

        # 1) TOTP deterministic check — works across all Render workers/restarts
        if verify_otp_code(phone, otp):
            log.info(
                "otp_verified_totp",
                engine_name="otp_service",
                decision="ok",
                reason_code="OTP_TOTP_OK",
                phone_suffix=phone[-4:],
            )
            return True, "OTP verified successfully"

        # 2) Redis store check (if Redis is configured)
        stored_redis = await OTPService._get_redis(phone, redis_client)
        if stored_redis is not None and stored_redis == otp:
            log.info("otp_verified_redis", engine_name="otp_service", reason_code="OTP_REDIS_OK", phone_suffix=phone[-4:])
            return True, "OTP verified successfully"

        # 3) In-memory store check (same process only — works on single-worker Render)
        stored_mem = await OTPService._get_memory(phone, request)
        if stored_mem is not None and stored_mem == otp:
            log.info("otp_verified_memory", engine_name="otp_service", reason_code="OTP_MEM_OK", phone_suffix=phone[-4:])
            return True, "OTP verified successfully"

        # 4) DEMO_MODE bypass
        if settings.DEMO_MODE:
            log.info("otp_demo_bypass", engine_name="otp_service", reason_code="OTP_DEMO_BYPASS", phone_suffix=phone[-4:])
            return True, "OTP verified successfully"

        log.warning("otp_invalid", engine_name="otp_service", reason_code="OTP_MISMATCH", phone_suffix=phone[-4:])
        return False, "Invalid OTP. Please try again."
