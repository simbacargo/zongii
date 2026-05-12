import React from 'react'

export default function Hero() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-center overflow-hidden">

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-700 to-navy-600" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M60 0v60M0 60h60' stroke='%23fff' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Decorative circles */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-navy-400/20 blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 text-center py-32 pt-40">

        {/* Badge */}
        <div className="hero-anim-1 inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-sm font-semibold px-4 py-2 rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Tanzania's Trusted Supply Partner
        </div>

        {/* Headline */}
        <h1 className="hero-anim-2 font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-tight mb-6">
          Your Complete Source for{' '}
          <span className="text-amber-400">Plumbing</span> &{' '}
          <span className="text-amber-400">Construction</span> Supplies
        </h1>

        {/* Sub */}
        <p className="hero-anim-3 text-lg sm:text-xl text-navy-200 max-w-2xl mx-auto leading-relaxed mb-10">
          Supplying quality products to contractors, developers and homeowners
          across Tanzania for over 15 years.
        </p>

        {/* CTAs */}
        <div className="hero-anim-4 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => scrollTo('products')}
            className="bg-amber-500 text-navy-900 font-bold text-base px-8 py-4 rounded-full hover:bg-amber-400 transition-all duration-200 shadow-amber-glow hover:scale-105 hover:-translate-y-0.5"
          >
            Explore Products
          </button>
          <button
            onClick={() => scrollTo('contact')}
            className="border-2 border-white/50 text-white font-bold text-base px-8 py-4 rounded-full hover:bg-white/10 hover:border-white transition-all duration-200 hover:-translate-y-0.5"
          >
            Contact Us →
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="mt-20 flex flex-col items-center gap-2 animate-bounce-y opacity-50">
          <span className="text-white text-xs tracking-widest uppercase">Scroll</span>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Amber bottom stripe */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-amber-500" />
    </div>
  )
}
