import os
from django.db import models
from django.core.cache import cache
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import F, Avg
from authentication.models import User
from django.core.validators import MinValueValidator
from decimal import Decimal

class Category(models.Model):
    name = models.CharField(max_length=100)
    def __str__(self):
        return self.name

class Business(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="owned_businesses")
    members = models.ManyToManyField(User, related_name="businesses")
    


class Product(models.Model):
    # --- Identification ---
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    brand = models.CharField(max_length=100, db_index=True)
    part_number = models.CharField(max_length=100, db_index=True, verbose_name="Manufacturer Part Number (MPN)")
    upc_code = models.CharField(max_length=12, blank=True, verbose_name="Barcode/UPC")

    # --- Technical Specifications ---
    # Using choices for consistency in plumbing materials
    MATERIAL_CHOICES = [
        ('PVC', 'PVC'), ('CPVC', 'CPVC'), ('PEX', 'PEX'), ('COPPER', 'Copper'),
        ('BRASS', 'Brass'), ('STAINLESS', 'Stainless Steel'), ('ABS', 'ABS'),
    ]
    material = models.CharField(max_length=50, choices=MATERIAL_CHOICES, blank=True)
    # connection_size = models.CharField(max_length=50, help_text="e.g., 1/2\", 3/4\", 1-1/4\"")
    # connection_type = models.CharField(max_length=100, help_text="e.g., Sweat, Threaded, Push-Fit")
    is_lead_free = models.BooleanField(default=False)
    max_pressure_psi = models.PositiveIntegerField(null=True, blank=True, verbose_name="Max Pressure (PSI)")

    # --- Financials ---
    buying_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(Decimal('0.00'))])
    wholesale_price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Contractor Price", null=True, blank=True)
    min_price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Min Selling Price", null=True, blank=True)
    max_price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Max Selling Price", null=True, blank=True)
    amount_collected = models.DecimalField(max_digits=15, decimal_places=2, default=0.00, editable=False)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, help_text="Percentage e.g. 15.00")

    # --- Logistics & Inventory ---
    UOM_CHOICES = [('UNIT', 'Each'), ('FT', 'Feet'), ('RL', 'Roll'), ('BX', 'Box')]
    unit_of_measure = models.CharField(max_length=10, choices=UOM_CHOICES, default='UNIT')
    
    quantity_at_hand = models.IntegerField(default=0, verbose_name="Total Physical Stock")
    quantity_allocated = models.IntegerField(default=0, help_text="Sold but not yet shipped/picked up")
    reorder_point = models.PositiveIntegerField(default=10)
    
    # Physical Specs for Shipping
    weight = models.DecimalField(max_digits=6, decimal_places=2, help_text="Weight in lbs", null=True, blank=True)
    bin_location = models.CharField(max_length=50, blank=True, help_text="Warehouse location (e.g., A-12-B)")

    # --- Relationships ---
    categories = models.ManyToManyField('Category', related_name="products",null=True, blank=True)
    supplier = models.CharField(max_length=255, null=True, blank=True, help_text="Supplier name or info")
    business = models.ForeignKey('Business', on_delete=models.CASCADE, related_name="inventory",  null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    # --- Status & Meta ---
    product_photo = models.FileField(upload_to='inventory/products/%Y/%m/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['part_number', 'brand']),
            models.Index(fields=['upc_code']),
        ]

    @property
    def average_price(self):
        avg = self.sales.filter(aproved=True).aggregate(avg=Avg('price_per_unit'))['avg']
        if avg is not None:
            return avg
        if self.min_price and self.max_price:
            return (self.min_price + self.max_price) / 2
        return self.min_price or self.max_price

    @property
    def available_stock(self):
        """Stock that is actually available to be sold."""
        return self.quantity_at_hand - self.quantity_allocated

    @property
    def stock_value_at_cost(self):
        """Total capital tied up in this product."""
        if self.buying_price is None:
            return None
        return self.quantity_at_hand * self.buying_price

    def update_stock_on_sale(self, quantity, total_price):
        """Reduces stock and checks for low-stock threshold after the deduction."""
        self.quantity_at_hand = F('quantity_at_hand') - quantity
        self.amount_collected = F('amount_collected') + total_price
        self.save(update_fields=['quantity_at_hand', 'amount_collected'])
        self.refresh_from_db()
        self._check_low_stock()

    def _check_low_stock(self):
        """Notifies admins if stock has fallen to ≤ 30% of the last refill quantity."""
        last_refill = self.refills.first()  # ordering = ['-created_at'] so .first() is newest
        if not last_refill or last_refill.quantity_after == 0:
            return
        threshold = int(last_refill.quantity_after * 0.30)
        if self.quantity_at_hand > threshold:
            return
        # Avoid duplicate unread alerts: skip if an unread low-stock alert already
        # exists for this product (identified by entity_id) for any admin.
        from notifications.models import Notification
        from notifications.utils import notify_admins
        already_alerted = Notification.objects.filter(
            notification_type=Notification.LOW_STOCK,
            entity_id=self.pk,
            is_read=False,
        ).exists()
        if not already_alerted:
            notify_admins(
                notification_type=Notification.LOW_STOCK,
                title=f"Low stock: {self.name}",
                message=(
                    f"{self.quantity_at_hand} unit"
                    f"{'s' if self.quantity_at_hand != 1 else ''} remaining — "
                    f"≤ 30% of last refill of {last_refill.quantity_after}."
                ),
                link=f"/products/{self.pk}/",
                entity_id=self.pk,
            )

    def __str__(self):
        return f"[{self.part_number}] {self.brand} {self.name}"
    
class Customer(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=False,blank=True)
    phone = models.CharField(max_length=15, blank=True)
    remaining_balance = models.IntegerField(default=0)
    debt_due_date = models.DateField(null=True, blank=True, help_text="Date by which the customer must clear their balance")
    
    def pay_balance(self, amount):
        self.remaining_balance = max(0, self.remaining_balance - amount)
        self.save()

    
    def __str__(self):
        return self.name

# ── Sale Order ───────────────────────────────────────────────────────────────
# Groups line items from a single cart checkout into one warehouse transaction.

class SaleOrder(models.Model):
    PENDING_APPROVAL = 'PENDING_APPROVAL'
    PENDING_PICKING  = 'PENDING_PICKING'
    PICKING          = 'PICKING'
    PARTIALLY_PICKED = 'PARTIALLY_PICKED'
    PICKED           = 'PICKED'
    VERIFIED         = 'VERIFIED'
    RE_PICK_REQUIRED = 'RE_PICK_REQUIRED'
    REJECTED         = 'REJECTED'
    DISPATCHED       = 'DISPATCHED'
    CANCELLED        = 'CANCELLED'

    STATUS_CHOICES = [
        (PENDING_APPROVAL, 'Pending Approval'),
        (PENDING_PICKING,  'Pending Picking'),
        (PICKING,          'Picking'),
        (PARTIALLY_PICKED, 'Partially Picked'),
        (PICKED,           'Picked'),
        (VERIFIED,         'Verified'),
        (RE_PICK_REQUIRED, 'Re-pick Required'),
        (REJECTED,         'Rejected'),
        (DISPATCHED,       'Dispatched'),
        (CANCELLED,        'Cancelled'),
    ]

    customer        = models.ForeignKey('Customer', null=True, blank=True, on_delete=models.SET_NULL, related_name='orders')
    created_by      = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sale_orders')
    workflow_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING_APPROVAL)
    notes           = models.TextField(blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)
    verified_by     = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='verified_orders')
    verified_at     = models.DateTimeField(null=True, blank=True)
    dispatched_at   = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    @property
    def order_code(self):
        return f"ZO{self.pk:03d}"

    @property
    def total_amount(self):
        from django.db.models import Sum
        return self.sales.aggregate(t=Sum('total_amount'))['t'] or Decimal('0')

    def transition(self, new_status, changed_by, note=''):
        old = self.workflow_status
        self.workflow_status = new_status
        self.save(update_fields=['workflow_status', 'updated_at'])
        SaleStatusHistory.objects.create(
            sale_order=self,
            from_status=old,
            to_status=new_status,
            changed_by=changed_by,
            note=note,
        )

    def __str__(self):
        return f"{self.order_code}"


