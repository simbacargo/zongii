import React from 'react'
import { INDUSTRIES } from '../data/content'
import AnimatedSection from '../ui/AnimatedSection'

export default function Experience() {
  return (
    <section id="experience" className="bg-slate-50 py-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        <AnimatedSection className="text-center mb-16">
          <span className="inline-block text-amber-600 font-bold text-sm uppercase tracking-widest mb-3 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full">
            Our Experience
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-black text-navy-700 mt-4 mb-5">
            Industries We Serve
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
            With over 15 years in the field, we have the expertise and product range
            to meet the diverse plumbing and construction needs of every sector.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {INDUSTRIES.map((industry, i) => (
            <AnimatedSection key={industry.id} delay={(Math.min(i % 5, 4)) as 0|1|2|3|4}>
              <div className="group bg-white border-2 border-transparent hover:border-amber-400 rounded-2xl p-6 text-center shadow-navy-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col items-center">
                <span className="text-4xl mb-3 block">{industry.icon}</span>
                <h3 className="font-bold text-navy-700 text-sm leading-snug mb-2 group-hover:text-navy-600">
                  {industry.label}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed hidden sm:block">
                  {industry.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
