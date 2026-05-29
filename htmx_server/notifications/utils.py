"""
Helpers for creating in-app notifications and firing Expo push notifications.

Usage examples:

    from notifications.utils import notify, notify_admins, notify_pickers
    from notifications.models import Notification

    # Single user
    notify(request.user, Notification.ORDER_PICKED,
           title="Order ZO003 is ready", link="/orders/3/")

    # All admins + superusers
    notify_admins(Notification.LOW_STOCK,
                  title="Low stock: 25mm Copper Elbow",
                  message="Only 5 units left.",
                  link="/products/12/", entity_id=12)

    # All active pickers
    notify_pickers(Notification.ORDER_CREATED, title="New order ZO007 awaits picking",
                   link="/orders/7/", entity_id=7)
"""

import json
import threading
import urllib.request

from django.db import models as _models
from authentication.models import User
from .models import Notification


# ── Expo push ─────────────────────────────────────────────────────────────────

def send_expo_push(token: str, title: str, body: str, data: dict | None = None) -> None:
    """POST a push notification to the Expo push API (blocking). Never raises."""
    if not token or not token.startswith('ExponentPushToken['):
        return
    payload = json.dumps({
        'to':    token,
        'title': title,
        'body':  body or title,
        'sound': 'default',
        'data':  data or {},
    }).encode()
    req = urllib.request.Request(
        'https://exp.host/--/api/v2/push/send',
        data=payload,
        headers={
            'Content-Type':    'application/json',
            'Accept':          'application/json',
            'Accept-Encoding': 'gzip, deflate',
        },
        method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=5):
            pass
    except Exception:
        pass  # push failure must never affect the main request


def send_expo_push_async(token: str, title: str, body: str, data: dict | None = None) -> None:
    """Fire a push notification on a background daemon thread."""
    threading.Thread(
        target=send_expo_push,
        args=(token, title, body, data),
        daemon=True,
    ).start()


# ── In-app notify helpers ─────────────────────────────────────────────────────

def notify(recipient, notification_type, title, message='', link='', entity_id=None):
    """Create an in-app notification for a single user."""
    Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        title=title,
        message=message,
        link=link,
        entity_id=entity_id,
    )
    # Push is fired automatically via post_save signal on Notification


def notify_admins(notification_type, title, message='', link='', entity_id=None):
    """Broadcast a notification to every active admin / superuser."""
    recipients = User.objects.filter(
        _models.Q(is_admin=True) | _models.Q(is_superuser=True),
        is_active=True,
    )
    _bulk_notify(recipients, notification_type, title, message, link, entity_id)


def notify_pickers(notification_type, title, message='', link='', entity_id=None):
    """Broadcast a notification to every active picker."""
    recipients = User.objects.filter(is_picker=True, is_active=True)
    _bulk_notify(recipients, notification_type, title, message, link, entity_id)


def notify_accountants(notification_type, title, message='', link='', entity_id=None):
    """Broadcast a notification to every active accountant (and admins)."""
    recipients = User.objects.filter(
        _models.Q(is_accountant=True) | _models.Q(is_admin=True) | _models.Q(is_superuser=True),
        is_active=True,
    )
    _bulk_notify(recipients, notification_type, title, message, link, entity_id)


def _bulk_notify(recipients, notification_type, title, message, link, entity_id):
    records = [
        Notification(
            recipient=r,
            notification_type=notification_type,
            title=title,
            message=message,
            link=link,
            entity_id=entity_id,
        )
        for r in recipients
    ]
    Notification.objects.bulk_create(records)
    # Fire individual push notifications for each recipient who has a token
    for r in recipients:
        token = getattr(r, 'expo_push_token', '')
        if token:
            send_expo_push_async(token, title, message or title, {
                'type': notification_type,
                'entity_id': entity_id,
            })
