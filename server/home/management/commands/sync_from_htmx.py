import os
import shutil
import sqlite3
from django.core.management.base import BaseCommand
from django.conf import settings
from home.models import Product, Category

HTMX_DB   = os.path.join(os.path.dirname(settings.BASE_DIR), 'htmx_server', 'db3.sqlite3')
HTMX_MEDIA = os.path.join(os.path.dirname(settings.BASE_DIR), 'htmx_server', 'inventory')


class Command(BaseCommand):
    help = 'Sync products (including photos) from htmx_server into this project'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Delete all existing products first')

    def handle(self, *args, **options):
        if options['clear']:
            deleted, _ = Product.objects.all().delete()
            self.stdout.write(f'Cleared {deleted} existing products.')

        conn = sqlite3.connect(HTMX_DB)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()

        # Load category mapping: htmx id → local Category instance
        cur.execute('SELECT id, name FROM home_category')
        category_map = {}
        for row in cur.fetchall():
            cat, _ = Category.objects.get_or_create(name=row['name'])
            category_map[row['id']] = cat

        # Load products
        cur.execute('''
            SELECT p.*,
                   GROUP_CONCAT(pc.category_id) AS cat_ids
            FROM home_product p
            LEFT JOIN home_product_categories pc ON pc.product_id = p.id
            GROUP BY p.id
            ORDER BY p.id
        ''')
        rows = cur.fetchall()
        conn.close()

        created = updated = skipped = 0
        os.makedirs(settings.MEDIA_ROOT, exist_ok=True)

        for row in rows:
            # Resolve photo
            photo_field = ''
            if row['product_photo']:
                src = os.path.join(HTMX_MEDIA, row['product_photo'])
                if os.path.exists(src):
                    dest = os.path.join(settings.MEDIA_ROOT, row['product_photo'])
                    os.makedirs(os.path.dirname(dest), exist_ok=True)
                    if not os.path.exists(dest):
                        shutil.copy2(src, dest)
                    photo_field = row['product_photo']

            defaults = dict(
                name=row['name'] or '',
                description=row['description'] or '',
                brand=row['brand'] or '',
                part_number=row['part_number'] or '',
                upc_code=row['upc_code'] or '',
                buying_price=row['buying_price'],
                min_price=row['min_price'],
                max_price=row['max_price'],
                quantity_at_hand=row['quantity_at_hand'] or 0,
                quantity_allocated=row['quantity_allocated'] or 0,
                reorder_point=row['reorder_point'] or 10,
                is_active=bool(row['is_active']),
                product_photo=photo_field,
            )

            obj, was_created = Product.objects.update_or_create(
                part_number=row['part_number'] or '',
                name=row['name'] or '',
                defaults=defaults,
            )

            # Sync categories
            if row['cat_ids']:
                cat_ids = [int(x) for x in row['cat_ids'].split(',')]
                cats = [category_map[cid] for cid in cat_ids if cid in category_map]
                obj.categories.set(cats)

            if was_created:
                created += 1
            else:
                updated += 1

        self.stdout.write(self.style.SUCCESS(
            f'Done. Created: {created}, Updated: {updated}, Skipped: {skipped}'
        ))
