import { Link } from 'react-router'
import type { CatalogItem } from '../lib/catalog'

export function ItemImage({ item, className = '' }: { item: CatalogItem; className?: string }) {
  if (item.image) {
    return (
      <img
        src={item.image}
        alt={item.name.toLowerCase()}
        loading="lazy"
        className={`h-full w-full bg-bone object-contain ${className}`}
      />
    )
  }
  return (
    <div className={`flex h-full w-full flex-col items-center justify-center gap-3 bg-seam ${className}`}>
      <span className="h-2 w-2 rotate-45 bg-gold/60" aria-hidden />
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ash">No photo — ask us</span>
    </div>
  )
}

export default function ItemCard({ item, categoryId }: { item: CatalogItem; categoryId: string }) {
  return (
    <Link
      to={`/catalog/${categoryId}/${item.id}`}
      data-cursor="VIEW"
      className="group flex h-full flex-col border border-bone/10 bg-strata transition-colors duration-300 hover:border-gold/50"
    >
      <div className="img-frame aspect-[4/3] shrink-0">
        <ItemImage item={item} />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-sm font-extrabold leading-tight tracking-wide text-bone">
          {item.name}
        </h3>
        <p className="mt-auto font-mono text-[9px] uppercase tracking-[0.18em] text-ash">
          {item.variants.length > 1
            ? `${item.variants.length} sizes`
            : item.variants[0] || 'On request'}
        </p>
      </div>
    </Link>
  )
}
