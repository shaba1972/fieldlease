import { MapPin, ArrowRight } from "lucide-react";

interface FinalCtaProps {
  onCtaClick: () => void;
}

export default function FinalCTA({ onCtaClick }: FinalCtaProps) {
  return (
    <section id="final-cta" className="py-20 bg-slate-950/90 backdrop-blur-xl text-white relative overflow-hidden border-y border-white/10 shadow-2xl">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full filter blur-3xl pointer-events-none -ml-40 -mt-20"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full filter blur-3xl pointer-events-none -mr-40 -mb-20"></div>
      
      {/* Subtle Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        {/* Decorative Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-xs mb-6">
          <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-sans font-semibold text-[10px] text-emerald-300 uppercase tracking-wider">
            Sourcing Across Key States Today
          </span>
        </div>

        {/* Big Headline */}
        <h2 className="font-sans font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
          Tell Us What Land You Need
        </h2>

        {/* Supporting Copy */}
        <p className="text-slate-300 text-sm sm:text-base mt-4 max-w-xl mx-auto leading-relaxed">
          Stop manually searching classifieds or dealing with speculative developers. Give our PropTech matching system your specific parameters and let us deliver ready-to-lease properties in 2 hours.
        </p>

        {/* Action Button and Guarantees */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onCtaClick}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide transition-all duration-200 shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 group active:scale-[0.98]"
          >
            <span>Submit Your Requirements</span>
            <ArrowRight className="w-4.5 h-4.5 text-emerald-200 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Tiny Trust badges */}
        <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3 text-slate-400 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-emerald-500">✓</span> Free Matchmaking Sourcing
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500">✓</span> No Obligations
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500">✓</span> Fully Confidential Vetting
          </div>
        </div>

      </div>
    </section>
  );
}
