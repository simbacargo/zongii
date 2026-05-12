import React from 'react'
import { VALUES } from '../data/content'
import AnimatedSection from '../ui/AnimatedSection'

export default function WhyZongii() {
  return (
    <section id="why" className="bg-navy-600 py-24 relative overflow-hidden">

      {/* Decorative */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-navy-500/30 blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-navy-700/40 blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/3" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-start">

          {/* Left: headline */}
          <AnimatedSection className="lg:w-2/5 flex-shrink-0">
            <span className="inline-block text-amber-400 font-bold text-sm uppercase tracking-widest mb-4 bg-amber-500/15 border border-amber-500/30 px-4 py-1.5 rounded-full">
              Why Choose Zongii
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
              Built on Quality.<br />
              <span className="text-amber-400">Trusted by Industry.</span>
            </h2>
            <p className="text-navy-200 text-lg leading-relaxed mb-8">
              We've been the go-to supplier for Tanzania's plumbing and construction
              professionals for over 15 years. Our reputation is built on delivering
              the right product, at the right time, every time.
            </p>
            <a
              href="#contact"
              onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) }}
              className="inline-flex items-center gap-2 border-2 border-amber-500 text-amber-400 font-bold px-7 py-3.5 rounded-full hover:bg-amber-500 hover:text-navy-900 transition-all duration-200"
            >
              Talk to Our Team
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </AnimatedSection>

          {/* Right: value cards */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VALUES.map((val, i) => (
              <AnimatedSection key={val.title} delay={(i % 4 + 1) as 1|2|3|4}>
                <div className="bg-navy-700/50 border border-navy-500 rounded-2xl p-6 backdrop-blur-sm hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-1 group h-full">
                  <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center mb-4 text-navy-900 font-black text-lg shadow-amber-glow group-hover:scale-110 transition-transform duration-200">
                    {val.icon}
                  </div>
                  <h3 className="text-white font-bold text-base mb-2">{val.title}</h3>
                  <p className="text-navy-200 text-sm leading-relaxed">{val.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
