import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { ScrollTrigger } from '../lib/motion'
import { useSmoothScroll, scrollToTop } from '../hooks/useSmoothScroll'
import Cursor from './Cursor'
import DepthMeter from './DepthMeter'
import Nav from './Nav'

export interface LayoutContext {
  ready: boolean
  setReady: (v: boolean) => void
}

export default function Layout() {
  const [ready, setReady] = useState(false)
  const location = useLocation()
  useSmoothScroll(ready)

  // only the home route runs the preloader curtain
  useEffect(() => {
    if (location.pathname !== '/') setReady(true)
  }, [location.pathname])

  // jump to top whenever the route changes to a distinct page
  const previousPath = useRef(location.pathname)
  useEffect(() => {
    if (previousPath.current === location.pathname) return
    previousPath.current = location.pathname
    scrollToTop()
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [location.pathname])

  // layout shifts once fonts/images settle; keep pin distances honest
  useEffect(() => {
    if (!ready) return
    const id = setTimeout(() => ScrollTrigger.refresh(), 300)
    return () => clearTimeout(id)
  }, [ready])

  return (
    <div className="grain">
      <Cursor />
      <DepthMeter />
      <Nav />
      <Outlet context={{ ready, setReady } satisfies LayoutContext} />
    </div>
  )
}
