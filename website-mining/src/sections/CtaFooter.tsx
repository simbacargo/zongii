import { Link } from 'react-router'
import { COMPANY, NAV_LINKS } from '../lib/data'
import { Reveal, RevealHeading, Magnetic } from '../components/ui'
import { useGoToSection } from '../hooks/useGoToSection'

/** Ember-lit closing stratum: the ask, then the ledger. */
export default function CtaFooter() {
  const year = new Date().getFullYear()
  const goToSection = useGoToSection()
  return (
    <footer id="contact" className="relative overflow-clip bg-basalt">
      {/* ember backdrop */}
      <div className="absolute inset-0" aria-hidden>
        <img src="/images/embers.jpg" alt="" className="h-full w-full object-cover opacity-70" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-b from-basalt via-basalt/60 to-basalt" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px] px-5 pb-10 pt-32 md:px-10 md:pt-44">
        <p className="eyebrow mb-6 text-gold">06 — CONTACT</p>
        <RevealHeading className="display max-w-[10ch] text-[clamp(3rem,8.5vw,8rem)] text-bone">
          Let's outfit your operation
        </RevealHeading>

        <Reveal delay={0.15} className="mt-10 flex flex-wrap items-center gap-5">
          <Magnetic>
            <a
              href={`mailto:${COMPANY.emailSales}`}
              data-cursor="WRITE"
              className="inline-block bg-gold px-9 py-5 font-mono text-sm font-semibold uppercase tracking-[0.16em] text-basalt transition-colors hover:bg-gold-hot"
            >
              {COMPANY.emailSales}
            </a>
          </Magnetic>
          <Magnetic>
            <a
              href={`tel:${COMPANY.phones[0].replace(/\s/g, '')}`}
              data-cursor="CALL"
              className="inline-block border border-bone/25 px-9 py-5 font-mono text-sm uppercase tracking-[0.16em] text-bone transition-colors hover:border-gold hover:text-gold"
            >
              {COMPANY.phones[0]}
            </a>
          </Magnetic>
        </Reveal>

        <div className="mt-28 grid gap-12 border-t border-bone/12 pt-12 md:mt-40 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-2xl font-extrabold tracking-tight text-bone">ZONGII</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-smoke">
              Mining & industrial supply for the Lake Victoria Goldfields — pumps,
              valves, piping, fire & safety, demolition and air systems.
            </p>
          </div>
          <div className="md:col-span-3">
            <p className="eyebrow mb-4 text-ash">Visit</p>
            <address className="text-sm not-italic leading-relaxed text-smoke">
              {COMPANY.address.split(', ').map((line) => (
                <span key={line} className="block">{line}</span>
              ))}
            </address>
          </div>
          <div className="md:col-span-2">
            <p className="eyebrow mb-4 text-ash">Call</p>
            <ul className="space-y-1.5 text-sm text-smoke">
              {COMPANY.phones.map((phone) => (
                <li key={phone}>
                  <a href={`tel:${phone.replace(/\s/g, '')}`} className="transition-colors hover:text-gold">
                    {phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <p className="eyebrow mb-4 text-ash">Descend</p>
            <ul className="space-y-1.5">
              {NAV_LINKS.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => goToSection(link.id)}
                    className="text-sm text-smoke transition-colors hover:text-gold"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              <li>
                <Link to="/catalog" className="text-sm text-gold transition-colors hover:text-gold-hot">
                  Catalog
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-bone/12 py-6 font-mono text-[10px] uppercase tracking-[0.18em] text-ash">
          <span>© {year} {COMPANY.name} — EST. {COMPANY.est}</span>
          <span>{COMPANY.coordinates} — MWANZA, TANZANIA</span>
          <span>SURFACE REACHED. -1240 M</span>
        </div>
      </div>
    </footer>
  )
}
