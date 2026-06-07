import logging
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_order_confirmation(self, order_id: str):
    try:
        logger.info(f"Sending order confirmation email for order {order_id}")
        # In production: fetch order from DB, render email template, send via SMTP
        # This is intentionally left as a hook — wire up aiosmtplib + Jinja2 templates
        logger.info(f"Order confirmation sent for {order_id}")
    except Exception as exc:
        logger.error(f"Failed to send order confirmation for {order_id}: {exc}")
        raise self.retry(exc=exc)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_order_status_update(self, order_id: str, new_status: str):
    try:
        logger.info(f"Sending status update email: order={order_id} status={new_status}")
    except Exception as exc:
        raise self.retry(exc=exc)


@celery_app.task
def cleanup_expired_tokens():
    """Scheduled task to remove expired refresh tokens from DB."""
    from app.core.database import SessionLocal
    from app.repositories.token_repo import TokenRepository
    db = SessionLocal()
    try:
        count = TokenRepository(db).cleanup_expired()
        logger.info(f"Cleaned up {count} expired refresh tokens")
    finally:
        db.close()
