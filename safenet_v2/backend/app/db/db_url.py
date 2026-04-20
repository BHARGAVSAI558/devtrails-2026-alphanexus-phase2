from __future__ import annotations

import os
import ssl
from typing import Any, Tuple
from urllib.parse import parse_qs, urlencode, urlsplit, urlunsplit


def _masked_host(host: str | None) -> str:
    if not host:
        return "unknown-host"
    h = host.strip()
    if len(h) <= 8:
        return h
    return f"{h[:4]}…{h[-4:]}"


def db_target_fingerprint(database_url: str) -> dict[str, str]:
    """
    Minimal, safe-to-log DB identifier (no secrets).
    """
    url = (database_url or "").strip()
    if not url:
        return {"driver": "unset", "host": "unset"}
    try:
        split = urlsplit(url)
        driver = (split.scheme or "").split("+", 1)[0] or "unknown"
        return {
            "driver": driver,
            "host": _masked_host(split.hostname),
            "port": str(split.port or ""),
            "database": (split.path or "").lstrip("/") or "",
        }
    except Exception:
        return {"driver": "unknown", "host": "unparseable"}


def prepare_asyncpg_engine_kwargs(database_url: str) -> Tuple[str, dict[str, Any]]:
    """
    Normalize DATABASE_URL for SQLAlchemy + asyncpg:
    - strip libpq query params that asyncpg can't accept (e.g. sslmode)
    - configure TLS via connect_args['ssl']
    - keep SQLite URLs untouched

    Optional env override:
    - DB_SSL_INSECURE=1 will disable certificate verification (emergency use only).
    """
    url = (database_url or "").strip()
    if not url or url.startswith("sqlite"):
        return url, {}

    split = urlsplit(url)
    host = (split.hostname or "").lower()

    qs = parse_qs(split.query, keep_blank_values=False)
    sslmode_vals = qs.pop("sslmode", None)
    qs.pop("channel_binding", None)

    connect_args: dict[str, Any] = {}

    insecure = str(os.getenv("DB_SSL_INSECURE", "")).strip().lower() in {"1", "true", "yes", "on"}
    if sslmode_vals:
        mode = (sslmode_vals[0] or "").strip().lower()
        if mode in ("require", "verify-ca", "verify-full", "prefer"):
            ctx = ssl.create_default_context()
            if insecure:
                ctx.check_hostname = False
                ctx.verify_mode = ssl.CERT_NONE
            connect_args["ssl"] = ctx
        elif mode in ("allow",):
            connect_args["ssl"] = True
        elif mode == "disable":
            connect_args["ssl"] = False
    elif "supabase.co" in host or "pooler.supabase.com" in host:
        # Supabase requires TLS on direct/pooler connections; enable by default.
        ctx = ssl.create_default_context()
        if insecure:
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
        connect_args["ssl"] = ctx

    new_query = urlencode(qs, doseq=True)
    cleaned = urlunsplit((split.scheme, split.netloc, split.path, new_query, split.fragment))
    return cleaned, connect_args


def db_ssl_mode_label(database_url: str) -> str:
    """
    Returns one of: 'secure' | 'insecure' | 'disabled' | 'none'
    """
    url = (database_url or "").strip()
    if not url or url.startswith("sqlite"):
        return "none"
    _, connect_args = prepare_asyncpg_engine_kwargs(url)
    ssl_arg = connect_args.get("ssl", None)
    if ssl_arg is False:
        return "disabled"
    if isinstance(ssl_arg, ssl.SSLContext):
        insecure = ssl_arg.verify_mode == ssl.CERT_NONE or (ssl_arg.check_hostname is False)
        return "insecure" if insecure else "secure"
    if ssl_arg is True:
        # asyncpg will create SSL context internally; cannot guarantee verify mode here.
        return "secure"
    return "none"

