import { Link, Navigate, useParams } from 'react-router'
import { getCategory } from '../lib/catalog'
import { getCategoryCopy, getEnrichment } from '../lib/enrichment'
import { COMPANY } from '../lib/data'
import { Reveal, RevealHeading } from '../components/ui'
import ItemCard from '../components/ItemCard'
import ProductScene from '../three/ProductScene'
import CtaFooter from '../sections/CtaFooter'

export default function Product() {
  const { categoryId, itemId } = useParams()
  const category = getCategory(categoryId)
  if (!category) return <Navigate to="/catalog" replace />

  const item = category.items.find((i) => i.id === itemId)
  if (!item) return <Navigate to={`/catalog/${category.id}`} replace />

  const related = category.items.filter((i) => i.id !== item.id).slice(0, 4)

  const enrichment = getEnrichment(category.id, item.id)
  const description = enrichment.description ?? getCategoryCopy(category.id)

  const idx = category.items.findIndex((i) => i.id === item.id)
  const count = category.items.length
  const prev = count > 1 ? category.items[(idx - 1 + count) % count] : null
  const next = count > 1 ? category.items[(idx + 1) % count] : null

  const whatsapp = `https://wa.me/${COMPANY.phones[0].replace(/\D/g, '')}?text=${encodeURIComponent(
    `Quote: ${item.name}`,
  )}`

  return (
    <>
      <main className="bg-basalt pb-28 pt-32 md:pt-40">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ash">
            <Link to="/catalog" className="transition-colors hover:text-gold">
              Catalog
            </Link>
            {' / '}
            <Link to={`/catalog/${category.id}`} className="transition-colors hover:text-gold">
              {category.label}
            </Link>
            {' / '}
            <span className="text-smoke">{item.name}</span>
          </p>

          <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal className="relative aspect-square border border-bone/10 bg-strata lg:aspect-auto lg:min-h-[520px]">
              <ProductScene image={item.image} />
            </Reveal>

            <div className="flex flex-col">
              <p className="eyebrow mb-3 text-gold">{category.label.toUpperCase()}</p>
              <RevealHeading as="h1" className="display text-[clamp(2.4rem,4.5vw,4rem)] text-bone">
                {item.name}
              </RevealHeading>

              {description && (
                <p className="mt-5 max-w-prose text-sm leading-relaxed text-smoke">{description}</p>
              )}

              {enrichment.specs && enrichment.specs.length > 0 && (
                <div className="mt-8 border-t border-bone/10 pt-6">
                  <p className="eyebrow mb-3 text-ash">Duty & build</p>
                  <ul className="grid gap-2">
                    {enrichment.specs.map((spec) => (
                      <li
                        key={spec}
                        className="flex items-center gap-2.5 font-mono text-xs tracking-[0.06em] text-smoke"
                      >
                        <span className="h-1 w-1 shrink-0 rotate-45 bg-gold/70" aria-hidden />
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-8 border-t border-bone/10 pt-6">
                <p className="eyebrow mb-3 text-ash">Sizes & models on the shelf</p>
                {item.variants.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {item.variants.map((variant, i) => (
                      <li
                        key={`${variant}-${i}`}
                        className="border border-bone/15 px-3 py-1.5 font-mono text-[11px] tracking-[0.06em] text-smoke transition-colors hover:border-gold/60 hover:text-bone"
                      >
                        {variant}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="font-mono text-xs tracking-[0.06em] text-smoke">
                    Sold per unit — tell us the duty and we'll size it.
                  </p>
                )}
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <a
                  href={`mailto:${COMPANY.emailSales}?subject=${encodeURIComponent(`Quote: ${item.name}`)}`}
                  data-cursor="QUOTE"
                  className="inline-block bg-gold px-7 py-4 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-basalt transition-colors hover:bg-gold-hot"
                >
                  Request price
                </a>
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="QUOTE"
                  className="inline-block border border-gold/60 px-7 py-4 font-mono text-xs uppercase tracking-[0.16em] text-gold transition-colors hover:bg-gold hover:text-basalt"
                >
                  WhatsApp us
                </a>
                <Link
                  to={`/catalog/${category.id}`}
                  className="inline-block border border-bone/25 px-7 py-4 font-mono text-xs uppercase tracking-[0.16em] text-bone transition-colors hover:border-gold hover:text-gold"
                >
                  ← Back to {category.label}
                </Link>
              </div>
            </div>
          </div>

          {prev && next && (
            <div className="mt-16 flex items-center justify-between gap-6 border-t border-bone/10 pt-5">
              <Link
                to={`/catalog/${category.id}/${prev.id}`}
                className="flex min-w-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ash transition-colors hover:text-gold"
              >
                <span aria-hidden>←</span>
                <span className="truncate">Prev: {prev.name}</span>
              </Link>
              <Link
                to={`/catalog/${category.id}/${next.id}`}
                className="flex min-w-0 items-center gap-2 text-right font-mono text-[10px] uppercase tracking-[0.18em] text-ash transition-colors hover:text-gold"
              >
                <span className="truncate">Next: {next.name}</span>
                <span aria-hidden>→</span>
              </Link>
            </div>
          )}

          {related.length > 0 && (
            <div className="mt-28">
              <RevealHeading className="display text-[clamp(1.6rem,2.6vw,2.2rem)] text-bone">
                {`More from ${category.label}`}
              </RevealHeading>
              <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                {related.map((entry, i) => (
                  <Reveal key={entry.id} delay={(i % 4) * 0.05} y={24}>
                    <ItemCard item={entry} categoryId={category.id} />
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <CtaFooter />
    </>
  )
}
