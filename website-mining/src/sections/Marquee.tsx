const TERMS = [
  'Pumps & Motors',
  'Valves & Flow Control',
  'Piping & Fittings',
  'Fire & Safety',
  'Demolition & Drilling',
  'Air & Power',
]

function Row({ outline = false }: { outline?: boolean }) {
  return (
    <>
      {TERMS.map((term) => (
        <span key={term} className="flex shrink-0 items-center gap-8 pr-8">
          <span
            className={`font-display text-5xl font-extrabold tracking-tight md:text-7xl ${
              outline ? 'text-outline-basalt' : 'text-basalt'
            }`}
          >
            {term}
          </span>
          <svg viewBox="0 0 12 12" className="h-3.5 w-3.5 shrink-0 text-basalt/70" aria-hidden>
            <path d="M6 0 L12 6 L6 12 L0 6 Z" fill="currentColor" />
          </svg>
        </span>
      ))}
    </>
  )
}

/** Gold seam running between the hero and the first stratum. */
export default function Marquee() {
  return (
    <div aria-hidden className="relative z-10 -my-6 rotate-[-1.6deg] scale-x-105 overflow-clip bg-gold py-5 shadow-[0_20px_60px_rgba(224,168,62,0.15)]">
      <div className="marquee-track flex w-max" style={{ '--marquee-speed': '52s' } as React.CSSProperties}>
        <div className="flex">
          <Row />
          <Row outline />
        </div>
        <div className="flex" aria-hidden>
          <Row />
          <Row outline />
        </div>
      </div>
    </div>
  )
}
