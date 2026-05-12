import React, { useMemo, useState } from 'react'
import { FILTER_CATEGORIES, PRODUCTS, Product } from '../data/content'
import AnimatedSection from '../ui/AnimatedSection'

function ProductCard({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false)

  return (
    <article className="group bg-white rounded-2xl shadow-navy-card border border-slate-100 hover:border-amber-400/60 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col">
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-slate-100 flex-shrink-0">
        {imgError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <svg className="w-12 h-12 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-slate-400 font-medium">{product.name}</span>
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {/* Category badges overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1 max-w-[80%]">
          {product.categories.slice(0, 2).map(cat => (
            <span key={cat} className="text-[10px] font-bold bg-navy-600/80 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
              {cat}
            </span>
          ))}
          {product.categories.length > 2 && (
            <span className="text-[10px] font-bold bg-navy-600/80 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
              +{product.categories.length - 2}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-navy-700 text-base mb-2 group-hover:text-navy-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed flex-1">
          {product.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {product.categories.map(cat => (
            <span key={cat} className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              {cat}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

export default function Products() {
  const [active, setActive] = useState<string>('All')

  const filtered = useMemo(
    () => active === 'All' ? PRODUCTS : PRODUCTS.filter(p => p.categories.includes(active)),
    [active]
  )

  return (
    <section id="products" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        <AnimatedSection className="text-center mb-12">
          <span className="inline-block text-amber-600 font-bold text-sm uppercase tracking-widest mb-3 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full">
            Our Products
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-black text-navy-700 mt-4 mb-5">
            What We Supply
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
            A comprehensive range of high-quality products sourced to meet every
            plumbing, building and construction requirement.
          </p>
        </AnimatedSection>

        {/* Filter tabs */}
        <AnimatedSection delay={1} className="mb-10">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-start sm:justify-center flex-nowrap">
            {FILTER_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  active === cat
                    ? 'bg-navy-600 text-white shadow-navy-card'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product, i) => (
            <AnimatedSection key={product.id} delay={(i % 3) as 0|1|2}>
              <ProductCard product={product} />
            </AnimatedSection>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            No products in this category.
          </div>
        )}
      </div>
    </section>
  )
}
