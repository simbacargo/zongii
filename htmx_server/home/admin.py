from django.contrib import admin
from .models import Category,Business,Product,Customer,SaleOrder,Sale,Document,DocumentItem,PickingOrder,PickingOrderItem,GatePass,GatePassItem,SaleStatusHistory,StockRefill


# class ProductAdmin(admin.ModelAdmin):
#     list_display = ('name', 'created_by', 'price', 'part_number', 'quantity', 'deleted')
#     search_fields = ('name', 'created_by', 'part_number')
#     list_filter = ('created_by', 'deleted')
#     ordering = ('name',)
    

# class SaleAdmin(admin.ModelAdmin):
#     list_display = ( 'quantity_sold', 'date_sold', 'aproved')
#     list_display = ('product', 'quantity_sold', 'created_by','date_sold', 'customer', 'aproved')
#     search_fields = ( 'quantity_sold', 'date_sold', 'aproved')
#     list_filter = ( 'quantity_sold', 'date_sold', 'aproved')
#     ordering = ( 'quantity_sold', 'date_sold', 'aproved')
#     list_editable = ("quantity_sold", "created_by", "aproved")


admin.site.register(Category)
admin.site.register(Business)
admin.site.register(Product)
admin.site.register(Customer)
admin.site.register(SaleOrder)
admin.site.register(Sale)
admin.site.register(Document)
admin.site.register(DocumentItem)
admin.site.register(PickingOrder)
admin.site.register(PickingOrderItem)
admin.site.register(GatePass)
admin.site.register(GatePassItem)
admin.site.register(SaleStatusHistory)
admin.site.register(StockRefill)