import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

export const EASE = 'expo.out'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isTouch = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches

/**
 * Wrap each word of an element's text in an inner span (translated for reveal)
 * inside an outer clipping span. Returns the inner word spans.
 */
export function splitWords(el: HTMLElement): HTMLElement[] {
  if (el.dataset.split === 'done') {
    return Array.from(el.querySelectorAll<HTMLElement>('.split-word'))
  }
  const text = el.textContent ?? ''
  el.textContent = ''
  const words: HTMLElement[] = []
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const clip = document.createElement('span')
    clip.className = 'inline-block overflow-clip align-bottom'
    clip.style.paddingBlock = '0.08em'
    clip.style.marginBlock = '-0.08em'
    const inner = document.createElement('span')
    inner.className = 'split-word'
    inner.textContent = word
    clip.appendChild(inner)
    el.appendChild(clip)
    el.appendChild(document.createTextNode(' '))
    words.push(inner)
  }
  el.dataset.split = 'done'
  return words
}
