from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from authentication.models import User


class Notification(models.Model):
    # ── Types ──────────────────────────────────────────────────────────────────
    LOW_STOCK         = 'low_stock'
    ORDER_APPROVAL    = 'order_approval'
    ORDER_CREATED     = 'order_created'
    ORDER_PICKED      = 'order_picked'
    ORDER_VERIFIED    = 'order_verified'
    ORDER_DISPATCHED  = 'order_dispatched'
    ORDER_REJECTED    = 'order_rejected'
    RE_PICK_REQUESTED = 're_pick'

    TYPE_CHOICES = [
        (LOW_STOCK,         'Low Stock'),
        (ORDER_APPROVAL,    'Pending Approval'),
        (ORDER_CREATED,     'New Order'),
        (ORDER_PICKED,      'Order Picked'),
        (ORDER_VERIFIED,    'Order Verified'),
        (ORDER_DISPATCHED,  'Order Dispatched'),
        (ORDER_REJECTED,    'Order Rejected'),
        (RE_PICK_REQUESTED, 'Re-pick Requested'),
    ]

    # Icon and colour per type — used by templates
    _ICON = {
        LOW_STOCK:         'bi-exclamation-triangle-fill',
        ORDER_APPROVAL:    'bi-shield-check',
        ORDER_CREATED:     'bi-cart-plus-fill',
        ORDER_PICKED:      'bi-box-seam-fill',
        ORDER_VERIFIED:    'bi-patch-check-fill',
        ORDER_DISPATCHED:  'bi-truck',
        ORDER_REJECTED:    'bi-x-circle-fill',
        RE_PICK_REQUESTED: 'bi-arrow-repeat',
    }
    _COLOR = {
        LOW_STOCK:         'amber',
        ORDER_APPROVAL:    'violet',
        ORDER_CREATED:     'indigo',
        ORDER_PICKED:      'cyan',
        ORDER_VERIFIED:    'green',
        ORDER_DISPATCHED:  'emerald',
        ORDER_REJECTED:    'red',
        RE_PICK_REQUESTED: 'purple',
    }

    # ── Fields ─────────────────────────────────────────────────────────────────
    recipient         = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='notifications',
    )
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title             = models.CharField(max_length=255)
    message           = models.TextField(blank=True)
    link              = models.CharField(max_length=255, blank=True)
    entity_id         = models.PositiveIntegerField(null=True, blank=True)
    is_read           = models.BooleanField(default=False)
    created_at        = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"→ {self.recipient.username}: {self.title}"

    @property
    def icon(self):
        return self._ICON.get(self.notification_type, 'bi-bell')

    @property
    def color(self):
        return self._COLOR.get(self.notification_type, 'gray')


@receiver(post_save, sender=Notification)
def push_on_create(sender, instance, created, **kwargs):
    """Send an Expo push notification whenever a new Notification record is created."""
    if not created:
        return
    token = getattr(instance.recipient, 'expo_push_token', '')
    if not token:
        return
    from .utils import send_expo_push_async
    send_expo_push_async(
        token,
        instance.title,
        instance.message or instance.title,
        {'type': instance.notification_type, 'entity_id': instance.entity_id},
    )
