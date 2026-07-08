import { GALLERY } from '../lib/data'
import { Reveal, RevealHeading, ParallaxImage } from '../components/ui'

/** Dark stratum: field photography at mixed sizes and parallax rates. */
export default function Gallery() {
  return (
    <section id="gallery" className="relative bg-basalt py-28 md:py-36">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <p className="eyebrow mb-4 text-gold">05 — IN THE FIELD</p>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <RevealHeading className="display max-w-[12ch] text-[clamp(2.4rem,5vw,4.6rem)] text-bone">
            Dust on every invoice
          </RevealHeading>
          <Reveal delay={0.1} className="max-w-sm">
            <p className="text-sm leading-relaxed text-smoke">
              Shot at the sites we supply — pit walls, headings and workshops across the
              goldfields. If our vans aren't in frame, they've already left.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 md:mt-20 md:grid-cols-12 md:gap-6">
          {GALLERY.map((shot, i) => {
            const spans = [
              'md:col-span-7 aspect-[16/10]',
              'md:col-span-5 aspect-[4/5] md:mt-24',
              'md:col-span-4 aspect-[4/5]',
              'md:col-span-8 aspect-[16/9] md:-mt-16',
              'md:col-span-5 aspect-[4/3] md:mt-10',
              'md:col-span-7 aspect-[16/10]',
              'md:col-span-8 aspect-[16/9]',
              'md:col-span-4 aspect-[4/5] md:-mt-20',
            ]
            return (
              <Reveal key={shot.src} delay={(i % 3) * 0.07} className={`col-span-2 md:col-span-6 ${spans[i]}`}>
                <figure data-cursor="FIELD" className="group h-full">
                  <ParallaxImage
                    src={shot.src}
                    alt={shot.caption.toLowerCase()}
                    speed={shot.speed}
                    className="h-full w-full"
                    imgClassName="brightness-90 saturate-[0.85] group-hover:brightness-100 group-hover:saturate-100"
                  />
                  <figcaption className="mt-2.5 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-ash">
                    <span className="h-1 w-1 rotate-45 bg-gold/70" />
                    {shot.caption}
                  </figcaption>
                </figure>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
