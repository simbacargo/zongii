import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { NEWS_ARTICLES, NewsArticle } from '../data/content'
import AnimatedSection from '../ui/AnimatedSection'

const CATEGORIES = ['All', 'Products', 'Company', 'Industry', 'Community'] as const
type FilterCat = typeof CATEGORIES[number]

const CATEGORY_COLORS: Record<string, string> = {
  Products:  'bg-amber-100 text-amber-700 border-amber-200',
  Company:   'bg-navy-100 text-navy-700 border-navy-200',
  Industry:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  Community: 'bg-purple-100 text-purple-700 border-purple-200',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <article className="group bg-white rounded-2xl shadow-navy-card border border-slate-100 hover:border-amber-400/60 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col">
      {/* Category banner */}
      <div className="h-3 bg-amber-500 flex-shrink-0" />

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-[11px] font-bold uppercase tracking-widest border px-2.5 py-1 rounded-full ${CATEGORY_COLORS[article.category]}`}>
            {article.category}
          </span>
          <span className="text-xs text-slate-400">{formatDate(article.date)}</span>
        </div>

        <h2 className="font-display text-xl font-black text-navy-700 mb-3 leading-snug group-hover:text-navy-600 transition-colors">
          {article.title}
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed flex-1 mb-5">
          {article.excerpt}
        </p>

        <Link
          to={`/news/${article.id}`}
          className="inline-flex items-center gap-2 text-amber-600 font-bold text-sm hover:text-amber-700 transition-colors group/link"
        >
          Read Article
          <svg className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </article>
  )
}

export default function News() {
  const [active, setActive] = useState<FilterCat>('All')

  const filtered = active === 'All'
    ? NEWS_ARTICLES
    : NEWS_ARTICLES.filter(a => a.category === active)

  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date))

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
            Company Updates & Industry Insights
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-5">
            Latest <span className="text-amber-400">News</span>
          </h1>
          <p className="text-navy-200 text-lg max-w-2xl mx-auto leading-relaxed">
            Stay up to date with new products, company announcements and expert
            insights from the Zongii team.
          </p>
        </div>
      </div>

      {/* Articles */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">

          {/* Filter tabs */}
          <AnimatedSection className="mb-10">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-nowrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                    active === cat
                      ? 'bg-navy-600 text-white shadow-navy-card'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </AnimatedSection>

          {sorted.length === 0 ? (
            <div className="text-center py-20 text-slate-400 text-lg">
              No articles in this category yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map((article, i) => (
                <AnimatedSection key={article.id} delay={(i % 3) as 0 | 1 | 2}>
                  <NewsCard article={article} />
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-navy-600 py-16">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <AnimatedSection>
            <div className="text-4xl mb-4">📬</div>
            <h2 className="font-display text-3xl font-black text-white mb-3">
              Stay in the Loop
            </h2>
            <p className="text-navy-200 text-base mb-6 leading-relaxed">
              Contact us at{' '}
              <a href="mailto:info@zongii.co.tz" className="text-amber-400 font-semibold hover:text-amber-300 transition-colors">
                info@zongii.co.tz
              </a>{' '}
              to be added to our mailing list and receive the latest news and product updates directly.
            </p>
            <Link
              to="/#contact"
              className="inline-flex items-center gap-2 bg-amber-500 text-navy-900 font-bold px-8 py-4 rounded-full hover:bg-amber-400 transition-all duration-200 shadow-amber-glow hover:-translate-y-0.5"
            >
              Get in Touch
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
