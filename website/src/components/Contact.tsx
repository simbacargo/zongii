import React, { useState } from 'react'
import AnimatedSection from '../ui/AnimatedSection'

const INFO = [
  { icon: '📍', label: 'Address',   value: 'Dar es Salaam, Tanzania' },
  { icon: '📞', label: 'Phone',     value: '+255 700 000 000' },
  { icon: '✉️', label: 'Email',     value: 'info@zongii.co.tz' },
  { icon: '🕐', label: 'Hours',     value: 'Mon – Fri  ·  8:00 am – 5:00 pm EAT' },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', company: '', phone: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section id="contact" className="bg-slate-50 py-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        <AnimatedSection className="text-center mb-16">
          <span className="inline-block text-amber-600 font-bold text-sm uppercase tracking-widest mb-3 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full">
            Get in Touch
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-black text-navy-700 mt-4 mb-5">
            Let's Talk
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
            Need a quote, have a question, or want to discuss a project? We'd love to hear from you.
          </p>
        </AnimatedSection>

        <div className="grid lg:grid-cols-5 gap-10 items-start">

          {/* Form */}
          <AnimatedSection delay={1} className="lg:col-span-3 bg-white rounded-3xl shadow-navy-card border border-slate-100 p-8 sm:p-10">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-72 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-5 text-3xl">
                  ✅
                </div>
                <h3 className="font-display text-2xl font-black text-navy-700 mb-3">Message Sent!</h3>
                <p className="text-slate-500 text-base max-w-sm">
                  Thank you for reaching out. Our team will get back to you within one business day.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', company: '', phone: '', email: '', message: '' }) }}
                  className="mt-6 text-sm font-semibold text-amber-600 hover:text-amber-700 underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <label className="block">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Full Name *</span>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={set('name')}
                      placeholder="e.g. Juma Hassan"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Company</span>
                    <input
                      type="text"
                      value={form.company}
                      onChange={set('company')}
                      placeholder="Your company name"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                    />
                  </label>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <label className="block">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Phone *</span>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={set('phone')}
                      placeholder="+255 7XX XXX XXX"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Email</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      placeholder="you@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Message *</span>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={set('message')}
                    placeholder="Tell us about your project or enquiry…"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition resize-none"
                  />
                </label>
                <button
                  type="submit"
                  className="w-full bg-amber-500 text-navy-900 font-bold text-base py-4 rounded-full hover:bg-amber-400 transition-all duration-200 shadow-amber-glow hover:shadow-xl hover:-translate-y-0.5"
                >
                  Send Message →
                </button>
              </form>
            )}
          </AnimatedSection>

          {/* Contact info */}
          <AnimatedSection delay={2} className="lg:col-span-2">
            <div className="bg-navy-600 rounded-3xl p-8 sm:p-10 h-full">
              <h3 className="font-display text-2xl font-black text-white mb-2">Contact Info</h3>
              <p className="text-navy-200 text-sm mb-8 leading-relaxed">
                Reach us directly — we're happy to help with quotes, product availability
                and technical advice.
              </p>

              <div className="space-y-6">
                {INFO.map(item => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-lg">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-navy-300 text-xs font-bold uppercase tracking-widest mb-0.5">{item.label}</p>
                      <p className="text-white font-semibold text-sm">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-navy-500">
                <p className="text-navy-300 text-xs font-bold uppercase tracking-widest mb-4">Follow Us</p>
                <div className="flex gap-3">
                  {[
                    { label: 'Facebook', path: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
                    { label: 'LinkedIn', path: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z' },
                    { label: 'WhatsApp', path: 'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z' },
                  ].map(s => (
                    <button key={s.label} aria-label={s.label} className="w-10 h-10 rounded-xl bg-navy-700 hover:bg-amber-500 hover:text-navy-900 text-navy-300 flex items-center justify-center transition-all duration-200 group">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={s.path} />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
