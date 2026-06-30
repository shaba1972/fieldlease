import { useState, useEffect } from "react";
import { Compass, Menu, X, Phone, MessageSquare } from "lucide-react";

interface HeaderProps {
  onCtaClick: () => void;
}

export default function Header({ onCtaClick }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/70 backdrop-blur-lg shadow-lg shadow-slate-100/40 border-b border-white/40 py-3"
          : "bg-white/40 backdrop-blur-md border-b border-white/20 py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2" id="header-logo">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Compass className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="font-sans font-bold text-lg text-slate-900 tracking-tight block leading-none">
                FieldLease
              </span>
              <span className="font-mono text-[9px] text-emerald-600 font-medium tracking-wider uppercase block mt-1">
                Temporary Land Hub
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8" id="header-nav-desktop">
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-emerald-700 transition-colors">
              How It Works
            </a>
            <a href="#benefits" className="text-sm font-medium text-slate-600 hover:text-emerald-700 transition-colors">
              Lease Benefits
            </a>
            <a href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-emerald-700 transition-colors">
              Success Stories
            </a>
            <a href="#faqs" className="text-sm font-medium text-slate-600 hover:text-emerald-700 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Contact and CTA */}
          <div className="hidden md:flex items-center gap-4" id="header-cta-desktop">
            <a
              href="tel:+2348152228251"
              className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>+234 815 222 8251</span>
            </a>
            
            <a
              href="/admin"
              className="px-4 py-2.5 rounded-xl border border-emerald-200 text-emerald-700 font-semibold text-sm transition-all duration-200 hover:bg-emerald-50"
            >
              Admin Dashboard
            </a>
            <button
              onClick={onCtaClick}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-all duration-200 shadow-md shadow-emerald-700/15 hover:shadow-emerald-700/25 active:scale-[0.98]"
            >
              Find Available Land
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-3">
            <a
              href="https://wa.me/2348152228251"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-sm"
              id="header-whatsapp-mobile"
            >
              <MessageSquare className="w-5 h-5" />
            </a>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-50 focus:outline-none"
              aria-label="Toggle Menu"
              id="header-menu-toggle"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/90 backdrop-blur-xl border-b border-white/40 absolute top-full left-0 right-0 shadow-2xl px-4 py-6 flex flex-col gap-5 transition-all duration-300" id="header-nav-mobile">
          <nav className="flex flex-col gap-4">
            <a
              href="#how-it-works"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-700 hover:text-emerald-700 py-1 border-b border-slate-50"
            >
              How It Works
            </a>
            <a
              href="#benefits"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-700 hover:text-emerald-700 py-1 border-b border-slate-50"
            >
              Lease Benefits
            </a>
            <a
              href="#testimonials"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-700 hover:text-emerald-700 py-1 border-b border-slate-50"
            >
              Success Stories
            </a>
            <a
              href="#faqs"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-700 hover:text-emerald-700 py-1 border-b border-slate-50"
            >
              FAQ
            </a>
          </nav>
          <div className="flex flex-col gap-3 pt-2">
            <a
              href="tel:+2348152228251"
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Call Advising: +234 815 222 8251</span>
            </a>
            
            <a
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-3.5 rounded-xl border border-emerald-200 text-emerald-700 font-bold text-sm text-center transition-all"
            >
              Admin Dashboard
            </a>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onCtaClick();
              }}
              className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm text-center transition-all shadow-md shadow-emerald-700/20"
            >
              Find Available Land
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
