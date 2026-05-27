"""
Helpers for creating notifications.

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

from django.db import models as _models
from authentication.models import User
from .models import Notification


def notify(recipient, notification_type, title, message='', link='', entity_id=None):
    """Create a notification for a single user."""
    Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        title=title,
        message=message,
        link=link,
        entity_id=entity_id,
    )


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


def _bulk_notify(recipients, notification_type, title, message, link, entity_id):
    Notification.objects.bulk_create([
        Notification(
            recipient=r,
            notification_type=notification_type,
            title=title,
            message=message,
            link=link,
            entity_id=entity_id,
        )
        for r in recipients
    ])
