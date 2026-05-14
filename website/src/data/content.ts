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

export interface NewsArticle {
  id: string
  title: string
  date: string
  category: 'Products' | 'Company' | 'Industry' | 'Community'
  excerpt: string
  content: string
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
  { value: 22,  suffix: '+', label: 'Years of Experience' },
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
    description: 'Fast, dependable fulfilment across Mwanza, Dar es Salaam and upcountry Tanzania.',
  },
  {
    icon: '🎓',
    title: 'Expert Guidance',
    description: '22+ years of technical knowledge to help you specify the right solution first time.',
  },
  {
    icon: '📦',
    title: 'Complete Range',
    description: 'From PVC pipe to hot water systems — everything you need from one trusted supplier.',
  },
]

export const CONTACT_INFO = {
  address: 'Pamba Road, P.O. Box 6419, Mwanza, Tanzania',
  emailGeneral: 'info@zongii.co.tz',
  emailSales: 'sales@zongii.co.tz',
  phones: ['+255 769 005 007', '+255 743 004 008', '+255 785 856 363'],
  hours: 'Mon – Fri  ·  8:00 am – 5:00 pm EAT',
}

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'pvc-range-expansion-2025',
    title: 'Expanded PVC Pipe & Fittings Range Now In Stock',
    date: '2025-04-10',
    category: 'Products',
    excerpt: 'We have significantly expanded our PVC product line to include new pressure ratings, diameters and specialist fittings to meet the demands of large-scale construction projects across Tanzania.',
    content: `We are pleased to announce a major expansion of our PVC pipe and fittings catalogue, effective immediately from our Mwanza branch.

The new range includes:

- **Class B, C and D pressure-rated pipes** in diameters from 20mm to 315mm
- **Solvent-weld and rubber-ring jointing** options for all sizes
- **Specialist drainage fittings** including inspection chambers, channel gullies and rodding eyes
- **Irrigation-grade lay-flat hose** for agricultural and landscaping projects

This expansion was driven by direct feedback from our contractor and developer clients who needed a single-source supplier for complex multi-phase projects. We now carry sufficient stock depth to support continuous supply on projects spanning several months without the risk of stock-outs.

All PVC products in our range are manufactured to BS EN ISO 1452 and ASTM D1785 standards and have been independently tested for performance under East African temperature and UV conditions.

Visit our Pamba Road showroom or call our sales team on +255 769 005 007 to discuss your project requirements and receive a competitive quotation.`,
  },
  {
    id: 'zongii-22-years-2024',
    title: 'Celebrating 22 Years of Serving Tanzania',
    date: '2025-04-05',
    category: 'Company',
    excerpt: 'On April 5th, 2025, Zongii Plumbing Co. Limited marks 22 years since its founding. We reflect on two decades of growth, trust and commitment to the Tanzanian construction industry.',
    content: `On this day in 2002, Zongii Plumbing Co. Limited opened its doors for the first time. What began as a small specialist plumbing supplier in Mwanza has grown into one of Tanzania's most trusted names in building and construction materials.

Over the past 22 years, we have:

- **Supplied over 500 completed projects**, from individual residential renovations to large multi-storey commercial developments
- **Grown our product range** from a handful of plumbing essentials to over 9 distinct product lines covering every stage of construction
- **Served 10+ industry sectors**, from hospitality and mining to residential housing and government infrastructure
- **Built lasting relationships** with internationally recognised manufacturers, allowing us to guarantee quality and traceability on every product we sell

Our incorporation as a private limited company on 21st October 2009 marked another milestone — formalising the trust our customers had placed in us from the very beginning. We are proud to be a fully registered entity with Tanzania Revenue Authority (TIN: 108-998-350) and compliant with all provisions of the Tax Administration Act 2015.

Most importantly, we are grateful to every client, contractor, developer and individual homeowner who has chosen Zongii. Your trust is the foundation on which we build every day.

Here is to the next 22 years.`,
  },
  {
    id: 'water-conservation-dry-season',
    title: 'Water Conservation: Practical Tips for the Dry Season',
    date: '2025-03-18',
    category: 'Industry',
    excerpt: 'As the dry season approaches across the Lake Zone, Zongii shares practical advice on water storage, efficient plumbing systems and the right products to reduce consumption.',
    content: `Tanzania's dry season places significant pressure on water infrastructure, particularly in the Lake Zone regions around Mwanza. Efficient plumbing systems and adequate storage are not just conveniences — they are essential for households, businesses and farms.

**Water Storage**

Polyethylene tanks remain the most cost-effective solution for on-site water storage. Our range of UV-stabilised tanks — from 500-litre domestic units to 10,000-litre commercial tanks — are manufactured to resist degradation under direct sunlight and can be installed above or below ground.

Key considerations when selecting a storage tank:
- Calculate your peak daily consumption and aim for at least 3 days of reserve capacity
- Always use food-grade polyethylene tanks for drinking water storage
- Elevate tanks where possible to create gravity-fed pressure and reduce pump dependency

**Efficient Pump Selection**

Submersible and surface pumps that are sized correctly for the application consume significantly less energy and suffer fewer breakdowns. Our engineering team can advise on pump selection based on your required flow rate, head pressure and pipe diameter.

**Leak Prevention**

A dripping tap or a slow pipe leak can waste thousands of litres per month. We stock a full range of replacement washers, isolation valves and pipe repair clamps for fast on-site fixes.

**Hot Water Systems**

Solar hot water systems reduce reliance on electric geysers — particularly important during dry periods when grid supply can be intermittent. Our solar thermal systems are sized for households from 2 to 20 people.

Contact our technical team to discuss the right solution for your property.`,
  },
  {
    id: 'quality-standards-building-materials',
    title: 'Why Material Quality Matters in East African Construction',
    date: '2025-02-27',
    category: 'Industry',
    excerpt: 'Substandard building materials remain a challenge across East Africa. Zongii explains what to look for, why certification matters and how we guarantee the quality of every product we sell.',
    content: `The use of substandard or counterfeit building materials continues to pose a serious risk to construction quality across East Africa. From undersized steel reinforcement to non-pressure-rated PVC pipe sold as pressure pipe, the consequences can range from costly repairs to structural failure.

At Zongii, quality assurance is not a marketing phrase — it is a core operational commitment.

**What We Source and Why**

Every product we stock is sourced from manufacturers who can provide:

- **Current test certificates** from accredited third-party laboratories
- **Traceability** from raw material to finished product
- **Compliance documentation** referencing applicable standards (BS, ASTM, ISO or equivalent)

We do not trade on price alone. Our buyers regularly visit manufacturing facilities to conduct audits, and we maintain relationships with manufacturers who invest in their own quality management systems.

**What to Look for as a Buyer**

When purchasing building materials, always request:

1. The product standard reference printed on the product or packaging (e.g., BS EN 1452 for PVC pressure pipe)
2. A copy of the manufacturer's test certificate for the batch
3. Confirmation of the rated working pressure or load capacity

If a supplier cannot provide these, treat the product as non-compliant.

**Our Commitment to You**

Zongii stands behind everything we sell. If a product is found to be non-conforming upon delivery, we will replace it at no cost. This is our promise, backed by 22 years of trading in Tanzania.`,
  },
  {
    id: 'ceramic-sanitaryware-new-stock',
    title: 'New Ceramic Sanitaryware Collection Available',
    date: '2025-01-14',
    category: 'Products',
    excerpt: 'Our latest collection of ceramic basins, toilets and bathroom accessories has arrived — featuring contemporary designs suited to both residential and commercial interiors.',
    content: `We are pleased to announce the arrival of our newest ceramic sanitaryware collection, now available for viewing at our Pamba Road showroom in Mwanza.

The collection includes:

**Basins**
- Countertop vessel basins in white and off-white glaze
- Under-counter semi-recessed basins
- Pedestal basins for traditional bathroom settings
- Sizes from 350mm to 600mm width

**Toilets**
- Close-coupled WC suites with concealed cistern option
- Wall-hung pan units compatible with in-wall cistern frames
- Comfort-height pan options for accessibility compliance
- Dual-flush mechanisms as standard (3/6 litre)

**Accessories**
- Matching ceramic soap dishes, towel ring holders and toilet roll holders
- Co-ordinated mirror frames in chrome and matte black finish

All sanitaryware in this collection carries a manufacturer's glaze warranty and meets the requirements of TZS 476 (Tanzania Bureau of Standards specification for vitreous ceramic sanitaryware).

Bulk pricing is available for developers and contractors supplying multiple units. Contact our sales team at sales@zongii.co.tz or call +255 743 004 008 for a project quotation.`,
  },
  {
    id: 'hot-water-solar-systems-guide',
    title: 'Solar vs Electric Hot Water: Which is Right for Your Property?',
    date: '2024-12-03',
    category: 'Industry',
    excerpt: 'With rising electricity costs and improved solar technology, many property owners in Tanzania are switching to solar hot water systems. We break down the key differences, costs and considerations.',
    content: `Hot water is a daily necessity, yet the choice of heating system significantly impacts long-term running costs and energy reliability. Here is an honest comparison to help you decide.

**Electric Geyser (Storage Heater)**

Electric geysers are the most common hot water solution in Tanzanian homes and commercial properties.

*Advantages:*
- Lower upfront installation cost
- Simple to install and replace
- Works at full capacity regardless of weather

*Disadvantages:*
- High running cost due to electricity consumption
- Vulnerable to power cuts — no hot water during outages
- Heating elements require periodic replacement

*Best for:* Smaller properties with low hot water demand and reliable grid supply.

**Solar Thermal System (Evacuated Tube or Flat Plate Collector)**

Solar hot water systems use sunlight to heat water stored in an insulated tank. A backup electric element ensures supply on cloudy days.

*Advantages:*
- Drastically reduced electricity consumption (up to 80% savings)
- Continues to heat water during power cuts (solar collectors are passive)
- Low maintenance — no moving parts in the collector circuit
- 10–15 year lifespan on quality systems

*Disadvantages:*
- Higher upfront capital cost
- Requires roof space and correct orientation (south-facing in Tanzania)
- Backup element needed for prolonged overcast periods

*Best for:* Residential properties, hotels, lodges, schools and any facility with consistent hot water demand.

**Return on Investment**

For a typical 200-litre household system, the payback period on a solar installation versus continued electric geyser use is typically 2–4 years at current TANESCO tariffs — after which the system operates at near-zero running cost.

Our team can conduct a site assessment and provide a full cost-benefit analysis for your property. Contact us to arrange a visit.`,
  },
]
