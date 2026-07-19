import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { EQUIPMENT, COMPANY } from '../lib/data'
import { Reveal, RevealHeading } from '../components/ui'

/** Dark stratum: six equipment lines on a pinned horizontal rail (desktop). */
export default function Equipment() {
  const section = useRef<HTMLElement>(null!)
  const track = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 1024px)', () => {
      const getDistance = () => track.current.scrollWidth - window.innerWidth
      const tween = gsap.to(track.current, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: () => `+=${getDistance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })
      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={section} id="equipment" className="relative overflow-clip bg-basalt py-24 lg:h-svh lg:py-0">
      <div className="pointer-events-none absolute left-5 top-20 z-10 md:left-10 lg:top-24">
        <p className="eyebrow mb-3 text-gold">02 — EQUIPMENT</p>
        <RevealHeading className="display text-[clamp(2.2rem,4.5vw,4.2rem)] text-bone">
          What we keep on the shelf
        </RevealHeading>
      </div>

      <div
        ref={track}
        className="flex flex-col gap-10 px-5 pt-56 md:px-10 lg:h-full lg:w-max lg:flex-row lg:items-end lg:gap-8 lg:pb-16 lg:pt-0 lg:pl-[38vw] lg:pr-[10vw]"
      >
        {EQUIPMENT.map((line, i) => (
          <Reveal key={line.id} delay={i * 0.05} className="lg:h-[72%] lg:w-[clamp(380px,30vw,480px)] lg:shrink-0">
            <article
              data-cursor="VIEW"
              className="group relative flex h-full flex-col border border-bone/10 bg-strata transition-colors duration-500 hover:border-gold/50"
            >
              <Link
                to={`/equipment/${line.id}`}
                aria-label={`${line.name} — details`}
                className="absolute inset-0 z-[1]"
              />
              <div className="img-frame aspect-[3/2] shrink-0">
                <img
                  src={line.image}
                  alt={line.name}
                  loading="lazy"
                  className="h-full w-full object-cover brightness-90 saturate-[0.85] transition-all duration-700 group-hover:brightness-100 group-hover:saturate-100"
                />
              </div>
              <div className="flex flex-1 flex-col p-6 md:p-7">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-2xl font-extrabold tracking-tight text-bone md:text-3xl">
                    {line.name}
                  </h3>
                  <span className="font-mono text-[10px] text-gold">{line.index}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-smoke">{line.blurb}</p>
                <ul className="mt-auto grid gap-1.5 pt-6">
                  {line.specs.map((spec) => (
                    <li key={spec} className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.08em] text-ash">
                      <span className="h-1 w-1 shrink-0 rotate-45 bg-gold/70" />
                      {spec}
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/catalog/${line.catalogCategory}`}
                  className="relative z-[2] mt-5 inline-flex items-center gap-2 border-t border-bone/10 pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-gold transition-colors hover:text-gold-hot"
                >
                  Browse the shelf →
                </Link>
              </div>
            </article>
          </Reveal>
        ))}

        {/* rail terminus */}
        <div className="flex items-center lg:h-[72%] lg:w-[420px] lg:shrink-0">
          <div>
            <p className="display text-4xl text-bone/90 md:text-5xl">Need something not pictured?</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-smoke">
              The full stock list runs past 2,400 SKUs. Send the part number — or a photo
              of the worn-out part — and we'll match it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/catalog"
                data-cursor="OPEN"
                className="inline-block bg-gold px-6 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-basalt transition-colors hover:bg-gold-hot"
              >
                Browse the full catalog
              </Link>
              <a
                href={`mailto:${COMPANY.emailSales}`}
                data-cursor="QUOTE"
                className="inline-block border border-gold/60 px-6 py-3.5 font-mono text-xs uppercase tracking-[0.18em] text-gold transition-colors hover:bg-gold hover:text-basalt"
              >
                Send your list
              </a>
            </div>
          </div>
        </div>
      </div>

      <p className="pointer-events-none absolute bottom-8 right-10 hidden font-mono text-[10px] uppercase tracking-[0.2em] text-ash lg:block">
        SCROLL — THE RAIL MOVES
      </p>
    </section>
  )
}
