import { Link, Navigate, useParams } from 'react-router'
import { getCategory } from '../lib/catalog'
import { Reveal, RevealHeading } from '../components/ui'
import ItemCard from '../components/ItemCard'
import CtaFooter from '../sections/CtaFooter'

export default function Category() {
  const { categoryId } = useParams()
  const category = getCategory(categoryId)
  if (!category) return <Navigate to="/catalog" replace />

  return (
    <>
      <main className="bg-basalt pb-28 pt-32 md:pt-40">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10">
          <Link
            to="/catalog"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-ash transition-colors hover:text-gold"
          >
            ← All categories
          </Link>
          {/* lg right padding keeps the count clear of the fixed depth meter */}
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6 lg:pr-20">
            <RevealHeading as="h1" className="display max-w-[12ch] text-[clamp(2.6rem,6vw,5.4rem)] text-bone">
              {category.label}
            </RevealHeading>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
              {category.items.length} LINES — PAMBA ROAD DEPOT
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
            {category.items.map((entry, i) => (
              <Reveal key={entry.id} delay={(i % 4) * 0.05} y={24}>
                <ItemCard item={entry} categoryId={category.id} />
              </Reveal>
            ))}
          </div>
        </div>
      </main>
      <CtaFooter />
    </>
  )
}
