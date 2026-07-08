import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from '../lib/motion'
import { GOLDFIELDS } from '../lib/data'
import { Reveal, RevealHeading } from '../components/ui'
import PitScene from '../three/PitScene'

/** Pinned WebGL descent into a procedural open pit, over the goldfields we serve. */
export default function Operations() {
  const section = useRef<HTMLElement>(null!)
  const progress = useRef(0)
  const [mounted, setMounted] = useState(false)

  // only mount the canvas when the section approaches (saves GPU on load)
  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true)
          io.disconnect()
        }
      },
      { rootMargin: '600px' },
    )
    io.observe(section.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: section.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        progress.current = self.progress
      },
    })
    return () => st.kill()
  }, [])

  return (
    <section ref={section} id="operations" className="relative h-[260svh] bg-basalt">
      <div className="sticky top-0 h-svh overflow-clip">
        {mounted && <PitScene progressRef={progress} />}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(12,10,7,0.55)_100%)]" />

        <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-between px-5 py-24 md:px-10">
          <div>
            <p className="eyebrow mb-3 text-gold">03 — OPERATIONS</p>
            <RevealHeading className="display max-w-[14ch] text-[clamp(2.4rem,5vw,4.6rem)] text-bone">
              Where the orders land
            </RevealHeading>
            <Reveal delay={0.15} className="mt-6 max-w-md">
              <p className="text-base leading-relaxed text-smoke">
                From the Pamba Road depot we run the Lake Victoria Goldfields —
                same-week delivery to the gates below, and to every drill camp,
                quarry and processing plant between them.
              </p>
            </Reveal>
          </div>

          <div className="grid max-w-3xl grid-cols-2 gap-x-8 md:grid-cols-3">
            {GOLDFIELDS.map((field, i) => (
              <Reveal key={field.name} delay={i * 0.06}>
                <div className="border-t border-bone/15 py-4">
                  <p className="font-display text-xl font-extrabold tracking-tight text-bone md:text-2xl">{field.name}</p>
                  <p className="mt-1 font-mono text-[9px] tracking-[0.16em] text-gold/80">{field.note}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
