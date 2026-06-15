# Motion architecture

Zongii V2's animation system. **One library: Motion (Framer Motion, `motion/react`).** GSAP was
removed — the pinned Industries scroll is now done with Motion's `useScroll`/`useTransform`.

Principles: subtle and intentional, transform/opacity only (60fps), reveal **once**, and fully
honour `prefers-reduced-motion`.

## Source of truth — `lib/motion.ts`

Never hand-write easings/durations/springs in components. Import these:

| Export | Use |
| --- | --- |
| `ease.out` / `ease.inOut` | entrance / symmetric easing |
| `duration.fast .25` / `base .5` / `slow .7` | timing |
| `spring.snappy` / `soft` / `gentle` | buttons / cards & magnetic / ambient |
| `viewportOnce` | `whileInView` viewport (`{ once, amount: .25 }`) |
| `fadeUp` `fade` `scaleIn` `blurUp` | element variants |
| `staggerContainer(stagger, delay)` + `staggerItem` | lists/grids |
| `cardHover` | card lift + animated shadow |
| `hoverLift` / `tap` | button hover / press |

## Primitives — `components/motion/`

| Component | Purpose | Notes |
| --- | --- | --- |
| `Reveal` | single fade+rise on scroll | `delay`, `y`, `once` |
| `RevealGroup` + `RevealItem` | staggered list reveal | `RevealItem hover` adds card-lift |
| `TextReveal` | word-by-word masked heading rise | used by `SectionHeading` + hero |
| `Counter` | scroll-triggered count-up | MotionValue render, no re-renders |
| `Magnetic` | cursor-follow drift | hero CTAs |
| `TiltCard` | subtle 3D pointer tilt | product cards; off on touch/reduced-motion |
| `ScrollProgress` | top reading bar | `useScroll` + `useSpring` |
| `Marquee` | CSS infinite marquee | standards strip; pauses on hover |

Hook: `hooks/use-reveal.ts` — `useReveal({ delay })` returns spreadable props for any
`motion` element (no wrapper needed).

## When to reach for what
- **Default → Motion.** Layout/presence (`layout`, `AnimatePresence`), gestures (`whileHover/Tap`),
  variants, `useScroll`/`useTransform`.
- The only scroll-jacking effect (Industries horizontal pin) uses a tall section + `sticky` inner +
  `x = useTransform(scrollYProgress, …)` — transform-only, no plugin.

## Per-component map (what + why)

| Area | Animation | Why it helps UX |
| --- | --- | --- |
| Hero | staggered load (badge→headline→sub→CTA→trust), word reveal, ambient glow drift | establishes hierarchy on arrival without delaying interaction |
| Section headings | `TextReveal` word rise | draws the eye to section starts; premium feel |
| Stats | scroll count-up | makes numbers feel earned, signals "in view" |
| Products grid | stagger in, `layout` + `AnimatePresence` filter, **tilt** cards, chip `tap` | ordered scanning; filtering feels physical; tactile depth |
| Why / News / Industry cards | uniform hover lift + animated shadow | consistent affordance — "this is interactive" |
| Process | scroll-linked line draw + step stagger | visualises sequence/progress |
| Industries | pinned horizontal scroll | signature depth moment, spatial storytelling |
| Contact form | animated field errors, shake on invalid, success state | motion as feedback — directs attention, confirms outcome |
| Nav | `layoutId` underline, magnetic CTA, animated drawer | fast, responsive wayfinding |
| Routes | `template.tsx` fade+rise | continuity between pages |

## Accessibility
- `providers.tsx` wraps the app in `MotionConfig reducedMotion="user"` → Motion drops transform/opacity
  animations when the OS requests it.
- `TiltCard` and `Counter` early-return / settle instantly under reduced motion; Industries falls back to
  a normal scroll row.
- A CSS `prefers-reduced-motion` guard in `globals.css` tames any remaining CSS animation/transition.
- All interactive elements remain real `<button>`/`<a>` — keyboard and focus states preserved.
