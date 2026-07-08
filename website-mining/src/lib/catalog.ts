import raw from './catalog.json'

export interface CatalogItem {
  id: string
  name: string
  image: string | null
  variants: string[]
}

export interface CatalogCategory {
  id: string
  label: string
  items: CatalogItem[]
}

export const CATALOG = raw as CatalogCategory[]

export const TOTAL_ITEMS = CATALOG.reduce((n, c) => n + c.items.length, 0)

export function getCategory(id: string | undefined): CatalogCategory | undefined {
  return CATALOG.find((c) => c.id === id)
}

export function searchItems(query: string): { item: CatalogItem; category: CatalogCategory }[] {
  const q = query.trim().toUpperCase()
  if (q.length < 2) return []
  const hits: { item: CatalogItem; category: CatalogCategory }[] = []
  for (const category of CATALOG) {
    for (const item of category.items) {
      if (item.name.toUpperCase().includes(q) || item.variants.some((v) => v.toUpperCase().includes(q))) {
        hits.push({ item, category })
        if (hits.length >= 60) return hits
      }
    }
  }
  return hits
}
