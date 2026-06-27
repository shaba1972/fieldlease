import { Shield, CheckCircle, Headphones, Zap, FileText } from "lucide-react";

export default function TrustSection() {
  const trustPillars = [
    {
      icon: Shield,
      title: "Verified Landowners",
      description: "We verify title deeds, corporate registrations, and identity backgrounds for every landowner on our platform.",
      color: "text-emerald-700 bg-emerald-50",
    },
    {
      icon: FileText,
      title: "Transparent Agreements",
      description: "Standardized, attorney-backed lease agreements that clearly outline land condition, liability, and restoration terms.",
      color: "text-blue-700 bg-blue-50",
    },
    {
      icon: Zap,
      title: "Fast Matching",
      description: "Our proprietary database instantly filters listings to send qualified, pre-vetted options directly to your inbox.",
      color: "text-orange-700 bg-orange-50",
    },
    {
      icon: Headphones,
      title: "Professional Support",
      description: "A dedicated land advisor manages negotiations, permits, escrow services, and site visits from start to finish.",
      color: "text-purple-700 bg-purple-50",
    },
  ];

  return (
    <section id="trust" className="py-12 bg-white/40 backdrop-blur-md border-y border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Row of trust badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" id="trust-grid">
          {trustPillars.map((pillar, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/60 backdrop-blur-xs shadow-sm ${pillar.color}`}>
                <pillar.icon className="w-5.5 h-5.5" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-sm text-slate-900 tracking-tight">
                  {pillar.title}
                </h3>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Security / Escrow Highlight Box */}
        <div className="mt-12 p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-md shadow-slate-100/35 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-sans font-bold text-sm text-slate-900 block">Protected Leasing Guarantee</span>
              <span className="text-xs text-slate-500 block mt-0.5">Your financial transactions and rental deposit are held in secure escrow throughout the lease duration.</span>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <span className="px-3 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">Escrow Secured</span>
            <span className="px-3 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">Legal Standardized</span>
          </div>
        </div>

      </div>
    </section>
  );
}
