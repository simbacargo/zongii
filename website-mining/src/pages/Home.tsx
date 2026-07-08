import { useEffect } from 'react'
import { useLocation, useOutletContext } from 'react-router'
import type { LayoutContext } from '../components/Layout'
import { scrollToSection } from '../hooks/useSmoothScroll'
import Preloader from '../components/Preloader'
import Hero from '../sections/Hero'
import Marquee from '../sections/Marquee'
import Legacy from '../sections/Legacy'
import Equipment from '../sections/Equipment'
import Operations from '../sections/Operations'
import Process from '../sections/Process'
import Gallery from '../sections/Gallery'
import CtaFooter from '../sections/CtaFooter'

export default function Home() {
  const { ready, setReady } = useOutletContext<LayoutContext>()
  const location = useLocation()

  // arriving from a catalog route with a section target
  useEffect(() => {
    const section = (location.state as { section?: string } | null)?.section
    if (!section || !ready) return
    window.history.replaceState({}, '')
    const id = setTimeout(() => scrollToSection(section), 250)
    return () => clearTimeout(id)
  }, [ready, location.state])

  return (
    <>
      {!ready && <Preloader onDone={() => setReady(true)} />}
      <main>
        <Hero ready={ready} />
        <Marquee />
        <Legacy />
        <Equipment />
        <Operations />
        <Process />
        <Gallery />
      </main>
      <CtaFooter />
    </>
  )
}
