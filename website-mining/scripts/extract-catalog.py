#!/usr/bin/env python3
"""Extract the product catalog from MINING LIST 2.xlsx.

Reads the stock list workbook (items, size/model variants, category header
rows) plus the embedded product photos anchored to rows, and emits:

  - src/lib/catalog.json            (categories -> items -> variants)
  - public/images/products/*.jpg    (photos, downscaled for the web)

Run from the website-mining directory whenever the stock list changes:

  python3 scripts/extract-catalog.py [path-to-xlsx]
"""

import io
import json
import re
import sys
import zipfile
from html import unescape
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
XLSX = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT.parent / 'MINING LIST 2.xlsx'
OUT_JSON = ROOT / 'src' / 'lib' / 'catalog.json'
OUT_IMAGES = ROOT / 'public' / 'images' / 'products'
MAX_PX = 800
JPEG_QUALITY = 78

# Sheet layout: A = NO. (and two section headers), B = PICTURE (and most
# section headers), C = ITEM, D = SIZE/MODEL, E/F = PRICE (ignored), G = STOCK.
# Header strings as they appear in columns A/B (normalised: collapsed
# whitespace, uppercased). Rows after a header belong to that category.
CATEGORY_HEADERS = {
    'PUMPS': ('pumps', 'Pumps'),
    'BLOWERS': ('blowers', 'Blowers & Fans'),
    # the sheet files valves, butterflies and washers under this header too
    'GEAR MOTORS': ('gear-motors', 'Motors & Flow Control'),
    'MACHINES & SPARE PARTS': ('machines', 'Machines & Spare Parts'),
    'KAMBA': ('ropes', 'Ropes & Rigging'),
    'TOOLS & SPANNERS': ('tools', 'Tools & Spanners'),
    'FIRE FIGHTING TOOLS': ('fire', 'Fire Fighting'),
    # this section also carries the SS/MS/copper fitting ranges
    'COMPRESSORS AND AIR TANKS': ('compressors', 'Compressors, Air & Fittings'),
    'SAFETY WEARING GARMENTS & SAFETY TOOLS': ('safety', 'Safety Gear'),
    'WINCHES': ('winches', 'Winches & Hoists'),
}
# Title/legend rows that must not become products or categories.
JUNK_HEADERS = {'MINING TOOLS LIST', 'STOCK', 'PICTURE', 'ITEM', 'SIZE', 'NO.', 'PRICE'}
GENERAL = ('general', 'General Site Supply')

CATEGORY_ORDER = ['general', 'pumps', 'blowers', 'gear-motors', 'machines',
                  'compressors', 'winches', 'fire', 'safety', 'tools', 'ropes']


def norm(text: str) -> str:
    return re.sub(r'\s+', ' ', text).strip()


def slugify(text: str) -> str:
    slug = re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')
    return slug or 'item'


def cell_ref_col(ref: str) -> str:
    return re.match(r'[A-Z]+', ref).group(0)


