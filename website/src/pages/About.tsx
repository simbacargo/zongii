import React from 'react'
import { Link } from 'react-router-dom'
import AnimatedSection from '../ui/AnimatedSection'
import StatsBar from '../components/StatsBar'

const WHY_POINTS = [
  'Commitment to work',
  'Cost effective pricing',
  'Highly experienced, plumbing-passionate staff',
  "Attention to neatness and workmanship",
  'Quality customer service',
  "Ensures client engagement throughout every project",
]

const TEAM_VALUES = [
  { icon: '🏭', title: 'Manufacturer', description: 'We manufacture select product lines to exacting quality standards, ensuring full traceability from raw material to finished product.' },
  { icon: '🚚', title: 'Distributor', description: 'We are an authorised distributor for leading international brands, giving you access to the widest possible product range from a single trusted partner.' },
]

export default function About() {
  return (
    <>
      {/* Page Hero */}
      <div className="relative bg-gradient-to-br from-navy-900 via-navy-700 to-navy-600 pt-32 pb-20 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-navy-400/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-amber-500" />

        <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Est. 2002 · Incorporated 2009
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-5">
            About <span className="text-amber-400">Zongii</span>
          </h1>
          <p className="text-navy-200 text-lg max-w-2xl mx-auto leading-relaxed">
            Over two decades of quality, value, trust and reliability — serving Tanzania's
            plumbing and construction industry from Mwanza.
          </p>
        </div>
      </div>

      {/* Stats */}
      <StatsBar />

      {/* The Company */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <AnimatedSection>
              <span className="inline-block text-amber-600 font-bold text-sm uppercase tracking-widest mb-3 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full">
                The Company
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-black text-navy-700 mt-4 mb-6 leading-tight">
                Built on Trust.<br />
                <span className="text-amber-500">Proven by Results.</span>
              </h2>
              <div className="space-y-4 text-slate-600 text-base leading-relaxed">
                <p>
                  Zongii Plumbing Co. Limited is a private company limited by shares, incorporated on
                  <strong className="text-navy-700"> 21st October 2009</strong> in accordance with the provisions of the
                  Registrar of Business Names Act as a wholly owned limited company.
                </p>
                <p>
                  The company is registered with the Tanzania Revenue Authority (TRA) under Section 23 of the
                  Tax Administration Act 2015, certified with Tax Payer Identification Number (TIN)
                  <strong className="text-navy-700"> 108-998-350</strong>.
                </p>
                <p>
                  Founded on <strong className="text-navy-700">April 5th, 2002</strong>, Zongii has over the past
                  two decades earned a reputation for a unique combination of quality, value, trust and reliability.
                  Our culture of delivering value to clients to the highest standard remains core to everything we do.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={1}>
              <div className="bg-slate-50 rounded-3xl p-8 sm:p-10 border border-slate-100">
                <h3 className="font-display text-2xl font-black text-navy-700 mb-6">Company Details</h3>
                <div className="space-y-5">
                  {[
                    { label: 'Registered Name', value: 'Zongii Plumbing Co. Limited' },
                    { label: 'Founded', value: 'April 5, 2002' },
                    { label: 'Incorporated', value: 'October 21, 2009' },
                    { label: 'Company Type', value: 'Private Limited Company' },
                    { label: 'TIN Number', value: '108-998-350' },
                    { label: 'Registering Authority', value: 'Tanzania Revenue Authority (TRA)' },
                    { label: 'Head Office', value: 'Pamba Road, Mwanza, Tanzania' },
                  ].map(item => (
                    <div key={item.label} className="flex gap-4 pb-4 border-b border-slate-200 last:border-0 last:pb-0">
                      <div className="w-4 h-4 mt-0.5 rounded-full bg-amber-500 flex-shrink-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                        <p className="text-navy-700 font-semibold text-sm">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <AnimatedSection className="text-center mb-14">
            <span className="inline-block text-amber-600 font-bold text-sm uppercase tracking-widest mb-3 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full">
              Our Purpose
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-navy-700 mt-4">
              Vision & Mission
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8">
            <AnimatedSection delay={1}>
              <div className="bg-navy-600 rounded-3xl p-8 sm:p-10 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-navy-500/40 blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center mb-6 text-2xl shadow-amber-glow">
                    🎯
                  </div>
                  <h3 className="font-display text-3xl font-black text-white mb-4">Our Vision</h3>
                  <p className="text-navy-200 text-base leading-relaxed">
                    We are committed to our customers — understanding their current and future needs,
                    meeting their requirements and continually striving to exceed their expectations.
                    We envision a Tanzania where every construction project, no matter the scale, has
                    access to quality materials and expert guidance.
                  </p>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={2}>
              <div className="bg-amber-500 rounded-3xl p-8 sm:p-10 h-full relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-amber-400/40 blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-navy-700 flex items-center justify-center mb-6 text-2xl">
                    🚀
                  </div>
                  <h3 className="font-display text-3xl font-black text-navy-900 mb-4">Our Mission</h3>
                  <p className="text-navy-800 text-base leading-relaxed">
                    To provide high-quality, affordable plumbing and construction products to our
                    customers across Tanzania. We achieve this by building strong supplier partnerships,
                    maintaining rigorous quality standards and ensuring every client receives genuine
                    value for money on every purchase.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <AnimatedSection className="text-center mb-14">
            <span className="inline-block text-amber-600 font-bold text-sm uppercase tracking-widest mb-3 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full">
              Who We Are
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-navy-700 mt-4 mb-5">
              Both Manufacturer <span className="text-amber-500">&</span> Distributor
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
              We are both a manufacturer and distributor of quality materials — giving our clients
              unrivalled choice, quality control and competitive pricing from a single partner.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {TEAM_VALUES.map((item, i) => (
              <AnimatedSection key={item.title} delay={(i + 1) as 1 | 2}>
                <div className="border-2 border-slate-100 hover:border-amber-400 rounded-3xl p-8 sm:p-10 transition-all duration-300 group h-full">
                  <div className="text-5xl mb-5">{item.icon}</div>
                  <h3 className="font-display text-2xl font-black text-navy-700 mb-3 group-hover:text-navy-600">{item.title}</h3>
                  <p className="text-slate-500 text-base leading-relaxed">{item.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={2}>
            <div className="bg-navy-50 border border-navy-100 rounded-3xl p-8 sm:p-10">
              <div className="flex gap-5 items-start">
                <div className="w-14 h-14 rounded-2xl bg-navy-600 flex items-center justify-center flex-shrink-0 text-2xl mt-1">
                  💡
                </div>
                <div>
                  <h3 className="font-display text-2xl font-black text-navy-700 mb-3">Our Materials Quality is Second to None</h3>
                  <p className="text-slate-600 text-base leading-relaxed max-w-3xl">
                    We understand that your satisfaction is what keeps our company growing. That is why we focus
                    entirely on your requirements and deliver exactly what you need — because more or less is not
                    an option. Every product is tested, every batch is traceable and every delivery is backed by
                    our quality guarantee.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-navy-600 py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-navy-500/30 blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-navy-700/40 blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/3" />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-start">

            <AnimatedSection className="lg:w-2/5 flex-shrink-0">
              <span className="inline-block text-amber-400 font-bold text-sm uppercase tracking-widest mb-4 bg-amber-500/15 border border-amber-500/30 px-4 py-1.5 rounded-full">
                Why Choose Zongii
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
                A Great Variety of Products & Services in Building and Construction.
              </h2>
              <p className="text-navy-200 text-lg leading-relaxed mb-8">
                Our approach to handling clients' projects is exceptional. We focus on providing value
                for money — the basis of a return customer and the reason Zongii continues to grow
                after more than two decades.
              </p>
              <Link
                to="/#contact"
                className="inline-flex items-center gap-2 border-2 border-amber-500 text-amber-400 font-bold px-7 py-3.5 rounded-full hover:bg-amber-500 hover:text-navy-900 transition-all duration-200"
              >
                Talk to Our Team
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </AnimatedSection>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {WHY_POINTS.map((point, i) => (
                <AnimatedSection key={point} delay={(i % 4 + 1) as 1 | 2 | 3 | 4}>
                  <div className="bg-navy-700/50 border border-navy-500 rounded-2xl p-6 backdrop-blur-sm hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-1 group h-full flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0 shadow-amber-glow group-hover:scale-110 transition-transform duration-200">
                      <svg className="w-4 h-4 text-navy-900" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-white font-semibold text-sm leading-snug mt-1">{point}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-amber-500 py-16">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <AnimatedSection>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-navy-900 mb-4">
              Ready to Work with Us?
            </h2>
            <p className="text-navy-800 text-lg mb-8 max-w-xl mx-auto">
              Get in touch with our team for a quote, product enquiry or technical advice.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/#contact"
                className="bg-navy-700 text-white font-bold px-8 py-4 rounded-full hover:bg-navy-600 transition-all duration-200 hover:-translate-y-0.5 shadow-navy-card"
              >
                Get a Quote
              </Link>
              <Link
                to="/news"
                className="bg-white/30 border-2 border-navy-800/30 text-navy-900 font-bold px-8 py-4 rounded-full hover:bg-white/50 transition-all duration-200 hover:-translate-y-0.5"
              >
                Read Our News →
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
