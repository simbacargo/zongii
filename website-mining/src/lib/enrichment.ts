/**
 * Hand-written copy layered over the generated catalog (src/lib/catalog.json).
 * catalog.json is bulk stock data and stays untouched — descriptions and spec
 * notes live here so a catalog regeneration never wipes them.
 */

export interface ItemEnrichment {
  description?: string
  specs?: string[]
}

/** One written blurb per catalog category — the guaranteed fallback for every product page. */
const CATEGORY_COPY: Record<string, string> = {
  general:
    'Site consumables and general supply kept on the Mwanza shelf — the odds and ends every operation burns through between major orders.',
  pumps:
    'Dewatering, slurry and borehole pumps held in Mwanza — submersibles, centrifugals and long-shaft units sized to the duty, with seals and spares to match.',
  blowers:
    'Root blowers and ventilation fans for aeration and underground air movement — stocked with the drive-side spares that keep them turning.',
  'gear-motors':
    'Gear motors, knife and butterfly valves, and flow-control hardware for tailings and process water lines — pressure-rated and shelf-ready.',
  machines:
    'Machines and the spare parts that keep them alive — bought once, matched exactly, and fitted before anything leaves the depot.',
  compressors:
    'Compressed air plant, pipe and the full fitting range — PVC and HDPE lines, couplings, tanks and filters to run water and air from shaft to plant.',
  winches:
    'Electric and diesel winches and hoists for shaft and decline work — braked and unbraked, with rope lengths quoted per drum.',
  fire:
    'Compliance-ready fire lines for camp and plant — hydrant stands, hose reels and extinguishers your safety officer can sign off on.',
  safety:
    'PPE that gets worn, not stored — masks, helmets, lamps and hearing protection stocked deep because crews go through them.',
  tools:
    'Hand tools and spanners for the workshop and the face — full sets and singles, from pipe wrenches to laser levels.',
  ropes:
    'Ropes, kamba and wire for rigging and haulage — sold by the roll or cut to length, rated honestly.',
}

/**
 * Optional per-item copy, keyed `${categoryId}/${itemId}` — item ids are only
 * guaranteed unique within a category. Sparse by design: flagship lines only.
 */
const ITEM_ENRICHMENT: Record<string, ItemEnrichment> = {
  'pumps/ns-pump': {
    description:
      'The workhorse slurry pump of the Lake Victoria Goldfields — NS-series units move gritty, abrasive pulp that would eat an ordinary water pump in a season.',
    specs: ['Slurry-rated wet end', 'NS50 through NS150 frames', 'Impellers and seals held as spares'],
  },
  'pumps/electric-centrifigal-pump': {
    description:
      'Surface centrifugal for clean and near-clean water — pit-floor dewatering, process feed and transfer duty off 380V site power.',
    specs: ['11KW 380V three-phase', 'Direct-coupled, minimal maintenance', 'Flanged suction and delivery'],
  },
  'pumps/pedrollo-pump-ndefu': {
    description:
      'Long-shaft (ndefu) Pedrollo borehole units for deep, narrow wet shafts — lowered down the hole and run hard.',
    specs: ['15HP and 20HP heads', 'Multistage bowl assembly', 'Genuine Pedrollo build'],
  },
  'blowers/root-blower': {
    description:
      'Positive-displacement root blowers for elution, aeration and underground ventilation — steady air at pressure, hour after hour.',
    specs: ['11KW and 15KW frames', 'DN100 delivery available', 'Relief valves and silencers on request'],
  },
  'gear-motors/gear-motor-yopa': {
    description:
      'YOPA worm gear motors for agitators, feeders and ball-mill ancillaries — high reduction in one compact case.',
    specs: ['ZQ-250 to ZQ-400 cases', 'Ratios to suit the duty', 'Input couplings stocked'],
  },
  'gear-motors/ss-knife-valve': {
    description:
      'Stainless knife gates that shear through slurry and tailings where a seated valve would jam — the standard isolation valve on process lines.',
    specs: ['DN80 to DN150, PN16', 'Stainless gate and body', 'Hand-wheel operation'],
  },
  'gear-motors/knife-valve-blue': {
    description:
      'Cast knife gate valves for tailings and process water isolation, stocked up to DN300 — the big bores your pipeline drawings call for.',
    specs: ['DN100 to DN300 12", PN16', 'Resilient seat', 'Flanged to standard drilling'],
  },
  'gear-motors/demolition-hammer-yopa': {
    description:
      'YOPA demolition hammers for development headings and civil breaking — paired with the point and flat steels on the same shelf.',
    specs: ['1700W to 2500W', 'Takes standard hex steels', 'Bit points and flats stocked alongside'],
  },
  'compressors/air-compressor-zhigao': {
    description:
      'Zhigao piston compressors sized for drilling and plant air — the unit small mines run their whole airline from.',
    specs: ['405CY frame, 37KW', 'Piston heads held as spares', 'Receiver tanks available'],
  },
  'winches/electric-winch-with-break': {
    description:
      'Braked electric winches for shaft and decline haulage — the brake is the difference between a hoist and an accident report.',
    specs: ['0.75T to 2T pulls, ratio 16', 'Drum rope lengths quoted per unit', 'Fitted with mechanical brake'],
  },
  'winches/diesel-winch': {
    description:
      'Diesel-driven winches for sites without reliable power — haulage that keeps moving when the grid does not.',
    specs: ['1, 2 and 3 tonne pulls', 'Self-contained diesel drive', 'Wire rope supplied to length'],
  },
  'fire/fire-extinguisher': {
    description:
      'Powder and CO2 extinguishers for camp, plant and vehicles — inspection-tagged stock your compliance audit will accept.',
    specs: ['CO2 5KG for electrical risk', 'Powder 5KG to 50KG wheeled', 'Brackets and signage available'],
  },
  'fire/fire-hydrant-stand-doublr-complet': {
    description:
      'Double-outlet hydrant stands, supplied complete — the fixed backbone of a plant fire line.',
    specs: ['Twin instantaneous outlets', 'Supplied with valves fitted', 'Matches standard hose couplings'],
  },
  'safety/solar-powered-led-head-lamp': {
    description:
      'Solar-charged LED cap lamps for crews working past the last power point — charge in daylight, run through the shift.',
    specs: ['Model LY-807', 'Helmet-mount clip', 'No charging bank required'],
  },
}

export function getEnrichment(categoryId: string, itemId: string): ItemEnrichment {
  return ITEM_ENRICHMENT[`${categoryId}/${itemId}`] ?? {}
}

export function getCategoryCopy(categoryId: string): string | undefined {
  return CATEGORY_COPY[categoryId]
}