# ── Sale (line item) ─────────────────────────────────────────────────────────

class Sale(models.Model):
    order          = models.ForeignKey('SaleOrder', null=True, blank=True, on_delete=models.SET_NULL, related_name='sales')
    product        = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="sales")
    quantity_sold  = models.PositiveIntegerField()
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount   = models.DecimalField(max_digits=12, decimal_places=2, editable=False)
    date_sold      = models.DateTimeField(auto_now_add=True)
    aproved        = models.BooleanField(default=False)
    deleted        = models.BooleanField(default=False)
    rejected       = models.BooleanField(default=False)
    created_by     = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="created_sales")
    customer       = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, related_name="sales")

    @property
    def sale_code(self):
        return f"ZC{self.pk:03d}"

    def __str__(self):
        return f"{self.sale_code} — {self.product.name} × {self.quantity_sold}"

    def save(self, *args, **kwargs):
        self.total_amount = self.quantity_sold * self.price_per_unit
        super().save(*args, **kwargs)
        if self.order_id is None:
            # Legacy path: reduce stock immediately (no warehouse workflow)
            self.product.update_stock_on_sale(self.quantity_sold, self.total_amount)
        


class Document(models.Model):
    DOC_TYPES = [('invoice', 'Invoice'), ('quotation', 'Quotation')]
    STATUSES  = [
        ('draft',     'Draft'),
        ('sent',      'Sent'),
        ('paid',      'Paid'),
        ('accepted',  'Accepted'),
        ('rejected',  'Rejected'),
        ('cancelled', 'Cancelled'),
    ]

    doc_type         = models.CharField(max_length=10, choices=DOC_TYPES, default='invoice')
    number           = models.CharField(max_length=30, unique=True, editable=False)
    customer         = models.ForeignKey('Customer', on_delete=models.PROTECT, related_name='documents')
    created_by       = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    status           = models.CharField(max_length=20, choices=STATUSES, default='draft')
    issue_date       = models.DateField()
    due_date         = models.DateField(null=True, blank=True)
    notes            = models.TextField(blank=True)
    terms            = models.TextField(blank=True)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    vat_percent      = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    customer_tin     = models.CharField(max_length=50, blank=True)
    subtotal         = models.DecimalField(max_digits=15, decimal_places=2, default=0, editable=False)
    discount_amount  = models.DecimalField(max_digits=15, decimal_places=2, default=0, editable=False)
    vat_amount       = models.DecimalField(max_digits=15, decimal_places=2, default=0, editable=False)
    total            = models.DecimalField(max_digits=15, decimal_places=2, default=0, editable=False)
    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.number:
            self.number = self._generate_number()
        super().save(*args, **kwargs)

    def _generate_number(self):
        from django.utils import timezone
        year   = timezone.now().year
        prefix = 'INV' if self.doc_type == 'invoice' else 'QUO'
        seq    = Document.objects.filter(doc_type=self.doc_type).count() + 1
        return f'{prefix}-{year}-{seq:04d}'

    def recompute_totals(self):
        subtotal   = sum(item.total for item in self.items.all())
        discount   = subtotal * (self.discount_percent / Decimal(100))
        after_disc = subtotal - discount
        vat        = after_disc * (self.vat_percent / Decimal(100))
        self.subtotal        = subtotal
        self.discount_amount = discount
        self.vat_amount      = vat
        self.total           = after_disc + vat
        self.save(update_fields=['subtotal', 'discount_amount', 'vat_amount', 'total'])

    def status_color(self):
        return {
            'draft':     'gray',
            'sent':      'blue',
            'paid':      'green',
            'accepted':  'green',
            'rejected':  'red',
            'cancelled': 'red',
        }.get(self.status, 'gray')

    def __str__(self):
        return f'{self.number} — {self.customer.name}'


