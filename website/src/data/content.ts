export interface Product {
  id: string
  name: string
  categories: string[]
  image: string
  description: string
}

export interface Industry {
  id: string
  label: string
  icon: string
  description: string
}

export interface Stat {
  value: number
  suffix: string
  label: string
}

export interface Value {
  icon: string
  title: string
  description: string
}

export const FILTER_CATEGORIES = [
  'All', 'Building Materials', 'Building Tools',
  'Engineering', 'General', 'Plumbing', 'PVC',
] as const

export const PRODUCTS: Product[] = [
  {
    id: 'water-sinks',
    name: 'Water Sinks',
    categories: ['Building Tools', 'Plumbing'],
    image: 'https://zongii.co.tz/wp-content/uploads/2020/08/products_watersinks_thumb.jpg',
    description: 'Premium quality sinks for residential and commercial installations.',
  },
  {
    id: 'water-pumps',
    name: 'Water Pumps',
    categories: ['Engineering', 'Plumbing'],
    image: 'https://zongii.co.tz/wp-content/uploads/2020/07/products_waterpumps_thumb.jpg',
    description: 'Reliable pumping solutions for every scale of water system.',
  },
  {
    id: 'plumbing-accessories',
    name: 'Plumbing Accessories & Fitting',
    categories: ['Plumbing'],
    image: 'https://zongii.co.tz/wp-content/uploads/2020/07/products_plumbingaccessories_thumb.jpg',
    description: 'Complete range of fittings, valves and connectors.',
  },
  {
    id: 'ceramic-wares',
    name: 'Ceramic Wares',
    categories: ['Building Materials', 'Engineering', 'Plumbing'],
    image: 'https://zongii.co.tz/wp-content/uploads/2020/07/products_ceramic_thumb.jpg',
    description: 'High-grade ceramic basins, toilets and bathroom fittings.',
  },
  {
    id: 'hot-water-systems',
    name: 'Hot Water Systems',
    categories: ['Engineering', 'General'],
    image: 'https://zongii.co.tz/wp-content/uploads/2020/07/products_hotwatersystem_thumb.jpg',
    description: 'Solar and electric hot water systems for all property types.',
  },
  {
    id: 'poly-footwear',
    name: 'Poly Footwear',
    categories: ['Engineering', 'PVC'],
    image: 'https://zongii.co.tz/wp-content/uploads/2020/07/products_polyfootware_thumb.jpg',
    description: 'Durable polyethylene protective footwear for site use.',
  },
  {
    id: 'pvc-fittings',
    name: 'PVC Fittings',
    categories: ['Building Materials', 'Building Tools', 'Plumbing', 'PVC'],
    image: 'https://zongii.co.tz/wp-content/uploads/2020/07/products_pvc_fittings_thumb.jpg',
    description: 'Full selection of PVC elbows, tees, reducers and couplings.',
  },
  {
    id: 'polyethylene-tanks',
    name: 'Polyethylene Tanks',
    categories: ['Engineering', 'Plumbing', 'PVC'],
    image: 'https://zongii.co.tz/wp-content/uploads/2020/07/products_polytanks_thumb.jpg',
    description: 'UV-stabilised water storage tanks in a range of capacities.',
  },
  {
    id: 'pvc-pipes',
    name: 'PVC Pipes',
    categories: ['Building Materials', 'Engineering', 'Plumbing', 'PVC'],
    image: 'https://zongii.co.tz/wp-content/uploads/2018/11/products_pvc_thumb.jpg',
    description: 'Pressure-rated PVC pipes for water supply and drainage systems.',
  },
]

export const INDUSTRIES: Industry[] = [
  { id: 'commercial',   label: 'Commercial',             icon: '🏢', description: 'Office parks, retail centres and commercial developments.' },
  { id: 'residential',  label: 'Residential Homes',      icon: '🏠', description: 'New builds and renovation projects for homeowners.' },
  { id: 'estate',       label: 'Estate & Rental Agents', icon: '🔑', description: 'Bulk supply for property management portfolios.' },
  { id: 'landlords',    label: 'Landlords',              icon: '📋', description: 'Maintenance and upgrade supplies for rental properties.' },
  { id: 'developers',   label: 'Developers',             icon: '🏗️', description: 'Large-scale procurement at competitive rates.' },
  { id: 'industrial',   label: 'Industrial',             icon: '⚙️', description: 'Heavy-duty pipe solutions for factories and plants.' },
  { id: 'hospitality',  label: 'Hospitality',            icon: '🏨', description: 'Hotels, lodges and restaurants across Tanzania.' },
  { id: 'fitness',      label: 'Fitness',                icon: '💪', description: 'Water systems and amenities for gyms and sports centres.' },
  { id: 'construction', label: 'Construction',           icon: '🔨', description: 'On-site supply for contractors and building projects.' },
  { id: 'mining',       label: 'Mining Pipes & Tools',   icon: '⛏️', description: 'Durable systems rated for demanding mine environments.' },
]

export const STATS: Stat[] = [
  { value: 15,  suffix: '+', label: 'Years of Experience' },
  { value: 9,   suffix: '',  label: 'Product Lines' },
  { value: 10,  suffix: '+', label: 'Industries Served' },
  { value: 500, suffix: '+', label: 'Projects Completed' },
]

export const VALUES: Value[] = [
  {
    icon: '✓',
    title: 'Guaranteed Quality',
    description: 'Every product meets international standards for durability and performance in East African conditions.',
  },
  {
    icon: '⚡',
    title: 'Reliable Delivery',
    description: 'Fast, dependable fulfilment across Dar es Salaam and upcountry Tanzania.',
  },
  {
    icon: '🎓',
    title: 'Expert Guidance',
    description: '15+ years of technical knowledge to help you specify the right solution first time.',
  },
  {
    icon: '📦',
    title: 'Complete Range',
    description: 'From PVC pipe to hot water systems — everything you need from one trusted supplier.',
  },
]
