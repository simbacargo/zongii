from django.db import migrations


# Reusable correlated subquery that aggregates a product's category names into
# a single space-separated string. `{pid}` is substituted per trigger context.
CATEGORIES_SUBQUERY = (
    "(SELECT IFNULL(GROUP_CONCAT(c.name, ' '), '') "
    " FROM home_category c "
    " JOIN home_product_categories pc ON pc.category_id = c.id "
    " WHERE pc.product_id = {pid})"
)

FTS_COLUMNS = (
    "name, brand, part_number, upc_code, description, "
    "material, supplier, bin_location, categories"
)


def _insert_select(pid_expr):
    """INSERT ... SELECT row body used by the insert/update triggers."""
    return (
        f"INSERT INTO product_fts(rowid, {FTS_COLUMNS}) "
        f"VALUES ({pid_expr}.id, {pid_expr}.name, {pid_expr}.brand, "
        f"{pid_expr}.part_number, {pid_expr}.upc_code, {pid_expr}.description, "
        f"{pid_expr}.material, COALESCE({pid_expr}.supplier, ''), "
        f"{pid_expr}.bin_location, "
        f"{CATEGORIES_SUBQUERY.format(pid=pid_expr + '.id')});"
    )


SQL = [
    # ── FTS5 virtual table ──
    f"CREATE VIRTUAL TABLE IF NOT EXISTS product_fts USING fts5("
    f"{FTS_COLUMNS}, tokenize='unicode61 remove_diacritics 2');",

    # ── Initial population from existing products ──
    f"INSERT INTO product_fts(rowid, {FTS_COLUMNS}) "
    f"SELECT p.id, p.name, p.brand, p.part_number, p.upc_code, p.description, "
    f"p.material, COALESCE(p.supplier, ''), p.bin_location, "
    f"{CATEGORIES_SUBQUERY.format(pid='p.id')} "
    f"FROM home_product p;",

    # ── Keep FTS in sync with home_product ──
    f"CREATE TRIGGER product_fts_ai AFTER INSERT ON home_product BEGIN "
    f"{_insert_select('new')} END;",

    "CREATE TRIGGER product_fts_ad AFTER DELETE ON home_product BEGIN "
    "DELETE FROM product_fts WHERE rowid = old.id; END;",

    f"CREATE TRIGGER product_fts_au AFTER UPDATE ON home_product BEGIN "
    f"DELETE FROM product_fts WHERE rowid = old.id; "
    f"{_insert_select('new')} END;",

    # ── Recompute a product's category text when its M2M links change ──
    f"CREATE TRIGGER product_fts_cat_ai AFTER INSERT ON home_product_categories BEGIN "
    f"UPDATE product_fts SET categories = "
    f"{CATEGORIES_SUBQUERY.format(pid='new.product_id')} "
    f"WHERE rowid = new.product_id; END;",

    f"CREATE TRIGGER product_fts_cat_ad AFTER DELETE ON home_product_categories BEGIN "
    f"UPDATE product_fts SET categories = "
    f"{CATEGORIES_SUBQUERY.format(pid='old.product_id')} "
    f"WHERE rowid = old.product_id; END;",

    # ── Refresh affected products when a category is renamed ──
    f"CREATE TRIGGER product_fts_catname_au AFTER UPDATE ON home_category BEGIN "
    f"UPDATE product_fts SET categories = "
    f"{CATEGORIES_SUBQUERY.format(pid='product_fts.rowid')} "
    f"WHERE rowid IN (SELECT product_id FROM home_product_categories "
    f"WHERE category_id = new.id); END;",
]

REVERSE_SQL = [
    "DROP TRIGGER IF EXISTS product_fts_catname_au;",
    "DROP TRIGGER IF EXISTS product_fts_cat_ad;",
    "DROP TRIGGER IF EXISTS product_fts_cat_ai;",
    "DROP TRIGGER IF EXISTS product_fts_au;",
    "DROP TRIGGER IF EXISTS product_fts_ad;",
    "DROP TRIGGER IF EXISTS product_fts_ai;",
    "DROP TABLE IF EXISTS product_fts;",
]


class Migration(migrations.Migration):

    dependencies = [
        ("home", "0010_add_vat_to_document"),
    ]

    operations = [
        migrations.RunSQL(sql=SQL, reverse_sql=REVERSE_SQL),
    ]
