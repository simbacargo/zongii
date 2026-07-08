import { useEffect, useRef, type ReactNode } from 'react'
import { gsap, ScrollTrigger, splitWords, isTouch, prefersReducedMotion } from '../lib/motion'

/** Heading whose words rise out of a clip as it enters the viewport. */
export function RevealHeading({
  as: Tag = 'h2',
  children,
  className = '',
  delay = 0,
}: {
  as?: 'h1' | 'h2' | 'h3' | 'p'
  children: string
  className?: string
  delay?: number
}) {
  const el = useRef<HTMLHeadingElement>(null!)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const words = splitWords(el.current)
    const tween = gsap.fromTo(
      words,
      { yPercent: 115, rotate: 2.5 },
      {
        yPercent: 0,
        rotate: 0,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.045,
        delay,
        scrollTrigger: { trigger: el.current, start: 'top 88%', once: true },
      },
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [delay])

  return (
    <Tag ref={el} className={className}>
      {children}
    </Tag>
  )
}

/** Fade-and-rise on scroll for arbitrary content. */
export function Reveal({
  children,
  className = '',
  delay = 0,
  y = 36,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}) {
  const el = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const tween = gsap.fromTo(
      el.current,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'expo.out',
        delay,
        scrollTrigger: { trigger: el.current, start: 'top 90%', once: true },
      },
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [delay, y])

  return (
    <div ref={el} className={className}>
      {children}
    </div>
  )
}

/** Number that counts up when scrolled into view. */
export function Counter({ value, suffix = '', className = '' }: { value: number; suffix?: string; className?: string }) {
  const el = useRef<HTMLSpanElement>(null!)

  useEffect(() => {
    const format = (n: number) => Math.round(n).toLocaleString('en-US')
    if (prefersReducedMotion()) {
      el.current.textContent = format(value) + suffix
      return
    }
    const state = { n: 0 }
    const tween = gsap.to(state, {
      n: value,
      duration: 2,
      ease: 'expo.out',
      scrollTrigger: { trigger: el.current, start: 'top 90%', once: true },
      onUpdate: () => {
        el.current.textContent = format(state.n) + suffix
      },
    })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [value, suffix])

  return (
    <span ref={el} className={`tabular-nums ${className}`}>
      0{suffix}
    </span>
  )
}

/** Element that leans toward the pointer. Desktop only. */
export function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const el = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    if (isTouch() || prefersReducedMotion()) return
    const node = el.current
    const xTo = gsap.quickTo(node, 'x', { duration: 0.5, ease: 'power3.out' })
    const yTo = gsap.quickTo(node, 'y', { duration: 0.5, ease: 'power3.out' })
    const move = (e: MouseEvent) => {
      const rect = node.getBoundingClientRect()
      xTo((e.clientX - rect.left - rect.width / 2) * strength)
      yTo((e.clientY - rect.top - rect.height / 2) * strength)
    }
    const leave = () => {
      xTo(0)
      yTo(0)
    }
    node.addEventListener('mousemove', move)
    node.addEventListener('mouseleave', leave)
    return () => {
      node.removeEventListener('mousemove', move)
      node.removeEventListener('mouseleave', leave)
    }
  }, [strength])

  return (
    <div ref={el} className="inline-block">
      {children}
    </div>
  )
}

/** Image that drifts vertically at its own rate while scrolling (parallax). */
export function ParallaxImage({
  src,
  alt,
  speed = 1,
  className = '',
  imgClassName = '',
}: {
  src: string
  alt: string
  speed?: number
  className?: string
  imgClassName?: string
}) {
  const frame = useRef<HTMLDivElement>(null!)
  const img = useRef<HTMLImageElement>(null!)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const shift = (speed - 1) * 120
    const tween = gsap.fromTo(
      img.current,
      { y: -Math.abs(shift) },
      {
        y: Math.abs(shift),
        ease: 'none',
        scrollTrigger: { trigger: frame.current, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [speed])

  return (
    <div ref={frame} className={`img-frame ${className}`}>
      <img
        ref={img}
        src={src}
        alt={alt}
        loading="lazy"
        className={`h-full w-full scale-[1.15] object-cover ${imgClassName}`}
      />
    </div>
  )
}

export { ScrollTrigger }
