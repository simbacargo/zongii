import React from 'react'
import { PRODUCTS } from '../data/content'

const QUICK_LINKS = ['Home', 'Products', 'Experience', 'Why Zongii', 'Contact']
const ANCHORS: Record<string, string> = {
  'Home': '#home', 'Products': '#products', 'Experience': '#experience',
  'Why Zongii': '#why', 'Contact': '#contact',
}

export default function Footer() {
  const scrollTo = (anchor: string) => {
    document.querySelector(anchor)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="bg-navy-900 text-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 pb-12 border-b border-navy-700">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center shadow-amber-glow">
                <span className="text-navy-900 font-black text-xl font-display">Z</span>
              </div>
              <span className="text-white font-black text-xl tracking-widest uppercase">ZONGII</span>
            </div>
            <p className="text-navy-300 text-sm leading-relaxed max-w-xs mb-6">
              Tanzania's trusted supplier of plumbing, building and construction materials.
              Serving professionals and homeowners since 2009.
            </p>
            {/* Socials */}
            <div className="flex gap-3">
              {['Facebook', 'LinkedIn', 'WhatsApp'].map(s => (
                <button key={s} aria-label={s} className="w-9 h-9 rounded-lg bg-navy-700 hover:bg-amber-500 hover:text-navy-900 text-navy-400 flex items-center justify-center transition-all duration-200 text-xs font-bold">
                  {s[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map(link => (
                <li key={link}>
                  <button
                    onClick={() => scrollTo(ANCHORS[link])}
                    className="text-navy-300 hover:text-amber-400 text-sm font-medium transition-colors duration-200"
                  >
                    {link}
                  </button>
                </li>
              ))}
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
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-navy-400">
          <p>© {new Date().getFullYear()} Zongii Ltd. All rights reserved. · Dar es Salaam, Tanzania</p>
          <p>Registered Business · Tanzania</p>
        </div>
      </div>
    </footer>
  )
}
