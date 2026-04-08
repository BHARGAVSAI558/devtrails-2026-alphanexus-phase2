from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.notification import Notification


async def create_notification(
    db: AsyncSession,
    *,
    user_id: int,
    ntype: str,
    title: str,
    message: str,
) -> Notification:
    # Prevent noisy duplicate notifications for the same event text.
    prev = (
        await db.execute(
            select(Notification)
            .where(
                Notification.user_id == int(user_id),
                Notification.type == str(ntype or "system"),
                Notification.title == str(title or "SafeNet update")[:160],
                Notification.message == str(message or ""),
                Notification.is_read.is_(False),
            )
            .order_by(Notification.id.desc())
            .limit(1)
        )
    ).scalar_one_or_none()
    if prev is not None:
        return prev

    row = Notification(
        user_id=int(user_id),
        type=str(ntype or "system"),
        title=str(title or "SafeNet update")[:160],
        message=str(message or ""),
        is_read=False,
    )
    db.add(row)
    await db.flush()
    return row

import json
import os
from typing import Any, Dict, Optional

from app.core.config import settings
from app.utils.logger import get_logger

log = get_logger(__name__)


class NotificationService:
    @staticmethod
    async def send_push(user_id: int, title: str, body: str, data: Optional[Dict[str, Any]] = None) -> bool:
        path = settings.FIREBASE_CREDENTIALS_PATH
        if not path or not os.path.isfile(path):
            log.info(
                "push_skipped",
                engine_name="notification_service",
                decision="no_credentials",
                reason_code="FIREBASE_DISABLED",
                worker_id=user_id,
                title=title,
            )
            return False
        log.info(
            "push_enqueued",
            engine_name="notification_service",
            decision="stub",
            reason_code="FIREBASE_STUB",
            worker_id=user_id,
            title=title,
            body=body,
            data=json.dumps(data or {}),
        )
        return True