class DocumentItem(models.Model):
    document    = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='items')
    product     = models.ForeignKey('Product', on_delete=models.SET_NULL, null=True, blank=True)
    description = models.CharField(max_length=255)
    unit        = models.CharField(max_length=20, default='PCS')
    quantity    = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit_price  = models.DecimalField(max_digits=12, decimal_places=2)
    total       = models.DecimalField(max_digits=15, decimal_places=2, default=0, editable=False)

    def save(self, *args, **kwargs):
        self.total = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.description} ×{self.quantity}'


@receiver(post_save, sender=Product)
@receiver(post_delete, sender=Product)
def clear_product_cache(sender, instance, **kwargs):
    cache.delete('product_list')

@receiver(post_save, sender=Sale)
@receiver(post_delete, sender=Sale)
def clear_sales_cache(sender, instance, **kwargs):
    cache.delete('sales_summary')


# ── Picking Order ─────────────────────────────────────────────────────────────

class PickingOrder(models.Model):
    PENDING          = 'PENDING'
    ACCEPTED         = 'ACCEPTED'
    PARTIALLY_PICKED = 'PARTIALLY_PICKED'
    COMPLETED        = 'COMPLETED'
    CANCELLED        = 'CANCELLED'

    STATUS_CHOICES = [
        (PENDING,          'Pending'),
        (ACCEPTED,         'In Progress'),
        (PARTIALLY_PICKED, 'Partially Picked'),
        (COMPLETED,        'Completed'),
        (CANCELLED,        'Cancelled'),
    ]

    sale_order   = models.ForeignKey(SaleOrder, on_delete=models.CASCADE, related_name='picking_orders')
    picker       = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='picking_assignments')
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)
    notes        = models.TextField(blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    accepted_at  = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    @property
    def picking_code(self):
        return f"PK{self.pk:03d}"

    @property
    def is_fully_picked(self):
        return self.items.exists() and all(item.is_complete for item in self.items.all())

    def __str__(self):
        return f"{self.picking_code}"


class PickingOrderItem(models.Model):
    picking_order = models.ForeignKey(PickingOrder, on_delete=models.CASCADE, related_name='items')
    sale          = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='picking_items')
    product       = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='picking_items')
    requested_qty = models.PositiveIntegerField()
    picked_qty    = models.PositiveIntegerField(default=0)
    notes         = models.TextField(blank=True)

    @property
    def is_complete(self):
        return self.picked_qty >= self.requested_qty

    @property
    def shortfall(self):
        return max(0, self.requested_qty - self.picked_qty)

    def __str__(self):
        return f"{self.product.name}: {self.picked_qty}/{self.requested_qty}"