def main() -> None:
    z = zipfile.ZipFile(XLSX)
    shared = re.findall(r'<si>(.*?)</si>', z.read('xl/sharedStrings.xml').decode(), re.S)

    def si_text(si: str) -> str:
        return unescape(''.join(re.findall(r'<t[^>]*>([^<]*)</t>', si)))

    strings = [si_text(si) for si in shared]

    # ---- sheet rows -> {row_number: {col: text}} --------------------------
    sheet = z.read('xl/worksheets/sheet1.xml').decode()
    rows: dict[int, dict[str, str]] = {}
    for row_match in re.finditer(r'<row r="(\d+)"[^>]*>(.*?)</row>', sheet, re.S):
        number = int(row_match.group(1))
        cells: dict[str, str] = {}
        # cells may be self-closing (<c r="A3" s="1"/>) — never let one of those
        # swallow the following cell's <v> value
        for ref, attrs, inner in re.findall(
                r'<c r="([A-Z]+\d+)"([^>]*?)(?:/>|>(.*?)</c>)', row_match.group(2), re.S):
            value_match = re.search(r'<v>([^<]*)</v>', inner)
            if not value_match:
                continue
            value = value_match.group(1)
            if 't="s"' in attrs:
                value = strings[int(value)]
            cells[cell_ref_col(ref)] = value
        if cells:
            rows[number] = cells

    # ---- walk rows: headers, products, variants ---------------------------
    categories: dict[str, dict] = {
        cid: {'id': cid, 'label': label, 'items': []}
        for cid, label in [GENERAL, *CATEGORY_HEADERS.values()]
    }
    current_category = GENERAL[0]
    current_product: dict | None = None
    product_rows: list[tuple[int, int, dict]] = []  # (start_row, end_row, product)
    used_slugs: dict[str, int] = {}

    def close_product(end_row: int) -> None:
        nonlocal current_product
        if current_product is not None:
            product_rows.append((current_product.pop('_start'), end_row, current_product))
            current_product = None

    for number in sorted(rows):
        cells = rows[number]
        header = norm(cells.get('A', '')).upper() or norm(cells.get('B', '')).upper()
        item = norm(cells.get('C', ''))
        size = norm(cells.get('D', ''))

        if header in CATEGORY_HEADERS and not item:
            close_product(number - 1)
            current_category = CATEGORY_HEADERS[header][0]
            continue
        if item.upper() in JUNK_HEADERS:
            close_product(number - 1)
            continue

        if item:
            # repeated name rows (e.g. FIRE EXTINGUISHER listed once per size)
            # extend the open product instead of starting a duplicate
            if current_product is not None and item.upper() == current_product['name'].upper():
                if size:
                    current_product['variants'].append(size)
                continue
            close_product(number - 1)
            slug = slugify(item)
            used_slugs[slug] = used_slugs.get(slug, 0) + 1
            if used_slugs[slug] > 1:
                slug = f'{slug}-{used_slugs[slug]}'
            current_product = {
                'id': slug,
                'name': item,
                'image': None,
                'variants': [size] if size else [],
                '_start': number,
            }
            categories[current_category]['items'].append(current_product)
        elif size and current_product is not None:
            current_product['variants'].append(size)

    close_product(max(rows))

    # ---- images: anchor row -> product ------------------------------------
    rels = dict(re.findall(
        r'Id="(rId\d+)"[^>]*Target="\.\./media/([^"]+)"',
        z.read('xl/drawings/_rels/drawing1.xml.rels').decode(),
    ))
    drawing = z.read('xl/drawings/drawing1.xml').decode()
    anchors = []
    for anchor in re.findall(r'<xdr:twoCellAnchor.*?</xdr:twoCellAnchor>', drawing, re.S):
        row_match = re.search(r'<xdr:from>.*?<xdr:row>(\d+)</xdr:row>', anchor, re.S)
        embed_match = re.search(r'r:embed="(rId\d+)"', anchor)
        if row_match and embed_match and embed_match.group(1) in rels:
            anchors.append((int(row_match.group(1)) + 1, rels[embed_match.group(1)]))  # 1-based row

    OUT_IMAGES.mkdir(parents=True, exist_ok=True)
    matched = unmatched = skipped = 0
    for anchor_row, media_name in sorted(anchors):
        product = next(
            (p for start, end, p in product_rows if start <= anchor_row <= end), None)
        if product is None:
            unmatched += 1
            continue
        if product['image'] is not None:
            skipped += 1
            continue
        try:
            image = Image.open(io.BytesIO(z.read(f'xl/media/{media_name}'))).convert('RGB')
        except Exception as error:
            print(f'  ! {media_name}: {error}', file=sys.stderr)
            unmatched += 1
            continue
        image.thumbnail((MAX_PX, MAX_PX))
        dest = OUT_IMAGES / f'{product["id"]}.jpg'
        image.save(dest, 'JPEG', quality=JPEG_QUALITY, optimize=True, progressive=True)
        product['image'] = f'/images/products/{product["id"]}.jpg'
        matched += 1

    # ---- emit --------------------------------------------------------------
    output = [
        categories[cid] for cid in CATEGORY_ORDER
        if categories[cid]['items']
    ]
    OUT_JSON.write_text(json.dumps(output, indent=1, ensure_ascii=False) + '\n')

    total_items = sum(len(c['items']) for c in output)
    total_bytes = sum(f.stat().st_size for f in OUT_IMAGES.glob('*.jpg'))
    print(f'{len(output)} categories, {total_items} items -> {OUT_JSON.relative_to(ROOT)}')
    for category in output:
        with_image = sum(1 for i in category['items'] if i['image'])
        print(f"  {category['id']:<12} {len(category['items']):>3} items  ({with_image} with photo)")
    print(f'images: {matched} matched, {skipped} extra skipped, {unmatched} unmatched, '
          f'{total_bytes / 1e6:.1f} MB in {OUT_IMAGES.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
