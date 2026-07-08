import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'

export default function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null!)
  const counter = useRef<HTMLSpanElement>(null!)
  const done = useRef(onDone)
  done.current = onDone

  // hold the page still while the curtain is up
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    if (prefersReducedMotion()) {
      done.current()
      return
    }
    const ctx = gsap.context(() => {
      const value = { n: 0 }
      const tl = gsap.timeline({
        onComplete: () => done.current(),
      })
      tl.fromTo(
        '.pre-letter',
        { yPercent: 110 },
        { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.055 },
        0,
      )
        .to(
          value,
          {
            n: 100,
            duration: 1.7,
            ease: 'power2.inOut',
            onUpdate: () => {
              if (counter.current)
                counter.current.textContent = `${String(Math.round(value.n)).padStart(3, '0')}%`
            },
          },
          0.15,
        )
        .to('.pre-bar', { scaleX: 1, duration: 1.7, ease: 'power2.inOut' }, 0.15)
        .to('.pre-fade', { opacity: 0, duration: 0.4, ease: 'power1.out' }, '+=0.1')
        .to(root.current, {
          yPercent: -100,
          duration: 0.9,
          ease: 'expo.inOut',
        })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={root} className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-basalt">
      <div className="pre-fade flex flex-col items-center gap-8">
        <div className="flex overflow-clip font-display text-5xl font-extrabold tracking-tight text-bone md:text-7xl" aria-label="Zongii">
          {'ZONGII'.split('').map((letter, i) => (
            <span key={i} className="pre-letter inline-block">
              {letter}
            </span>
          ))}
        </div>
        <div className="flex w-56 items-center gap-4 md:w-72">
          <div className="h-px flex-1 bg-seam">
            <div className="pre-bar h-px origin-left scale-x-0 bg-gold" />
          </div>
          <span ref={counter} className="font-mono text-xs text-gold tabular-nums">
            000%
          </span>
        </div>
        <p className="eyebrow text-ash">EXTRACTING · MWANZA · EST. 2002</p>
      </div>
    </div>
  )
}
