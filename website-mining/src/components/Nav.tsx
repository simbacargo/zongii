import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { gsap, ScrollTrigger } from '../lib/motion'
import { NAV_LINKS, COMPANY } from '../lib/data'
import { scrollToSection } from '../hooks/useSmoothScroll'
import { useGoToSection } from '../hooks/useGoToSection'

function Wordmark() {
  return (
    <span className="flex items-baseline gap-2">
      <svg viewBox="0 0 32 32" className="h-6 w-6 self-center" aria-hidden>
        <path d="M7 21 L13 9 L16 15 L19 9 L25 21" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="text-gold" />
        <path d="M9 25.5 h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="2.5 3.2" className="text-gold" />
      </svg>
      <span className="font-display text-xl font-extrabold tracking-tight">ZONGII</span>
      <span className="eyebrow hidden text-[9px] text-ash sm:inline">MINING CO. LTD</span>
    </span>
  )
}

export default function Nav() {
  const bar = useRef<HTMLElement>(null!)
  const menu = useRef<HTMLDivElement>(null!)
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const goToSection = useGoToSection()
  const onCatalog = location.pathname.startsWith('/catalog')

  useEffect(() => {
    // solidify the bar once past the hero
    const st = ScrollTrigger.create({
      start: 'top -80',
      onUpdate: (self) => {
        bar.current?.classList.toggle('nav-solid', self.scroll() > 80)
      },
    })
    gsap.fromTo(bar.current, { yPercent: -100 }, { yPercent: 0, duration: 1, ease: 'expo.out', delay: 0.15 })
    return () => st.kill()
  }, [])

  useEffect(() => {
    if (!menu.current) return
    if (open) {
      gsap.set(menu.current, { display: 'flex' })
      gsap.fromTo(menu.current, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.7, ease: 'expo.inOut' })
      gsap.fromTo('.menu-link', { yPercent: 120 }, { yPercent: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06, delay: 0.25 })
    } else {
      gsap.to(menu.current, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 0.55,
        ease: 'expo.inOut',
        onComplete: () => gsap.set(menu.current, { display: 'none' }),
      })
    }
  }, [open])

  // close the menu when the route changes (e.g. Catalog link)
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  const go = (id: string) => {
    setOpen(false)
    // wait for the menu wipe before travelling
    goToSection(id, open ? 350 : 0)
  }

  const catalogLinkClass = (base: string) =>
    `${base} ${onCatalog ? 'text-gold' : ''}`

  return (
    <>
      <header
        ref={bar}
        className="fixed inset-x-0 top-0 z-[80] transition-colors duration-500 [&.nav-solid]:border-b [&.nav-solid]:border-bone/8 [&.nav-solid]:bg-basalt/80 [&.nav-solid]:backdrop-blur-md"
      >
        <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 md:px-10">
          <Link
            to="/"
            onClick={() => {
              if (location.pathname === '/') scrollToSection('top')
            }}
            className="text-bone"
            aria-label="Zongii home"
          >
            <Wordmark />
          </Link>
          <div className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link, i) => (
              <button
                key={link.id}
                type="button"
                onClick={() => go(link.id)}
                className="group relative font-mono text-[11px] uppercase tracking-[0.18em] text-smoke transition-colors hover:text-bone"
              >
                <span className="mr-1.5 text-gold/70">{String(i + 1).padStart(2, '0')}</span>
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-gold transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100" />
              </button>
            ))}
            <Link
              to="/catalog"
              className={catalogLinkClass(
                'group relative font-mono text-[11px] uppercase tracking-[0.18em] text-smoke transition-colors hover:text-bone',
              )}
            >
              <span className="mr-1.5 text-gold/70">{String(NAV_LINKS.length + 1).padStart(2, '0')}</span>
              Catalog
              <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-gold transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100" />
            </Link>
            <a
              href={`mailto:${COMPANY.emailSales}`}
              className="border border-gold/60 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-gold transition-colors hover:bg-gold hover:text-basalt"
            >
              Request a quote
            </a>
          </div>
          <button
            type="button"
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <span className={`h-px w-6 bg-bone transition-transform duration-300 ${open ? 'translate-y-[3.5px] rotate-45' : ''}`} />
            <span className={`h-px w-6 bg-bone transition-transform duration-300 ${open ? '-translate-y-[3.5px] -rotate-45' : ''}`} />
          </button>
        </nav>
      </header>

      {/* full-screen mobile menu */}
      <div
        ref={menu}
        className="fixed inset-0 z-[70] hidden flex-col justify-end bg-strata px-6 pb-14 pt-28"
        style={{ clipPath: 'inset(0 0 100% 0)' }}
      >
        <div className="flex flex-col gap-2">
          {NAV_LINKS.map((link, i) => (
            <div key={link.id} className="overflow-clip">
              <button
                type="button"
                onClick={() => go(link.id)}
                className="menu-link flex items-baseline gap-4 font-display text-5xl font-extrabold tracking-tight text-bone"
              >
                <span className="font-mono text-xs text-gold">{String(i + 1).padStart(2, '0')}</span>
                {link.label}
              </button>
            </div>
          ))}
          <div className="overflow-clip">
            <Link
              to="/catalog"
              className="menu-link flex items-baseline gap-4 font-display text-5xl font-extrabold tracking-tight text-gold"
            >
              <span className="font-mono text-xs text-gold">{String(NAV_LINKS.length + 1).padStart(2, '0')}</span>
              Catalog
            </Link>
          </div>
        </div>
        <div className="mt-12 border-t border-bone/10 pt-6">
          <p className="eyebrow text-ash">{COMPANY.coordinates} — MWANZA</p>
        </div>
      </div>
    </>
  )
}
