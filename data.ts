import { FAQItem, SuccessMetric, Testimonial } from "./types";

export const LAND_TYPES = [
  { id: "farmland", label: "Farmland (Commercial Crops)", description: "Arable soil with access to water sources" },
  { id: "livestock", label: "Livestock Pasture", description: "Fenced grazing fields for cattle, sheep, poultry" },
  { id: "warehousing", label: "Open-Air / Covered Warehousing", description: "Flat, hard-standing ground for secure storage" },
  { id: "manufacturing", label: "Light Industrial / Manufacturing", description: "Zones fitted for temporary machinery or fabrication" },
  { id: "events", label: "Event Grounds", description: "Accessible locations for festivals, corporate gatherings" },
  { id: "energy", label: "Renewable Energy Projects", description: "High-exposure plains for solar arrays or wind studies" },
  { id: "storage", label: "Equipment & Vehicle Storage", description: "Secure yards for fleets, RVs, or surplus stock" },
  { id: "construction", label: "Construction Staging", description: "Proximity to major routes for laydown yards" },
  { id: "research", label: "Agricultural & Environmental Research", description: "Isolated sites with monitored soil profiles" },
  { id: "recreation", label: "Recreation & Camping Sites", description: "Scenic woodlands or waterfronts for temporary leisure" }
];

export const INTENDED_USES = [
  "Commercial Farming (Seasonal / Rotational)",
  "Livestock Grazing & Rotational Feeding",
  "Product & Goods Warehousing / Surplus Storage",
  "Temporary Light Assembly / Fabrication",
  "Music Festivals / Corporate Events",
  "Solar Power Staging & Environmental Feasibility",
  "Heavy Equipment laydown & Trailer Storage",
  "Material Staging for Large-Scale Civil Projects",
  "Soil Testing, Carbon Sequestration Research",
  "Outdoor Retreats, Paintball, or Glamping Base",
  "Other Temporary Commercial or Recreational Projects"
];

export const STATES_AND_REGIONS: Record<string, string[]> = {
  "United States": [
    "Texas (Harris/Dallas/Travis)",
    "California (LA/Bay Area/San Diego)",
    "Florida (Miami-Dade/Orange)",
    "Georgia (Fulton/Cobb/Gwinnett)",
    "Ohio (Franklin/Cuyahoga)",
    "New York (NYC Metro/Upstate)",
    "Washington (King County/Seattle)",
    "Illinois (Cook County/Chicago)",
    "Colorado (Denver Metro/Front Range)",
    "Arizona (Maricopa/Phoenix)",
    "Other United States Region"
  ],
  "Nigeria": [
    "Lagos (Ikeja/Lekki/Yaba)",
    "Abuja (FCT / AMAC / Garki)",
    "Kano (Kano Municipal)",
    "Kaduna (Kaduna South/North)",
    "Oyo (Ibadan/Ogbomosho)",
    "Rivers (Port Harcourt/Obio-Akpor)",
    "Delta (Warri/Asaba)",
    "Ogun (Abeokuta/Ota)",
    "Enugu (Enugu East/North)",
    "Anambra (Onitsha/Awka)",
    "Other Nigeria State"
  ],
  "United Kingdom": [
    "Greater London (Inner/Outer)",
    "West Midlands (Birmingham)",
    "Greater Manchester (Manchester)",
    "West Yorkshire (Leeds)",
    "Scotland (Edinburgh/Glasgow)",
    "Wales (Cardiff/Swansea)",
    "Northern Ireland (Belfast)",
    "South West England (Bristol)",
    "East East of England (Cambridge)",
    "Other United Kingdom Region"
  ],
  "Canada": [
    "Ontario (Toronto/Ottawa)",
    "Quebec (Montreal/Quebec City)",
    "British Columbia (Vancouver/Victoria)",
    "Alberta (Calgary/Edmonton)",
    "Manitoba (Winnipeg)",
    "Saskatchewan (Regina/Saskatoon)",
    "Nova Scotia (Halifax)",
    "Other Canadian Province"
  ],
  "Australia": [
    "New South Wales (Sydney)",
    "Victoria (Melbourne)",
    "Queensland (Brisbane/Gold Coast)",
    "Western Australia (Perth)",
    "South Australia (Adelaide)",
    "Tasmania (Hobart)",
    "Australian Capital Territory (Canberra)",
    "Other Australian State"
  ],
  "Germany": [
    "Bavaria (Munich)",
    "Berlin (Berlin City)",
    "Hamburg (Hamburg City)",
    "North Rhine-Westphalia (Cologne/Düsseldorf)",
    "Baden-Württemberg (Stuttgart)",
    "Hesse (Frankfurt)",
    "Saxony (Dresden/Leipzig)",
    "Other German State"
  ],
  "India": [
    "Maharashtra (Mumbai/Pune)",
    "Delhi (NCR)",
    "Karnataka (Bengaluru)",
    "Tamil Nadu (Chennai)",
    "Telangana (Hyderabad)",
    "Gujarat (Ahmedabad)",
    "Uttar Pradesh (Noida/Lucknow)",
    "West Bengal (Kolkata)",
    "Other Indian State"
  ],
  "South Africa": [
    "Gauteng (Johannesburg/Pretoria)",
    "Western Cape (Cape Town)",
    "KwaZulu-Natal (Durban)",
    "Eastern Cape (Gqeberha)",
    "Free State (Bloemfontein)",
    "Other South African Province"
  ],
  "Kenya": [
    "Nairobi County",
    "Mombasa County",
    "Kiambu County",
    "Nakuru County",
    "Kisumu County",
    "Uasin Gishu County (Eldoret)",
    "Other Kenyan County"
  ],
  "United Arab Emirates": [
    "Dubai",
    "Abu Dhabi",
    "Sharjah",
    "Ajman",
    "Ras Al Khaimah",
    "Fujairah",
    "Umm Al Quwain"
  ],
  "Brazil": [
    "São Paulo State",
    "Rio de Janeiro State",
    "Minas Gerais",
    "Bahia",
    "Paraná",
    "Rio Grande do Sul",
    "Other Brazilian State"
  ],
  "France": [
    "Île-de-France (Paris)",
    "Provence-Alpes-Côte d'Azur (Marseille)",
    "Auvergne-Rhône-Alpes (Lyon)",
    "Nouvelle-Aquitaine (Bordeaux)",
    "Occitanie (Toulouse)",
    "Other French Region"
  ]
};

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Submit Your Land Specs",
    description: "Fill out our intelligent, 60-second land requirement form detailing your project, budget, and lease duration."
  },
  {
    step: "02",
    title: "We Scan Our Verified Network",
    description: "Our proprietary PropTech database instantly cross-references your needs against thousands of verified landowners."
  },
  {
    step: "03",
    title: "Receive Curated Matches",
    description: "Get a shortlist of optimal, ready-to-lease properties complete with soil data, accessibility grades, and transparent pricing."
  },
  {
    step: "04",
    title: "Lease and Activate",
    description: "Review standardized legal agreements with our advisory team, sign securely online, and break ground immediately."
  }
];

