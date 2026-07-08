import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, splitWords, prefersReducedMotion } from '../lib/motion'
import { COMPANY } from '../lib/data'
import { Magnetic } from '../components/ui'
import { scrollToSection } from '../hooks/useSmoothScroll'
import OreScene from '../three/OreScene'

export default function Hero({ ready }: { ready: boolean }) {
  const section = useRef<HTMLElement>(null!)
  const headline = useRef<HTMLHeadingElement>(null!)
  const scrollProgress = useRef(0)

  // feed hero scroll progress to the WebGL scene
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: section.current,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => {
        scrollProgress.current = self.progress
      },
    })
    return () => st.kill()
  }, [])

  // entrance choreography, released by the preloader
  useEffect(() => {
    if (!ready || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const words = splitWords(headline.current)
      gsap
        .timeline()
        .fromTo(words, { yPercent: 115, rotate: 3 }, { yPercent: 0, rotate: 0, duration: 1.25, ease: 'expo.out', stagger: 0.07 }, 0.1)
        .fromTo('.hero-fade', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.1 }, 0.55)
        .fromTo('.hero-rule', { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'expo.inOut' }, 0.4)
    }, section)
    return () => ctx.revert()
  }, [ready])

  // parallax the copy away as you leave the hero
  useEffect(() => {
    if (prefersReducedMotion()) return
    const tween = gsap.to('.hero-copy', {
      yPercent: -18,
      opacity: 0.15,
      ease: 'none',
      scrollTrigger: { trigger: section.current, start: 'top top', end: 'bottom 30%', scrub: true },
    })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  return (
    <section ref={section} id="top" className="relative flex min-h-svh flex-col justify-end overflow-clip">
      <div className="absolute inset-0">
        <OreScene scrollRef={scrollProgress} />
        {/* vignette so type always sits on darkness */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(12,10,7,0.72)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-basalt to-transparent" />
      </div>

      <div className="hero-copy relative z-10 mx-auto w-full max-w-[1600px] px-5 pb-16 pt-36 md:px-10 md:pb-20">
        <p className="hero-fade eyebrow mb-6 text-gold">
          {COMPANY.name.toUpperCase()} — MWANZA, TANZANIA — EST. {COMPANY.est}
        </p>
        <h1 ref={headline} className="display max-w-[11ch] text-[clamp(3.4rem,11.5vw,10.5rem)] text-bone">
          We equip the gold belt
        </h1>
        <div className="mt-8 flex flex-col gap-8 md:mt-10 md:flex-row md:items-end md:justify-between">
          <p className="hero-fade max-w-md text-base leading-relaxed text-smoke md:text-lg">
            Pumps, valves, piping, fire systems and heavy site equipment — stocked in
            Mwanza and delivered to Tanzania's mines since 2002.
          </p>
          <div className="hero-fade flex flex-wrap items-center gap-4">
            <Magnetic>
              <a
                href={`mailto:${COMPANY.emailSales}`}
                data-cursor="QUOTE"
                className="inline-block bg-gold px-8 py-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-basalt transition-colors hover:bg-gold-hot"
              >
                Request a quote
              </a>
            </Magnetic>
            <Magnetic>
              <button
                type="button"
                onClick={() => scrollToSection('equipment')}
                data-cursor="DIG"
                className="inline-block border border-bone/25 px-8 py-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-bone transition-colors hover:border-gold hover:text-gold"
              >
                Explore equipment
              </button>
            </Magnetic>
          </div>
        </div>
        <div className="hero-rule mt-12 h-px origin-left bg-bone/15" />
        <div className="hero-fade mt-5 flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
          <span>{COMPANY.coordinates} — LAKE VICTORIA GOLDFIELDS</span>
          <span className="flex items-center gap-3">
            SCROLL TO DESCEND
            <span className="inline-block h-6 w-px animate-pulse bg-gold" />
          </span>
        </div>
      </div>
    </section>
  )
}
