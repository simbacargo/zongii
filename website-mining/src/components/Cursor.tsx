import { useEffect, useRef } from 'react'
import { gsap, isTouch, prefersReducedMotion } from '../lib/motion'

/** Gold dot + trailing ring; the ring grows and labels itself over [data-cursor] targets. */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (isTouch() || prefersReducedMotion()) return
    const dotEl = dot.current!
    const ringEl = ring.current!
    const labelEl = label.current!
    document.documentElement.classList.add('has-custom-cursor')

    const dotX = gsap.quickTo(dotEl, 'x', { duration: 0.12, ease: 'power2.out' })
    const dotY = gsap.quickTo(dotEl, 'y', { duration: 0.12, ease: 'power2.out' })
    const ringX = gsap.quickTo(ringEl, 'x', { duration: 0.45, ease: 'power3.out' })
    const ringY = gsap.quickTo(ringEl, 'y', { duration: 0.45, ease: 'power3.out' })

    const move = (e: MouseEvent) => {
      dotX(e.clientX)
      dotY(e.clientY)
      ringX(e.clientX)
      ringY(e.clientY)
    }

    const over = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor]')
      if (target) {
        labelEl.textContent = target.dataset.cursor ?? ''
        gsap.to(ringEl, { scale: 3.2, backgroundColor: 'rgba(224,168,62,0.92)', duration: 0.35, ease: 'power3.out' })
        gsap.to(labelEl, { opacity: 1, duration: 0.25 })
        gsap.to(dotEl, { opacity: 0, duration: 0.2 })
      } else if (
        (e.target as HTMLElement).closest('a, button, [role="button"]')
      ) {
        gsap.to(ringEl, { scale: 1.7, backgroundColor: 'rgba(224,168,62,0)', duration: 0.3 })
        gsap.to(labelEl, { opacity: 0, duration: 0.2 })
        gsap.to(dotEl, { opacity: 1, duration: 0.2 })
      } else {
        gsap.to(ringEl, { scale: 1, backgroundColor: 'rgba(224,168,62,0)', duration: 0.35 })
        gsap.to(labelEl, { opacity: 0, duration: 0.2 })
        gsap.to(dotEl, { opacity: 1, duration: 0.2 })
      }
    }

    window.addEventListener('mousemove', move, { passive: true })
    window.addEventListener('mouseover', over, { passive: true })
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', over)
      document.documentElement.classList.remove('has-custom-cursor')
    }
  }, [])

  return (
    <>
      <div
        ref={dot}
        className="pointer-events-none fixed left-0 top-0 z-[95] hidden h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold [html.has-custom-cursor_&]:block"
      />
      <div
        ref={ring}
        className="pointer-events-none fixed left-0 top-0 z-[94] hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold/60 [html.has-custom-cursor_&]:flex"
      >
        <span ref={label} className="font-mono text-[7px] font-semibold uppercase tracking-widest text-basalt opacity-0" />
      </div>
    </>
  )
}
