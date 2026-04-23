import hmac
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_admin_token, create_access_token, create_refresh_token, verify_token
from app.db.session import get_db
from app.models.claim import Log
from app.models.auth_token import RefreshToken
from app.models.worker import User
from app.schemas.auth import AdminLoginRequest, RefreshRequest, SendOTPRequest, TokenResponse, VerifyOTPRequest
from app.services.otp_service import OTPService
from app.utils.canonical_id import generate_canonical_hash
from app.utils.logger import get_logger
from structlog.contextvars import bind_contextvars

log = get_logger(__name__)
router = APIRouter()

# ── Firebase Admin SDK (lazy init) ────────────────────────────────────────────
_firebase_app = None

def _get_firebase_app():
    global _firebase_app
    if _firebase_app is not None:
        return _firebase_app
    try:
        import json
        import firebase_admin
        from firebase_admin import credentials

        # Option 1: JSON string in env var FIREBASE_SERVICE_ACCOUNT_JSON
        sa_json = (os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON") or "").strip()
        if sa_json:
            sa_dict = json.loads(sa_json)
            cred = credentials.Certificate(sa_dict)
            if not firebase_admin._apps:
                _firebase_app = firebase_admin.initialize_app(cred)
            else:
                _firebase_app = firebase_admin.get_app()
            return _firebase_app

        # Option 2: path to JSON file (FIREBASE_CREDENTIALS_PATH env or local file)
        cred_path = (settings.FIREBASE_CREDENTIALS_PATH or "").strip()
        if not cred_path:
            cred_path = str(Path(__file__).resolve().parents[4] / "firebase-service-account.json")
        if not Path(cred_path).exists():
            return None
        cred = credentials.Certificate(cred_path)
        if not firebase_admin._apps:
            _firebase_app = firebase_admin.initialize_app(cred)
        else:
            _firebase_app = firebase_admin.get_app()
        return _firebase_app
    except Exception as exc:
        log.warning("firebase_admin_init_failed", error=str(exc))
        return None


class FirebaseVerifyRequest(BaseModel):
    id_token: str
    phone_number: str  # e.g. "9876543210" (10 digits, no +91)


def _const_time_eq(expected: str, provided: str) -> bool:
    e = (expected or "").encode("utf-8")
    p = (provided or "").encode("utf-8")
    if len(e) != len(p):
        return False
    return hmac.compare_digest(e, p)


def get_redis(request: Request):
    return getattr(request.app.state, "redis", None)


@router.post("/send-otp")
async def send_otp(
    request: Request,
    body: SendOTPRequest,
    db: AsyncSession = Depends(get_db),
):
    redis = get_redis(request)
    phone = body.phone_number
    success, message = await OTPService.send(phone, redis, request)

    db.add(
        Log(
            event_type="otp_sent",
            detail=f"phone={phone}",
            ip_address=request.client.host if request.client else None,
        )
    )
    await db.commit()

    log.info(
        "send_otp_complete",
        engine_name="auth_route",
        decision=str(success),
        reason_code="OTP_FLOW",
    )
    return {"success": bool(success)}


@router.post("/admin-login", response_model=TokenResponse)
async def admin_login(
    request: Request,
    body: AdminLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Username/password for the web admin only (no OTP). Creates a synthetic admin user row if needed."""
    u = body.username.strip()
    p = (body.password or "").strip()
    if not _const_time_eq(settings.ADMIN_DASHBOARD_USERNAME, u):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    if not _const_time_eq(settings.ADMIN_DASHBOARD_PASSWORD, p):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    phone = (settings.ADMIN_CONSOLE_PHONE or "9000000001").strip()
    result = await db.execute(select(User).where(User.phone == phone))
    user = result.scalar_one_or_none()
    if not user:
        user = User(
            phone=phone,
            is_active=True,
            is_admin=True,
            canonical_hash=generate_canonical_hash(phone),
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)
        log.info(
            "admin_console_user_created",
            engine_name="auth_route",
            worker_id=user.id,
        )
    else:
        if not user.is_admin:
            user.is_admin = True
        if not user.canonical_hash:
            user.canonical_hash = generate_canonical_hash(phone)
        log.info(
            "admin_password_login",
            engine_name="auth_route",
            worker_id=user.id,
        )

    bind_contextvars(worker_id=user.id)
    token_data = {"user_id": user.id, "phone": user.phone}
    access_token = create_admin_token(token_data)
    refresh_token = create_refresh_token(token_data)
    refresh_payload = verify_token(refresh_token, token_type="refresh")
    db.add(
        Log(
            user_id=user.id,
            event_type="admin_login",
            detail="password",
            ip_address=request.client.host if request.client else None,
        )
    )
    db.add(
        RefreshToken(
            user_id=user.id,
            token_jti=str(refresh_payload.get("jti")),
            token_value=refresh_token,
            used=False,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7),
        )
    )
    await db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user.id,
        is_new_user=False,
    )


@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(
    request: Request,
    body: VerifyOTPRequest,
    db: AsyncSession = Depends(get_db),
):
    redis = get_redis(request)
    phone = body.phone_number
    success, message = await OTPService.verify(phone, body.otp, redis, request)

    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)

    result = await db.execute(select(User).where(User.phone == phone))
    user = result.scalar_one_or_none()
    is_new_user = False
    if not user:
        is_new_user = True
        user = User(phone=phone, canonical_hash=generate_canonical_hash(phone))
        db.add(user)
        await db.flush()
        await db.refresh(user)
        log.info(
            "user_created",
            engine_name="auth_route",
            decision="created",
            reason_code="AUTH_NEW_USER",
            worker_id=user.id,
        )
    else:
        if not user.canonical_hash:
            user.canonical_hash = generate_canonical_hash(phone)
        log.info(
            "user_login",
            engine_name="auth_route",
            decision="login",
            reason_code="AUTH_RETURNING",
            worker_id=user.id,
        )

    bind_contextvars(worker_id=user.id)

    db.add(
        Log(
            user_id=user.id,
            event_type="otp_verified",
            detail=f"phone={phone}",
            ip_address=request.client.host if request.client else None,
        )
    )
    await db.commit()

    token_data = {"user_id": user.id, "phone": user.phone}
    if body.admin:
        if not user.is_admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
        access_token = create_admin_token(token_data)
    else:
        access_token = create_access_token(token_data)

    refresh_token = create_refresh_token(token_data)
    refresh_payload = verify_token(refresh_token, token_type="refresh")
    db.add(
        RefreshToken(
            user_id=user.id,
            token_jti=str(refresh_payload.get("jti")),
            token_value=refresh_token,
            used=False,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7),
        )
    )
    await db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user.id,
        is_new_user=is_new_user,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = verify_token(body.refresh_token, token_type="refresh")
    jti = str(payload.get("jti") or "")
    token_row = (
        await db.execute(select(RefreshToken).where(RefreshToken.token_jti == jti, RefreshToken.used.is_(False)))
    ).scalar_one_or_none()
    if token_row is None or token_row.token_value != body.refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token is invalid or already used")

    user_id = payload.get("user_id")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    token_data = {"user_id": user.id, "phone": user.phone}
    if body.admin:
        if not user.is_admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
        access_token = create_admin_token(token_data)
    else:
        access_token = create_access_token(token_data)

    token_row.used = True
    new_refresh = create_refresh_token(token_data)
    new_payload = verify_token(new_refresh, token_type="refresh")
    db.add(
        RefreshToken(
            user_id=user.id,
            token_jti=str(new_payload.get("jti")),
            token_value=new_refresh,
            used=False,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7),
        )
    )
    await db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh,
        user_id=user.id,
        is_new_user=False,
    )


@router.post("/firebase-verify", response_model=TokenResponse)
async def firebase_verify(
    request: Request,
    body: FirebaseVerifyRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Verify a Firebase Phone Auth ID token and issue a SafeNet JWT.
    The frontend sends the Firebase id_token after signInWithPhoneNumber succeeds.
    Falls back gracefully — if Firebase Admin SDK is unavailable, returns 503
    so the frontend can fall back to demo mode.
    """
    app_fb = _get_firebase_app()
    if app_fb is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="firebase_unavailable",
        )

    # Verify the Firebase ID token
    try:
        import anyio
        from firebase_admin import auth as fb_auth

        decoded = await anyio.to_thread.run_sync(
            lambda: fb_auth.verify_id_token(body.id_token)
        )
    except Exception as exc:
        log.warning("firebase_token_verify_failed", error=str(exc))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase token verification failed.",
        )

    # The phone in the Firebase token is +91XXXXXXXXXX — strip +91
    firebase_phone = str(decoded.get("phone_number") or "").strip()
    clean_phone = firebase_phone.lstrip("+").lstrip("91") if firebase_phone.startswith("+91") else body.phone_number
    # Normalise: always use the 10-digit version
    if len(clean_phone) > 10:
        clean_phone = clean_phone[-10:]
    if not clean_phone:
        clean_phone = body.phone_number

    # Upsert user
    result = await db.execute(select(User).where(User.phone == clean_phone))
    user = result.scalar_one_or_none()
    is_new_user = False
    if not user:
        is_new_user = True
        user = User(phone=clean_phone, canonical_hash=generate_canonical_hash(clean_phone))
        db.add(user)
        await db.flush()
        await db.refresh(user)
        log.info("firebase_user_created", engine_name="auth_route", worker_id=user.id)
    else:
        if not user.canonical_hash:
            user.canonical_hash = generate_canonical_hash(clean_phone)
        log.info("firebase_user_login", engine_name="auth_route", worker_id=user.id)

    bind_contextvars(worker_id=user.id)

    db.add(Log(
        user_id=user.id,
        event_type="firebase_otp_verified",
        detail=f"phone={clean_phone}",
        ip_address=request.client.host if request.client else None,
    ))
    await db.commit()

    token_data = {"user_id": user.id, "phone": user.phone}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    refresh_payload = verify_token(refresh_token, token_type="refresh")
    db.add(RefreshToken(
        user_id=user.id,
        token_jti=str(refresh_payload.get("jti")),
        token_value=refresh_token,
        used=False,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
    ))
    await db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user.id,
        is_new_user=is_new_user,
    )
