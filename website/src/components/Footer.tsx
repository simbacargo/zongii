import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { PRODUCTS, CONTACT_INFO } from '../data/content'

export default function Footer() {
  const navigate = useNavigate()
  const location = useLocation()

  const scrollTo = (hash: string) => {
    if (location.pathname === '/') {
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/' + hash)
    }
  }

  return (
    <footer className="bg-navy-900 text-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-navy-700">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center shadow-amber-glow">
                <span className="text-navy-900 font-black text-xl font-display">Z</span>
              </div>
              <span className="text-white font-black text-xl tracking-widest uppercase">ZONGII</span>
            </div>
            <p className="text-navy-300 text-sm leading-relaxed max-w-xs mb-4">
              Tanzania's trusted supplier of plumbing, building and construction materials.
              Serving professionals and homeowners since 2002.
            </p>
            <p className="text-navy-400 text-xs leading-relaxed mb-6">
              Incorporated 2009 · TIN 108-998-350
            </p>
            <div className="flex gap-3">
              {['F', 'in', 'W'].map((s, i) => (
                <button key={i} aria-label={['Facebook', 'LinkedIn', 'WhatsApp'][i]} className="w-9 h-9 rounded-lg bg-navy-700 hover:bg-amber-500 hover:text-navy-900 text-navy-400 flex items-center justify-center transition-all duration-200 text-xs font-bold">
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <button onClick={() => scrollTo('#home')} className="text-navy-300 hover:text-amber-400 text-sm font-medium transition-colors duration-200">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('#products')} className="text-navy-300 hover:text-amber-400 text-sm font-medium transition-colors duration-200">
                  Products
                </button>
              </li>
              <li>
                <Link to="/about" className="text-navy-300 hover:text-amber-400 text-sm font-medium transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-navy-300 hover:text-amber-400 text-sm font-medium transition-colors duration-200">
                  Latest News
                </Link>
              </li>
              <li>
                <button onClick={() => scrollTo('#contact')} className="text-navy-300 hover:text-amber-400 text-sm font-medium transition-colors duration-200">
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5">Our Products</h4>
            <ul className="space-y-3">
              {PRODUCTS.map(p => (
                <li key={p.id}>
                  <button
                    onClick={() => scrollTo('#products')}
                    className="text-navy-300 hover:text-amber-400 text-sm font-medium transition-colors duration-200 text-left"
                  >
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-amber-500 mt-0.5">📍</span>
                <span className="text-navy-300 text-sm leading-relaxed">{CONTACT_INFO.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-500 mt-0.5">📞</span>
                <div className="space-y-1">
                  {CONTACT_INFO.phones.map(p => (
                    <a key={p} href={`tel:${p.replace(/\s/g, '')}`} className="block text-navy-300 hover:text-amber-400 text-sm transition-colors">
                      {p}
                    </a>
                  ))}
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-500 mt-0.5">✉️</span>
                <div className="space-y-1">
                  <a href={`mailto:${CONTACT_INFO.emailGeneral}`} className="block text-navy-300 hover:text-amber-400 text-sm transition-colors">
                    {CONTACT_INFO.emailGeneral}
                  </a>
                  <a href={`mailto:${CONTACT_INFO.emailSales}`} className="block text-navy-300 hover:text-amber-400 text-sm transition-colors">
                    {CONTACT_INFO.emailSales}
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-navy-400">
          <p>© {new Date().getFullYear()} Zongii Plumbing Co. Limited · All rights reserved · Mwanza, Tanzania</p>
          <p>Registered Business · TRA Certified</p>
        </div>
      </div>
    </footer>
  )
}
