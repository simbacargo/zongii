import React, { useEffect, useRef, useState } from 'react'
import { STATS } from '../data/content'

function useCountUp(target: number, duration = 1400) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
      else setCount(target)
    }
    requestAnimationFrame(step)
  }, [started, target, duration])

  return { count, ref }
}

function StatCard({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { count, ref } = useCountUp(value)
  return (
    <div ref={ref} className="flex flex-col items-center py-8 px-4">
      <span className="text-5xl sm:text-6xl font-black text-navy-800 tabular-nums leading-none">
        {count}{suffix}
      </span>
      <span className="mt-2 text-sm font-semibold text-navy-700 uppercase tracking-widest text-center">
        {label}
      </span>
    </div>
  )
}

export default function StatsBar() {
  return (
    <div className="bg-amber-500">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-amber-400/50">
        {STATS.map(s => (
          <StatCard key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
        ))}
      </div>
    </div>
  )
}
