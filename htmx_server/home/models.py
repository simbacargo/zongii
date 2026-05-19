import os
from django.db import models
from django.core.cache import cache
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import F
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
        """
        Handles the sale of an item.
        Increments amount_collected and reduces quantity_at_hand.
        """
        self.quantity_at_hand = F('quantity_at_hand') - quantity
        self.amount_collected = F('amount_collected') + total_price
        self.save(update_fields=['quantity_at_hand', 'amount_collected'])
        self.refresh_from_db()

    def __str__(self):
        return f"[{self.part_number}] {self.brand} {self.name}"
    
class Customer(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=False,blank=True)
    phone = models.CharField(max_length=15, blank=True)
    remaining_balance = models.IntegerField(default=0)
    
    def pay_balance(self, amount):
        self.remaining_balance = max(0, self.remaining_balance - amount)
        self.save()

    
    def __str__(self):
        return self.name

class Sale(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="sales")
    quantity_sold = models.PositiveIntegerField()
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, editable=False)
    date_sold = models.DateTimeField(auto_now_add=True)
    aproved = models.BooleanField(default=False,)
    deleted = models.BooleanField(default=False,)
    rejected = models.BooleanField(default=False,)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="created_sales")
    customer = models.ForeignKey(
        Customer, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name="sales"
    )

    def __str__(self):
        return f"Sale of {self.product.name} - {self.quantity_sold} units"

    def save(self, *args, **kwargs):
        # Auto-calculate total amount
        self.total_amount = self.quantity_sold * self.price_per_unit
        super().save(*args, **kwargs)
        # Update product after saving sale
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
    subtotal         = models.DecimalField(max_digits=15, decimal_places=2, default=0, editable=False)
    discount_amount  = models.DecimalField(max_digits=15, decimal_places=2, default=0, editable=False)
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
        subtotal = sum(item.total for item in self.items.all())
        discount = subtotal * (self.discount_percent /Decimal(100) )
        self.subtotal       = subtotal
        self.discount_amount = discount
        self.total          = subtotal - discount
        self.save(update_fields=['subtotal', 'discount_amount', 'total'])

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
    print("Product cache cleared.")

@receiver(post_save, sender=Sale)
@receiver(post_delete, sender=Sale)
def clear_sales_cache(sender, instance, **kwargs):
    cache.delete('sales_summary')
    print("Product cache cleared.")