# ── Gate Pass ─────────────────────────────────────────────────────────────────

class GatePass(models.Model):
    sale_order       = models.OneToOneField(SaleOrder, on_delete=models.CASCADE, related_name='gate_pass')
    gate_pass_number = models.CharField(max_length=20, unique=True, blank=True)
    picking_order    = models.ForeignKey(PickingOrder, null=True, blank=True, on_delete=models.SET_NULL, related_name='gate_passes')
    verified_by      = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='verified_gate_passes')
    issued_at        = models.DateTimeField(auto_now_add=True)
    is_used          = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.gate_pass_number:
            super().save(*args, **kwargs)
            GatePass.objects.filter(pk=self.pk).update(gate_pass_number=f"GP{self.pk:04d}")
            self.gate_pass_number = f"GP{self.pk:04d}"
        else:
            super().save(*args, **kwargs)

    @property
    def gp_code(self):
        return self.gate_pass_number or f"GP{self.pk:04d}"

    def __str__(self):
        return self.gp_code


class GatePassItem(models.Model):
    gate_pass     = models.ForeignKey(GatePass, on_delete=models.CASCADE, related_name='items')
    product       = models.ForeignKey(Product, on_delete=models.PROTECT)
    requested_qty = models.PositiveIntegerField()
    picked_qty    = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.product.name} × {self.picked_qty}"


# ── Status Audit Log ──────────────────────────────────────────────────────────

class SaleStatusHistory(models.Model):
    sale_order  = models.ForeignKey(SaleOrder, on_delete=models.CASCADE, related_name='history')
    from_status = models.CharField(max_length=20, blank=True)
    to_status   = models.CharField(max_length=20)
    changed_by  = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='status_changes')
    note        = models.TextField(blank=True)
    changed_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['changed_at']

    def __str__(self):
        return f"{self.sale_order.order_code}: {self.from_status} → {self.to_status}"


# ── Stock Refill ──────────────────────────────────────────────────────────────

class StockRefill(models.Model):
    product        = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='refills')
    quantity_added = models.PositiveIntegerField()
    quantity_after = models.PositiveIntegerField()  # stock level right after this refill (the new baseline)
    refilled_by    = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='stock_refills')
    notes          = models.TextField(blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"+{self.quantity_added} × {self.product.name} → {self.quantity_after} total"