export const SUCCESS_METRICS: SuccessMetric[] = [
  {
    value: "500+",
    label: "Land Requests Processed",
    description: "Successfully matched various commercial, warehouse, and agricultural lease targets across the regions."
  },
  {
    value: "200+",
    label: "Verified Landowners",
    description: "Vetted agricultural, commercial, and industrial landowners holding ready-to-lease acreage."
  },
  {
    value: "< 24 Hours",
    label: "Average Matching Time",
    description: "Our matching engine works rapidly to deliver viable properties for tight project timelines."
  },
  {
    value: "100% Secure",
    label: "Trusted Leasing Process",
    description: "Escrow-protected leases, clear restoration protocols, and standardized legal frameworks."
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Dr. Elena Vance",
    role: "Chief Agronomist",
    company: "VerdeRoots Farming Inc.",
    quote: "We needed 40 acres of high-yield arable land for a single crop cycle. This platform matched us with a landowner in under 36 hours. The standardized contract handled restoration clauses beautifully, leaving both sides completely protected.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200",
    rating: 5,
    useCase: "Commercial Farming"
  },
  {
    name: "Marcus Kaelen",
    role: "Director of Logistics",
    company: "Apex Staging Partners",
    quote: "Finding staging yards for wind turbine blades was a massive headache until we found this service. They sourced 5 flat, heavy-load industrial plots along our transport routes. Saved us weeks of manual searching and zoning calls.",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200",
    rating: 5,
    useCase: "Construction Staging"
  },
  {
    name: "Sarah Chen",
    role: "Founder",
    company: "Helios Solar Ventures",
    quote: "Our solar feasibility trials require multi-month easements with minimal friction. This platform handles the landowner relation and regulatory vetting transparently. Absolutely indispensable for modern clean-energy developers.",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200",
    rating: 5,
    useCase: "Renewable Energy"
  }
];

export const FAQS: FAQItem[] = [
  {
    question: "Do you own the land listed on your platform?",
    answer: "No, we do not own the land. We are a specialized PropTech platform that acts as an intermediary. We connect individuals and businesses seeking temporary land with verified private, corporate, and agricultural landowners who have idle acreage, facilitating the matching, safety checks, and standardized leasing process."
  },
  {
    question: "How much does the temporary land matching service cost?",
    answer: "It is 100% free to submit your requirements and review matched properties. Once you decide to move forward with a lease, we charge a nominal, transparent coordination fee built directly into the lease agreement. There are absolutely no hidden costs or surprise broker fees."
  },
  {
    question: "Can I lease land in any country or region?",
    answer: "Yes, we support temporary leasing worldwide! Our deepest landowner networks are in the United States, United Kingdom, Nigeria, Canada, Australia, Germany, India, South Africa, and more. If you have unique location requirements, simply submit your details—we run dynamic outbound sourcing for projects globally."
  },
  {
    question: "How long does it take to get matched with properties?",
    answer: "For standard requests (e.g., standard farming, construction staging, storage yards), we typically send your first curated matches within 12 to 24 hours. For highly specialized requests requiring specific soil conditions or heavy power utilities, it can take 2 to 3 days."
  },
  {
    question: "What documents are required to secure a temporary lease?",
    answer: "For individuals, we require valid government identification and proof of project funding or standard insurance. For businesses, we verify corporate registration, commercial liability insurance, and project details to ensure safety, restoration capabilities, and absolute compliance."
  },
  {
    question: "Is my personal and project information kept confidential?",
    answer: "Absolutely. We understand that temporary land leases often relate to sensitive corporate staging, research, or pre-launch utility tests. Your contact info is never sold, and your specific project specifications are only shared anonymously with verified landowners who have matching properties."
  }
];
