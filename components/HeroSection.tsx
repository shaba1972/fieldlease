const heroIllustration = "/src/assets/images/hero_land_illustration_1782588056023.jpg";
import { Compass, ShieldCheck, CheckCircle2 } from "lucide-react";

interface HeroSectionProps {
  onCtaClick: () => void;
}

export default function HeroSection({ onCtaClick }: HeroSectionProps) {
  return (
    <section id="hero" className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-slate-50/50">
      {/* Mesh Gradient Background Decoration */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-emerald-100 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>
      <div className="absolute bottom-[-50px] left-[-50px] w-[400px] h-[400px] bg-orange-50 rounded-full blur-[100px] opacity-40 pointer-events-none"></div>
      
      {/* Dynamic Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Copywriting & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left" id="hero-content">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 shadow-xs mx-auto lg:mx-0">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="font-sans font-bold text-[11px] text-emerald-700 uppercase tracking-wider">
                Verified Land Network
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-sans font-extrabold text-4xl sm:text-5xl md:text-6.5xl text-emerald-950 tracking-tight leading-[1.1]">
              Find the Right Land for Your <span className="text-emerald-700 underline decoration-orange-300 decoration-4 underline-offset-4">Project</span>—Without the Stress
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 font-sans font-normal leading-relaxed">
              We connect agricultural, commercial, and industrial land seekers with verified landowners for short- and long-term temporary leases. From livestock and farming to construction staging and events, we manage the entire vetting and legal process for you.
            </p>

            {/* Highlights list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto lg:mx-0 pt-2">
              {[
                "Vetted local landowners",
                "Standardized secure leases",
                "Full escrow protection",
                "Dedicated advisory support",
              ].map((highlight, index) => (
                <div key={index} className="flex items-center justify-center lg:justify-start gap-2.5 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-700 shrink-0" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>

            {/* Buttons & Trust Metric */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <button
                onClick={onCtaClick}
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-800 text-white text-sm font-bold rounded-full shadow-lg shadow-emerald-900/10 hover:bg-emerald-950 transition-all duration-200 active:scale-[0.98]"
              >
                Find Available Land
              </button>
              <a
                href="#how-it-works"
                className="text-slate-600 hover:text-emerald-800 font-semibold text-sm py-2 px-3 transition-colors"
              >
                See How It Works →
              </a>
            </div>
          </div>

          {/* Right: Premium Isometric Illustration */}
          <div className="lg:col-span-6 flex justify-center" id="hero-illustration-container">
            <div className="relative w-full max-w-lg lg:max-w-none">
              {/* Decorative behind elements with glass styling */}
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100/40 to-orange-50/40 rounded-3xl -rotate-2 transform scale-102 filter blur-md opacity-75"></div>
              
              <div className="relative bg-white/60 backdrop-blur-md p-3 rounded-[2.5rem] shadow-xl border border-white/60 overflow-hidden">
                <img
                  src={heroIllustration}
                  alt="Premium Temporary Land Use Illustration (farming, logistics, pasturing, events)"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover rounded-[2rem] shadow-inner transition-transform duration-500 hover:scale-[1.02]"
                />
              </div>

              {/* Float Trust Pill with Glassmorphism */}
              <div className="absolute -bottom-5 -left-5 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/80 flex items-center gap-3 animate-bounce-slow">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100/50 flex items-center justify-center text-emerald-700">
                  <Compass className="w-5.5 h-5.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Response Time</div>
                  <div className="text-sm font-extrabold text-emerald-950 mt-1">Under 2 Hours</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
