export const COMPANY = {
  name: 'Zongii Mining Co. Ltd',
  short: 'ZONGII',
  est: 2002,
  address: 'Pamba Road, P.O. Box 6419, Mwanza, Tanzania',
  coordinates: '2°31′S 32°54′E',
  emailSales: 'sales@zongii.co.tz',
  emailGeneral: 'info@zongii.co.tz',
  phones: ['+255 769 005 007', '+255 743 004 008', '+255 785 856 363'],
}

export interface EquipmentLine {
  id: string
  index: string
  name: string
  image: string
  blurb: string
  specs: string[]
  /** id of the closest catalog category (src/lib/catalog.json) */
  catalogCategory: string
}

/** Specs lifted from the live Zongii mining stock list. */
export const EQUIPMENT: EquipmentLine[] = [
  {
    id: 'pumps',
    catalogCategory: 'pumps',
    index: 'EQ-01',
    name: 'Pumps & Motors',
    image: '/images/pump-turbine.jpg',
    blurb:
      'Dewatering and slurry pumps that keep the pit floor dry — from submersibles to 50 HP surface units, with gear motors and vibrator motors to match.',
    specs: ['NS150 SLURRY PUMP', 'CENTRIFUGAL 22KW 380V', 'YOPA GEAR MOTOR 1:51', 'SEMOSI 20–50HP'],
  },
  {
    id: 'valves',
    catalogCategory: 'gear-motors',
    index: 'EQ-02',
    name: 'Valves & Flow Control',
    image: '/images/pipes-valves.jpg',
    blurb:
      'Knife gates, butterflies and pneumatic actuation for tailings and process water — stainless or PVC, stocked in Mwanza up to DN300.',
    specs: ['SS KNIFE VALVE DN300 12″ PN16', 'BUTTERFLY DN80–DN150 PN16', 'PNEUMATIC ACTUATION', 'PVC BUTTERFLY 2″'],
  },
  {
    id: 'piping',
    catalogCategory: 'compressors',
    index: 'EQ-03',
    name: 'Piping & Fittings',
    image: '/images/pipes-stack.jpg',
    blurb:
      'Pressure-rated PVC and HDPE lines with the elbows, tees, reducers and couplings to run water from shaft to plant without improvising.',
    specs: ['PVC & HDPE PN16', 'FULL FITTING RANGE ½″–12″', 'POLYETHYLENE TANKS 5000L+', 'PRECISE FILTERS 60–80MM'],
  },
  {
    id: 'fire',
    catalogCategory: 'fire',
    index: 'EQ-04',
    name: 'Fire & Safety',
    image: '/images/fire-extinguisher.jpg',
    blurb:
      'Compliance-ready fire lines for camp and plant: hydrant stands, hose reels and powder extinguishers, plus cones and site signage.',
    specs: ['FIRE HYDRANT STAND, DOUBLE', 'POWDER EXTINGUISHER 50KG', 'HOSE REEL 2.5″ 16BAR 30M', 'TRAFFIC SAFETY CONES'],
  },
  {
    id: 'demolition',
    catalogCategory: 'tools',
    index: 'EQ-05',
    name: 'Demolition & Drilling',
    image: '/images/grinder-sparks.jpg',
    blurb:
      'Breakers and bits for development headings and civil works — demolition hammers with point and flat steels, benders and cutting tools.',
    specs: ['DEMOLITION HAMMER, EDON', 'BIT POINT & FLAT 1–1½FT', 'PIPE BENDER ½″–2″', 'PRESSURE WASHER 3″–4″'],
  },
  {
    id: 'air',
    catalogCategory: 'compressors',
    index: 'EQ-06',
    name: 'Air & Power',
    image: '/images/machine-detail.jpg',
    blurb:
      'Compressed air and standby power for the whole operation: root blowers, compressors, diesel alternator sets and 3-tonne electric winches.',
    specs: ['ROOT BLOWER 11KW', 'AIR COMPRESSOR 22KW', 'ALTERNATOR + DIESEL ENGINE', 'ELECTRIC WINCH 3T, BRAKED'],
  },
]

export function getEquipmentLine(id: string | undefined): EquipmentLine | undefined {
  return EQUIPMENT.find((line) => line.id === id)
}

export const STATS = [
  { value: 24, suffix: '', label: 'Years at the rock face' },
  { value: 6, suffix: '', label: 'Equipment lines in stock' },
  { value: 2400, suffix: '+', label: 'SKUs held in Mwanza' },
  { value: 300, suffix: '+', label: 'Sites supplied to date' },
]

export const GOLDFIELDS = [
  { name: 'Geita', note: 'GOLD · OPEN PIT & UG' },
  { name: 'Bulyanhulu', note: 'GOLD · UNDERGROUND' },
  { name: 'North Mara', note: 'GOLD · OPEN PIT' },
  { name: 'Buzwagi', note: 'GOLD · RECLAMATION' },
  { name: 'Shinyanga', note: 'DIAMOND & GOLD CORRIDOR' },
  { name: 'Mwanza', note: 'DEPOT · PAMBA ROAD' },
]

export const PROCESS = [
  {
    step: '01',
    title: 'Enquire',
    body: 'Send your list, BOQ or a photo of the failed part — phone, email or WhatsApp. An engineer reads it, not a call centre.',
  },
  {
    step: '02',
    title: 'Quote',
    body: 'Same-day pricing on stocked lines, with PN ratings and substitutions flagged honestly, so procurement signs off once.',
  },
  {
    step: '03',
    title: 'Fulfil',
    body: 'Picked from our Mwanza depots and test-fitted where it matters — flanges mated, threads gauged — before anything leaves.',
  },
  {
    step: '04',
    title: 'Deliver',
    body: 'Same-week delivery across the Lake Victoria Goldfields, straight to your laydown, with the paperwork your stores office needs.',
  },
]

export const GALLERY = [
  { src: '/images/pit-road.jpg', caption: 'BENCH WALL, OXIDISED ORE BODY', speed: 1 },
  { src: '/images/dump-truck.jpg', caption: 'HAULAGE ON THE RAMP', speed: 1.18 },
  { src: '/images/welder.jpg', caption: 'FABRICATION, MWANZA WORKSHOP', speed: 0.9 },
  { src: '/images/tunnel-machines.jpg', caption: 'DEVELOPMENT HEADING, SERVICES RUN', speed: 1.12 },
  { src: '/images/quarry-machine.jpg', caption: 'LOADING AT THE FACE', speed: 0.95 },
  { src: '/images/crew.jpg', caption: 'SITE CREW, SHIFT CHANGE', speed: 1.22 },
  { src: '/images/tunnel-pipes.jpg', caption: 'COMPRESSED AIR & WATER LINES', speed: 0.88 },
  { src: '/images/haul-truck.jpg', caption: 'OUTBOUND, GEITA ROAD', speed: 1.08 },
]

export const NAV_LINKS = [
  { id: 'legacy', label: 'Legacy' },
  { id: 'equipment', label: 'Equipment' },
  { id: 'operations', label: 'Operations' },
  { id: 'process', label: 'Process' },
  { id: 'gallery', label: 'Field' },
  { id: 'contact', label: 'Contact' },
]

/** Total fictional-but-plausible "depth" the page descends, in metres. */
export const MAX_DEPTH_M = 1240
