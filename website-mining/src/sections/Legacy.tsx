import { STATS } from '../lib/data'
import { Reveal, RevealHeading, Counter, ParallaxImage } from '../components/ui'

/** Light "quartz" stratum: the company story with a layered photo stack. */
export default function Legacy() {
  return (
    <section id="legacy" className="strata-edge-bottom relative bg-bone pb-36 pt-28 text-basalt md:pt-36">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <p className="eyebrow mb-4 text-basalt/50">01 — LEGACY</p>
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-10">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <RevealHeading className="display max-w-[12ch] text-[clamp(2.6rem,5.5vw,5.2rem)]">
              Twenty-four years at the rock face
            </RevealHeading>
            <Reveal delay={0.15} className="mt-8 max-w-xl space-y-5 text-base leading-relaxed text-basalt/75 md:text-lg">
              <p>
                Zongii Mining Co. Ltd was founded in Mwanza in 2002, on the shore of Lake
                Victoria and at the centre of the richest gold district in East Africa.
                What began as a plumbing counter on Pamba Road grew the way the mines
                around it grew — one urgent order at a time.
              </p>
              <p>
                Today we stock and deliver the working guts of a mine: dewatering pumps,
                knife valves, pressure piping, fire lines, breakers and compressed air.
                When a DN300 valve lets go at 2 a.m., the distance between our shelf and
                your shaft is measured in hours, not shipping weeks.
              </p>
            </Reveal>
            <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 md:mt-16">
              {STATS.map((stat, i) => (
                <Reveal key={stat.label} delay={i * 0.08}>
                  <div className="border-t-2 border-basalt/80 pt-4">
                    <Counter value={stat.value} suffix={stat.suffix} className="font-display text-5xl font-extrabold tracking-tight md:text-6xl" />
                    <p className="eyebrow mt-2 text-basalt/50">{stat.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* layered photo stack */}
          <div className="relative">
            <Reveal>
              <ParallaxImage
                src="/images/tunnel-light.jpg"
                alt="Timbered mine tunnel lit with warm lamps"
                speed={1.12}
                className="aspect-[4/5] w-[88%]"
              />
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-basalt/45">
                FIG. 01 — TIMBERED ADIT, SERVICES INSTALLED
              </p>
            </Reveal>
            <Reveal delay={0.2} className="absolute -bottom-16 right-0 w-[52%] shadow-2xl">
              <ParallaxImage
                src="/images/miners-cart.jpg"
                alt="Archival photograph of miners pushing an ore cart"
                speed={1.3}
                className="aspect-[5/4]"
                imgClassName="grayscale"
              />
              <p className="mt-3 bg-bone font-mono text-[10px] uppercase tracking-[0.2em] text-basalt/45">
                FIG. 02 — THE OLD WAY. WE SUPPLY THE NEW ONE.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="absolute -left-2 top-[58%] hidden w-[34%] shadow-xl md:block">
              <ParallaxImage
                src="/images/ore.jpg"
                alt="Close-up of mineral ore"
                speed={0.85}
                className="aspect-square"
              />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
