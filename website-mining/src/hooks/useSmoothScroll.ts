import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/motion'

let activeLenis: Lenis | null = null

export function scrollToSection(id: string) {
  const target = document.getElementById(id)
  if (!target) return
  if (activeLenis) {
    activeLenis.scrollTo(target, { offset: 0, duration: 1.6 })
  } else {
    target.scrollIntoView({ behavior: 'smooth' })
  }
}

export function scrollToTop(immediate = true) {
  if (activeLenis) {
    activeLenis.scrollTo(0, { immediate })
  } else {
    window.scrollTo(0, 0)
  }
}

export function useSmoothScroll(enabled: boolean) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (!enabled || prefersReducedMotion()) return

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    lenisRef.current = lenis
    activeLenis = lenis

    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      if (activeLenis === lenis) activeLenis = null
    }
  }, [enabled])
}
