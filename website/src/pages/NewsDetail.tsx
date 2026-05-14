import React from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { NEWS_ARTICLES } from '../data/content'
import AnimatedSection from '../ui/AnimatedSection'

const CATEGORY_COLORS: Record<string, string> = {
  Products:  'bg-amber-100 text-amber-700 border-amber-200',
  Company:   'bg-navy-100 text-navy-700 border-navy-200',
  Industry:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  Community: 'bg-purple-100 text-purple-700 border-purple-200',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function renderContent(content: string) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: string[] = []

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="space-y-2 my-4 pl-1">
          {listItems.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-slate-600 text-base leading-relaxed">
              <span className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-navy-900" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.+?)\*\*/g, '<strong class="text-navy-700">$1</strong>') }} />
            </li>
          ))}
        </ul>
      )
      listItems = []
    }
  }

  lines.forEach((line, i) => {
    if (line.startsWith('- ')) {
      listItems.push(line.slice(2))
    } else if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
      flushList()
      elements.push(
        <h3 key={i} className="font-display text-xl font-black text-navy-700 mt-8 mb-3">
          {line.slice(2, -2)}
        </h3>
      )
    } else if (line.trim() === '') {
      flushList()
    } else {
      flushList()
      elements.push(
        <p
          key={i}
          className="text-slate-600 text-base leading-relaxed my-3"
          dangerouslySetInnerHTML={{
            __html: line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-navy-700">$1</strong>')
          }}
        />
      )
    }
  })
  flushList()
  return elements
}

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>()
  const article = NEWS_ARTICLES.find(a => a.id === id)

  if (!article) return <Navigate to="/news" replace />

  const others = NEWS_ARTICLES.filter(a => a.id !== id).slice(0, 3)

  return (
    <>
      {/* Page Hero */}
      <div className="relative bg-gradient-to-br from-navy-900 via-navy-700 to-navy-600 pt-32 pb-20 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-amber-500" />

        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <Link to="/news" className="inline-flex items-center gap-2 text-navy-300 hover:text-amber-400 text-sm font-semibold transition-colors mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            Back to News
          </Link>

          <div className="flex items-center justify-center gap-3 mb-5">
            <span className={`text-[11px] font-bold uppercase tracking-widest border px-3 py-1 rounded-full ${CATEGORY_COLORS[article.category]}`}>
              {article.category}
            </span>
            <span className="text-navy-300 text-sm">{formatDate(article.date)}</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            {article.title}
          </h1>
        </div>
      </div>

      {/* Article body */}
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <AnimatedSection>
            <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-2xl p-6 mb-10">
              <p className="text-slate-700 text-base leading-relaxed font-medium italic">
                {article.excerpt}
              </p>
            </div>

            <div>{renderContent(article.content)}</div>
          </AnimatedSection>

          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Link
              to="/news"
              className="inline-flex items-center gap-2 text-navy-600 font-bold hover:text-amber-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              All News
            </Link>
            <Link
              to="/#contact"
              className="inline-flex items-center gap-2 bg-amber-500 text-navy-900 font-bold px-6 py-3 rounded-full hover:bg-amber-400 transition-all duration-200 shadow-amber-glow hover:-translate-y-0.5 text-sm"
            >
              Enquire About This
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* More articles */}
      {others.length > 0 && (
        <section className="bg-slate-50 py-16">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <h2 className="font-display text-2xl font-black text-navy-700 mb-8">More Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {others.map(a => (
                <Link
                  key={a.id}
                  to={`/news/${a.id}`}
                  className="group bg-white rounded-2xl shadow-navy-card border border-slate-100 hover:border-amber-400/60 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col"
                >
                  <div className="h-1.5 bg-amber-500 flex-shrink-0" />
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[10px] font-bold uppercase tracking-widest border px-2 py-0.5 rounded-full ${CATEGORY_COLORS[a.category]}`}>
                        {a.category}
                      </span>
                      <span className="text-xs text-slate-400">{formatDate(a.date)}</span>
                    </div>
                    <h3 className="font-display text-base font-black text-navy-700 mb-2 leading-snug group-hover:text-navy-600 transition-colors">
                      {a.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 flex-1">{a.excerpt}</p>
                    <span className="mt-4 text-amber-600 font-bold text-xs inline-flex items-center gap-1">
                      Read →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
