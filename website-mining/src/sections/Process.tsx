import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { PROCESS } from '../lib/data'
import { Reveal, RevealHeading } from '../components/ui'

/** Light stratum: the supply sequence, with a vein line drawn as you scroll. */
export default function Process() {
  const section = useRef<HTMLElement>(null!)
  const vein = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const tween = gsap.fromTo(
      vein.current,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section.current,
          start: 'top 65%',
          end: 'bottom 75%',
          scrub: true,
        },
      },
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  return (
    <section ref={section} id="process" className="strata-edge-bottom relative bg-bone pb-40 pt-28 text-basalt md:pt-36">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <p className="eyebrow mb-4 text-basalt/50">04 — PROCESS</p>
        <RevealHeading className="display max-w-[14ch] text-[clamp(2.6rem,5.5vw,5.2rem)]">
          From enquiry to laydown in four cuts
        </RevealHeading>

        <div className="relative mt-16 md:mt-24">
          {/* the vein: a gold line drawn down the sequence */}
          <div className="absolute bottom-0 left-[7px] top-0 w-px bg-basalt/15 md:left-1/2" aria-hidden>
            <div ref={vein} className="h-full w-full origin-top bg-gold" style={{ transform: 'scaleY(0)' }} />
          </div>

          <ol className="space-y-16 md:space-y-24">
            {PROCESS.map((step, i) => (
              <li key={step.step} className={`relative grid gap-6 pl-10 md:grid-cols-2 md:gap-24 md:pl-0`}>
                <div
                  className="absolute left-0 top-1.5 h-[15px] w-[15px] rotate-45 border-2 border-basalt bg-bone md:left-1/2 md:-translate-x-1/2"
                  aria-hidden
                />
                <div className={i % 2 ? 'md:col-start-2 md:pl-16' : 'md:pr-16 md:text-right'}>
                  <Reveal>
                    <p className="font-mono text-xs font-semibold tracking-[0.2em] text-gold">CUT {step.step}</p>
                    <h3 className="display mt-2 text-4xl md:text-5xl">{step.title}</h3>
                    <p className={`mt-4 max-w-md text-base leading-relaxed text-basalt/70 ${i % 2 ? '' : 'md:ml-auto'}`}>
                      {step.body}
                    </p>
                  </Reveal>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
