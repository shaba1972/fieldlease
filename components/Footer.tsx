import { Compass, Mail, Phone, MessageSquare, ShieldCheck, FileText, Globe } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-900" id="footer-grid">
          
          {/* Company Brief */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <Compass className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="font-sans font-bold text-base text-white tracking-tight block leading-none">
                  FieldLease
                </span>
                <span className="font-mono text-[9px] text-emerald-500 font-medium tracking-wider uppercase block mt-1">
                  Temporary Land Hub
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              FieldLease is a premium PropTech platform connecting crop farmers, industrial logistics, construction staging coordinators, and event organizers with verified landowner acreage available for short- and long-term temporary lease.
            </p>
            <div className="text-[10px] text-slate-500 max-w-sm leading-relaxed">
              Disclaimer: FieldLease does not own, hold, buy, or sell physical real estate. All matches represent privately held properties listed by verified registered third-party landowners.
            </div>
          </div>

          {/* Quick links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">
              Browse Platform
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#how-it-works" className="hover:text-emerald-500 transition-colors">
                  How Sourcing Works
                </a>
              </li>
              <li>
                <a href="#benefits" className="hover:text-emerald-500 transition-colors">
                  Use-Case Benefits
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-emerald-500 transition-colors">
                  Client Case Studies
                </a>
              </li>
              <li>
                <a href="#faqs" className="hover:text-emerald-500 transition-colors">
                  Platform FAQ
                </a>
              </li>
              <li>
                <a
                  href="https://fieldlease-investor-portal-13088513289.europe-west2.run.app"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-500 transition-colors"
                >
                  Investor Portal
                </a>
              </li>
            </ul>
          </div>

          {/* Direct Sourcing Contact */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">
              Direct Land Advising
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex gap-2.5 items-center">
                <Mail className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                <a href="mailto:sourcing@fieldlease.com" className="hover:text-emerald-500 transition-colors">
                  sourcing@fieldlease.com
                </a>
              </li>
              <li className="flex gap-2.5 items-center">
                <Phone className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                <a href="tel:+2348152228251" className="hover:text-emerald-500 transition-colors">
                  +234 815 222 8251 (9am - 6pm EST)
                </a>
              </li>
              <li className="flex gap-2.5 items-center">
                <MessageSquare className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                <a href="https://wa.me/2348152228251" target="_blank" rel="noreferrer" className="hover:text-emerald-500 transition-colors flex items-center gap-1">
                  <span>Direct WhatsApp Line</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                </a>
              </li>
            </ul>
            <div className="pt-2">
              <span className="inline-block px-3 py-1 bg-slate-900 border border-slate-800 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider rounded-md">
                Active Sourcing State: TX, CA, FL, GA, OH
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-[10px] text-slate-500" id="footer-bottom">
          <div>
            © {currentYear} FieldLease Inc. All rights reserved. Made for temporary lease optimization.
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a href="#privacy" className="hover:text-slate-300 transition-colors flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Privacy Policy
            </a>
            <a href="#terms" className="hover:text-slate-300 transition-colors flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Terms of Service
            </a>
            <a href="#regional" className="hover:text-slate-300 transition-colors flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Regional Compliance Rules
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
