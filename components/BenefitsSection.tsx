import { Wheat, Building2, Globe, Sparkles, TrendingUp, Factory, Calendar, Sun } from "lucide-react";

export default function BenefitsSection() {
  const categories = [
    {
      icon: Wheat,
      title: "Commercial Farmers",
      description: "Secure fertile crop or pasture acreage without massive capital expenditure or long-term mortgage burdens. Perfect for rotational livestock grazing, seasonal cropping, or research trials.",
      color: "border-emerald-100 bg-emerald-50/20",
      iconColor: "text-emerald-700",
    },
    {
      icon: Building2,
      title: "Logistics & Businesses",
      description: "Expand physical warehousing overflow or equipment storage on demand. Secure flat, hard-standing land for trailer holding pools, vehicle storage, or surplus inventory laydown close to key highways.",
      color: "border-blue-100 bg-blue-50/20",
      iconColor: "text-blue-700",
    },
    {
      icon: Sun,
      title: "Renewable Energy Developers",
      description: "Acquire short-term easements to conduct wind velocity tests, solar exposure feasibility analysis, or grid connection research without the immediate need for multimillion-dollar site purchase commitments.",
      color: "border-orange-100 bg-orange-50/20",
      iconColor: "text-orange-700",
    },
    {
      icon: Calendar,
      title: "Event Organizers",
      description: "Match with sprawling, scenic locations, meadows, or industrial plots for festivals, glamping bases, or corporate outdoor gatherings. Rest assured with proper safety checks and restoration protocol contracts.",
      color: "border-purple-100 bg-purple-50/20",
      iconColor: "text-purple-700",
    },
    {
      icon: Factory,
      title: "Manufacturers & Staging",
      description: "Locate optimal construction laydown yards and material staging platforms. Perfect for modular fabrication sites, concrete staging, or steel storage on-demand close to municipal works.",
      color: "border-rose-100 bg-rose-50/20",
      iconColor: "text-rose-700",
    },
    {
      icon: Sparkles,
      title: "Startups & Innovators",
      description: "Test off-grid hardware, autonomous machinery, drone paths, or agricultural tech prototypes in isolated, secure spaces with absolute legal licensing and landowner alignment.",
      color: "border-teal-100 bg-teal-50/20",
      iconColor: "text-teal-700",
    },
    {
      icon: Globe,
      title: "NGOs & Research",
      description: "Secure regional soil baselines, set up climate observation equipment, or run botanical conservation trials on secure land tracts with structured, clear compliance guidelines.",
      color: "border-cyan-100 bg-cyan-50/20",
      iconColor: "text-cyan-700",
    },
    {
      icon: TrendingUp,
      title: "Land Investors",
      description: "Earn holding-period yield, maintain agricultural tax exemptions, and keep land active without entering long-term leases that tie up valuable capital or block potential developers.",
      color: "border-amber-100 bg-amber-50/20",
      iconColor: "text-amber-700",
    },
  ];

  return (
    <section id="benefits" className="py-20 bg-slate-50/35 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16" id="benefits-header">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100">
            Tailored Solutions
          </span>
          <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight mt-4">
            Perfect for Every Project Sector
          </h2>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed">
            Whether you are growing crops, storing wind turbines, or launching a festival, temporary land leasing delivers unprecedented project flexibility and capital efficiency.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="benefits-grid">
          {categories.map((cat, index) => (
            <div
              key={index}
              className={`p-6 rounded-2xl border backdrop-blur-md shadow-sm transition-all hover:shadow-lg hover:scale-[1.01] hover:bg-white/90 flex flex-col justify-between ${cat.color}`}
            >
              <div>
                <div className={`w-10 h-10 rounded-xl bg-white/90 shadow-xs border border-white/40 flex items-center justify-center shrink-0 mb-5 ${cat.iconColor}`}>
                  <cat.icon className="w-5.5 h-5.5" />
                </div>
                <h3 className="font-sans font-bold text-sm text-slate-900 tracking-tight">
                  {cat.title}
                </h3>
                <p className="text-slate-500 text-xs mt-2.5 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
