import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const ANCHOR_LINKS = [
  { label: 'Products',   hash: '#products'   },
  { label: 'Experience', hash: '#experience' },
  { label: 'Contact',    hash: '#contact'    },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const handleAnchorClick = (hash: string) => {
    setMenuOpen(false)
    if (location.pathname === '/') {
      setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
    } else {
      navigate('/' + hash)
    }
  }

  const handleHomeClick = () => {
    setMenuOpen(false)
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate('/')
    }
  }

  const isPage = (path: string) => location.pathname === path

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-navy-600/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-18 flex items-center justify-between py-4">

          {/* Logo */}
          <button onClick={handleHomeClick} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-amber-glow flex-shrink-0">
              <span className="text-navy-900 font-black text-xl font-display">Z</span>
            </div>
            <span className="text-white font-black text-xl tracking-widest uppercase">ZONGII</span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={handleHomeClick}
              className="text-white/80 hover:text-amber-400 text-sm font-semibold tracking-wide transition-colors duration-200 pb-0.5"
            >
              Home
            </button>

            {ANCHOR_LINKS.map(link => (
              <button
                key={link.hash}
                onClick={() => handleAnchorClick(link.hash)}
                className="text-white/80 hover:text-amber-400 text-sm font-semibold tracking-wide transition-colors duration-200 pb-0.5"
              >
                {link.label}
              </button>
            ))}

            <Link
              to="/about"
              onClick={() => setMenuOpen(false)}
              className={`text-sm font-semibold tracking-wide transition-colors duration-200 pb-0.5 ${isPage('/about') ? 'text-amber-400' : 'text-white/80 hover:text-amber-400'}`}
            >
              About
            </Link>

            <Link
              to="/news"
              onClick={() => setMenuOpen(false)}
              className={`text-sm font-semibold tracking-wide transition-colors duration-200 pb-0.5 ${isPage('/news') ? 'text-amber-400' : 'text-white/80 hover:text-amber-400'}`}
            >
              News
            </Link>

            <a href='https://www.zongii.com'
              className="ml-2 bg-amber-500 text-navy-900 font-bold text-sm px-5 py-2.5 rounded-full hover:bg-amber-400 transition-all duration-200 shadow-amber-glow hover:scale-105"
            >
              Get a Quote
            </a>
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 flex flex-col gap-1.5">
              <span className={`h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-navy-900/95 backdrop-blur-md flex flex-col items-center justify-center gap-7">
          <button
            className="absolute top-5 right-5 text-white p-2"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button onClick={handleHomeClick} className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
              <span className="text-navy-900 font-black text-2xl font-display">Z</span>
            </div>
            <span className="text-white font-black text-2xl tracking-widest uppercase">ZONGII</span>
          </button>

          <button onClick={handleHomeClick} className="text-white text-2xl font-bold hover:text-amber-400 transition-colors">
            Home
          </button>

          {ANCHOR_LINKS.map(link => (
            <button
              key={link.hash}
              onClick={() => handleAnchorClick(link.hash)}
              className="text-white text-2xl font-bold hover:text-amber-400 transition-colors"
            >
              {link.label}
            </button>
          ))}

          <Link to="/about" onClick={() => setMenuOpen(false)} className={`text-2xl font-bold transition-colors ${isPage('/about') ? 'text-amber-400' : 'text-white hover:text-amber-400'}`}>
            About
          </Link>

          <Link to="/news" onClick={() => setMenuOpen(false)} className={`text-2xl font-bold transition-colors ${isPage('/news') ? 'text-amber-400' : 'text-white hover:text-amber-400'}`}>
            News
          </Link>

          <button
            onClick={() => handleAnchorClick('#contact')}
            className="mt-2 bg-amber-500 text-navy-900 font-bold text-lg px-8 py-3 rounded-full hover:bg-amber-400 transition-colors shadow-amber-glow"
          >
            Gcet a Quote
          </button>
        </div>
      </div>
    </>
  )
}
