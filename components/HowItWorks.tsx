import { HOW_IT_WORKS } from "../data";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-slate-50/30 relative">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16" id="how-it-works-header">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100">
            Streamlined Matchmaking
          </span>
          <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight mt-4">
            How Temporary Land Leasing Works
          </h2>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed">
            We bypass the traditional commercial real estate hurdles. Our digital process delivers verified land matches tailored to your specific project needs in 4 easy steps.
          </p>
        </div>

        {/* 4 Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" id="steps-grid">
          {HOW_IT_WORKS.map((step, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg shadow-slate-100/40 border border-white hover:border-slate-200/80 transition-all group relative overflow-hidden"
            >
              {/* Highlight step index in background */}
              <div className="absolute top-4 right-4 text-5xl font-extrabold font-mono text-slate-100/50 leading-none select-none group-hover:text-emerald-100/40 transition-colors">
                {step.step}
              </div>

              {/* Step indicator tag */}
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100/50 flex items-center justify-center font-bold text-sm text-emerald-700 mb-6">
                {step.step}
              </div>

              {/* Title & Description */}
              <h3 className="font-sans font-bold text-base text-slate-900 tracking-tight">
                {step.title}
              </h3>
              <p className="text-slate-500 text-xs mt-3 leading-relaxed">
                {step.description}
              </p>

              {/* Interactive bottom hint */}
              {index < 3 && (
                <div className="hidden lg:block absolute top-12 -right-4 translate-x-1/2 z-20 text-slate-300">
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* AI Highlight Banner with dark frosted glass */}
        <div className="mt-16 p-6 rounded-2xl bg-slate-950/90 backdrop-blur-xl text-white border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6" id="ai-banner">
          <div className="flex gap-4 items-start md:items-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="font-sans font-bold text-sm text-white">
                Powered by Intelligent PropTech & Instant AI Zoning
              </h4>
              <p className="text-slate-400 text-xs mt-1">
                Our platform uses advanced AI analysis of local land grids to assess temporary zoning parameters instantly before matching.
              </p>
            </div>
          </div>
          <a
            href="#form-section"
            className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shrink-0 transition-all text-center w-full md:w-auto shadow-lg shadow-emerald-950/20"
          >
            Start Specs Sourcing
          </a>
        </div>

      </div>
    </section>
  );
}
