import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import TrustSection from "./components/TrustSection";
import HowItWorks from "./components/HowItWorks";
import BenefitsSection from "./components/BenefitsSection";
import LeadCaptureForm from "./components/LeadCaptureForm";
import SocialProof from "./components/SocialProof";
import FAQSection from "./components/FAQSection";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import AdminDashboard from "./components/AdminDashboard";
import { Sparkles, ShieldCheck, MapPin } from "lucide-react";

export default function App() {
  const [pathname, setPathname] = useState(() => (typeof window !== "undefined" ? window.location.pathname : "/"));
  const [showMobileSticky, setShowMobileSticky] = useState(false);

  useEffect(() => {
    const updatePathname = () => setPathname(window.location.pathname);
    updatePathname();
    window.addEventListener("popstate", updatePathname);
    return () => window.removeEventListener("popstate", updatePathname);
  }, []);

  const isAdminRoute = useMemo(() => pathname.startsWith("/admin"), [pathname]);

  if (isAdminRoute) {
    return <AdminDashboard />;
  }

  useEffect(() => {
    const handleScroll = () => {
      // Show mobile sticky CTA when scrolled past hero (approx 600px) and on mobile screens
      if (window.scrollY > 600 && window.innerWidth < 768) {
        setShowMobileSticky(true);
      } else {
        setShowMobileSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const scrollToForm = () => {
    const element = document.getElementById("form-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Sticky Top Header */}
      <Header onCtaClick={scrollToForm} />

      {/* Hero Section */}
      <HeroSection onCtaClick={scrollToForm} />

      {/* Trust Pillars Banner */}
      <TrustSection />

      {/* Main Sourcing Form Section (Conversion Driver) */}
      <section id="form-section" className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left: Persuasive Messaging & Highlights */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24" id="form-intro">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-800">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>Instant Sourcing Engine</span>
              </div>
              
              <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight leading-tight">
                Submit Specs & Secure Matches in 2 Hours
              </h2>
              
              <p className="text-slate-500 text-sm leading-relaxed">
                By telling our platform exactly what size, budget, location, and utilities your temporary project requires, you activate our real-time matching system. We verify title covenances and coordinate with landowners so you don't have to.
              </p>

              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex gap-3.5">
                  <span className="text-lg shrink-0 select-none">⚡</span>
                  <div>
                    <span className="font-sans font-bold text-xs text-slate-900 block">Integrated AI Advisory</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5 leading-relaxed">
                      Click the "Run Free AI Zoning Check" inside the form to receive an instant, bespoke analysis of zoning parameters, local permit requirements, and draft-lease contract strategies using the Gemini AI engine.
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex gap-3.5">
                  <span className="text-lg shrink-0 select-none">🛡️</span>
                  <div>
                    <span className="font-sans font-bold text-xs text-slate-900 block">Total Escrow Protection</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5 leading-relaxed">
                      All temporary leasing fees and security deposits remain safely in AcreLease escrow until contracts are finalized and you successfully occupy the land parcel.
                    </span>
                  </div>
                </div>
              </div>

              {/* Verified Badge */}
              <div className="pt-4 flex items-center gap-2 text-xs text-slate-400 font-medium">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                <span>AcreLease Standardized Lease Legal Coverage</span>
              </div>
            </div>

            {/* Right: The Interactive 2-Step Lead Sourcing Form */}
            <div className="lg:col-span-7">
              <LeadCaptureForm />
            </div>

          </div>
        </div>
      </section>

      {/* How Sourcing Works Section */}
      <HowItWorks />

      {/* Sectors & Bento Grid Use-cases */}
      <BenefitsSection />

      {/* Testimonials & Success metrics */}
      <SocialProof />

      {/* Accordion FAQ Section */}
      <FAQSection />

      {/* Final Call To Action Sourcing Banner */}
      <FinalCTA onCtaClick={scrollToForm} />

      {/* Standard Footer */}
      <Footer />

      {/* Sticky Floating WhatsApp Bubble */}
      <WhatsAppButton />

      {/* Mobile Sticky CTA Bar (CRO Booster) */}
      {showMobileSticky && (
        <div
          id="mobile-sticky-cta"
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-xl z-30 px-4 py-3.5 flex items-center justify-between gap-4 animate-slide-up md:hidden"
        >
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Find Matching Land</div>
            <div className="text-xs font-extrabold text-slate-900 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Sourcing Schedulers Live</span>
            </div>
          </div>
          <button
            onClick={scrollToForm}
            className="px-4.5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider shadow-md active:scale-95"
          >
            Submit Specs
          </button>
        </div>
      )}

    </div>
  );
}
