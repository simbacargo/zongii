import { Link, Navigate, useParams } from 'react-router'
import { getCategory } from '../lib/catalog'
import { COMPANY, getEquipmentLine } from '../lib/data'
import { Reveal, RevealHeading } from '../components/ui'
import ItemCard from '../components/ItemCard'
import CtaFooter from '../sections/CtaFooter'

export default function EquipmentLine() {
  const { lineId } = useParams()
  const line = getEquipmentLine(lineId)
  if (!line) return <Navigate to="/" replace />

  const category = getCategory(line.catalogCategory)
  const featured = category
    ? [...category.items].sort((a, b) => Number(!!b.image) - Number(!!a.image)).slice(0, 8)
    : []

  return (
    <>
      <main className="bg-basalt pb-28 pt-32 md:pt-40">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ash">
            <Link to="/" className="transition-colors hover:text-gold">
              Home
            </Link>
            {' / '}
            <span className="text-smoke">{line.name}</span>
          </p>

          <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal className="relative border border-bone/10 bg-strata">
              <div className="aspect-[4/3] overflow-hidden lg:aspect-auto lg:h-full lg:min-h-[520px]">
                <img src={line.image} alt={line.name} className="h-full w-full object-cover" />
              </div>
            </Reveal>

            <div className="flex flex-col">
              <p className="eyebrow mb-3 text-gold">{line.index} — EQUIPMENT</p>
              <RevealHeading as="h1" className="display text-[clamp(2.4rem,4.5vw,4rem)] text-bone">
                {line.name}
              </RevealHeading>

              <p className="mt-5 max-w-prose text-sm leading-relaxed text-smoke">{line.blurb}</p>

              <div className="mt-8 border-t border-bone/10 pt-6">
                <p className="eyebrow mb-3 text-ash">On the shelf now</p>
                <ul className="grid gap-2">
                  {line.specs.map((spec) => (
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

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <a
                  href={`mailto:${COMPANY.emailSales}?subject=${encodeURIComponent(`Quote: ${line.name}`)}`}
                  data-cursor="QUOTE"
                  className="inline-block bg-gold px-7 py-4 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-basalt transition-colors hover:bg-gold-hot"
                >
                  Request price
                </a>
                {category && (
                  <Link
                    to={`/catalog/${category.id}`}
                    className="inline-block border border-bone/25 px-7 py-4 font-mono text-xs uppercase tracking-[0.16em] text-bone transition-colors hover:border-gold hover:text-gold"
                  >
                    Browse the {category.label} shelf →
                  </Link>
                )}
              </div>
            </div>
          </div>

          {category && featured.length > 0 && (
            <div className="mt-28">
              <RevealHeading className="display text-[clamp(1.6rem,2.6vw,2.2rem)] text-bone">
                {`From the ${category.label} shelf`}
              </RevealHeading>
              <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                {featured.map((entry, i) => (
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
