import { useState } from "react";
import { FAQS } from "../data";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faqs" className="py-20 bg-slate-50/25 border-b border-white/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-16" id="faq-header">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100">
            Frequently Asked Questions
          </span>
          <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight mt-4">
            Have Questions? We Have Answers
          </h2>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed max-w-xl mx-auto">
            Everything you need to know about temporary land lease licensing, regulatory permits, landowner matching, and insurance coverage.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-4" id="faqs-accordion">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border backdrop-blur-md transition-all ${
                  isOpen
                    ? "border-emerald-800 bg-emerald-50/30 shadow-md shadow-emerald-950/5"
                    : "border-slate-200/50 bg-white/60 hover:bg-white/90"
                }`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 focus:outline-none"
                >
                  <div className="flex gap-3 items-start sm:items-center">
                    <HelpCircle className={`w-5 h-5 shrink-0 mt-0.5 sm:mt-0 ${isOpen ? "text-emerald-700" : "text-slate-400"}`} />
                    <span className="font-sans font-bold text-sm sm:text-base text-slate-900 tracking-tight leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-emerald-700" : ""
                    }`}
                  />
                </button>
                
                {/* Expandable Panel */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-[500px] border-t border-slate-100" : "max-h-0"
                  }`}
                >
                  <div className="p-5 sm:p-6 text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
