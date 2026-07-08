import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { CATALOG, TOTAL_ITEMS, searchItems } from '../lib/catalog'
import { Reveal, RevealHeading } from '../components/ui'
import ItemCard, { ItemImage } from '../components/ItemCard'
import CtaFooter from '../sections/CtaFooter'

function CategoryCard({ id, label, count, image }: { id: string; label: string; count: number; image: string | null }) {
  return (
    <Link
      to={`/catalog/${id}`}
      data-cursor="OPEN"
      className="group flex flex-col border border-bone/10 bg-strata transition-colors duration-300 hover:border-gold/50"
    >
      <div className="img-frame aspect-[16/10]">
        <ItemImage item={{ id, name: label, image, variants: [] }} />
      </div>
      <div className="flex items-baseline justify-between gap-3 p-5">
        <h2 className="font-display text-xl font-extrabold tracking-tight text-bone md:text-2xl">{label}</h2>
        <span className="whitespace-nowrap font-mono text-[10px] tracking-[0.16em] text-gold">
          {count} LINES
        </span>
      </div>
    </Link>
  )
}

export default function CatalogIndex() {
  const [query, setQuery] = useState('')
  const results = useMemo(() => searchItems(query), [query])
  const searching = query.trim().length >= 2

  return (
    <>
      <main className="bg-basalt pb-28 pt-32 md:pt-40">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10">
          <p className="eyebrow mb-4 text-gold">07 — CATALOG</p>
          {/* lg right padding keeps copy clear of the fixed depth meter */}
          <div className="flex flex-wrap items-end justify-between gap-8 lg:pr-20">
            <RevealHeading as="h1" className="display max-w-[10ch] text-[clamp(2.8rem,6.5vw,6rem)] text-bone">
              The stock list
            </RevealHeading>
            <Reveal delay={0.1} className="max-w-sm">
              <p className="text-sm leading-relaxed text-smoke">
                {TOTAL_ITEMS.toLocaleString('en-US')} lines held at the Pamba Road depot,
                exactly as they sit on the shelf. No prices shown — ask and we quote same-day.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.15} className="mt-12 lg:pr-20">
            <label className="flex items-center gap-4 border-b border-bone/20 pb-4 focus-within:border-gold">
              <span className="font-mono text-xs text-gold" aria-hidden>⌕</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH THE SHELF — 'KNIFE VALVE', 'DN300', 'SAFETY BOOT'…"
                aria-label="Search the catalog"
                className="w-full bg-transparent font-mono text-sm uppercase tracking-[0.08em] text-bone outline-none placeholder:text-ash/60"
              />
              {searching && (
                <span className="whitespace-nowrap font-mono text-[10px] tracking-[0.16em] text-ash">
                  {results.length}{results.length >= 60 ? '+' : ''} HITS
                </span>
              )}
            </label>
          </Reveal>

          {searching ? (
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
              {results.map(({ item, category }) => (
                <ItemCard key={`${category.id}-${item.id}`} item={item} categoryId={category.id} />
              ))}
              {results.length === 0 && (
                <p className="col-span-full py-16 text-center font-mono text-xs uppercase tracking-[0.2em] text-ash">
                  Nothing on the shelf under that name — send it to us anyway.
                </p>
              )}
            </div>
          ) : (
            <div className="mt-14 grid gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-3">
              {CATALOG.map((category, i) => (
                <Reveal key={category.id} delay={(i % 3) * 0.07}>
                  <CategoryCard
                    id={category.id}
                    label={category.label}
                    count={category.items.length}
                    image={category.items.find((item) => item.image)?.image ?? null}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </main>
      <CtaFooter />
    </>
  )
}
