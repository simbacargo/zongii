import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/motion'
import { MAX_DEPTH_M } from '../lib/data'

/**
 * Fixed depth gauge: scroll position rendered as metres below collar.
 * Drawn in bone with exclusion blending so it self-inverts on light strata.
 */
export default function DepthMeter() {
  const value = useRef<HTMLSpanElement>(null)
  const needle = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: () => document.documentElement.scrollHeight - window.innerHeight,
      onUpdate: (self) => {
        const depth = Math.round(self.progress * MAX_DEPTH_M)
        if (value.current)
          value.current.textContent = `-${String(depth).padStart(4, '0')} m`
        if (needle.current)
          gsap.set(needle.current, { top: `${self.progress * 100}%` })
      },
    })
    return () => st.kill()
  }, [])

  return (
    <div
      aria-hidden
      className="fixed right-5 top-1/2 z-40 hidden h-56 -translate-y-1/2 select-none flex-col items-end gap-2 mix-blend-exclusion lg:flex"
    >
      <div className="relative h-full w-px bg-bone/25">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="absolute right-0 h-px bg-bone/35"
            style={{ top: `${(i / 8) * 100}%`, width: i % 4 === 0 ? 10 : 5 }}
          />
        ))}
        <div ref={needle} className="absolute right-0 flex -translate-y-1/2 items-center gap-1.5" style={{ top: 0 }}>
          <span ref={value} className="whitespace-nowrap font-mono text-[10px] font-medium text-bone tabular-nums">
            -0000 m
          </span>
          <div className="h-[3px] w-4 bg-bone" />
        </div>
      </div>
      <span className="eyebrow text-[9px] text-bone/60">DEPTH</span>
    </div>
  )
}
