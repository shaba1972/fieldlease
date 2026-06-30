import { SUCCESS_METRICS, TESTIMONIALS } from "../data";
import { Star, MessageSquare } from "lucide-react";

export default function SocialProof() {
  return (
    <section id="testimonials" className="py-20 bg-slate-50/55 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Row 1: Success Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pb-16 border-b border-slate-200" id="metrics-grid">
          {SUCCESS_METRICS.map((metric, index) => (
            <div key={index} className="text-center p-4">
              <div className="text-4xl sm:text-5xl font-extrabold font-sans text-emerald-800 tracking-tight leading-none">
                {metric.value}
              </div>
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-3">
                {metric.label}
              </div>
              <p className="text-slate-500 text-[11px] mt-1 leading-normal max-w-[200px] mx-auto font-medium">
                {metric.description}
              </p>
            </div>
          ))}
        </div>

        {/* Row 2: Client Testimonials */}
        <div className="pt-20">
          <div className="text-center max-w-xl mx-auto mb-16" id="testimonials-header">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100">
              Trusted Partnerships
            </span>
            <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight mt-4">
              Success Stories Across the Field
            </h2>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed">
              Read how leading agribusinesses, renewable trial networks, and staging logistics coordinators use FieldLease to secure temporary easements and parcels.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="testimonials-grid">
            {TESTIMONIALS.map((review, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg shadow-slate-100/40 border border-white flex flex-col justify-between hover:border-slate-200 hover:bg-white/95 transition-all"
              >
                <div>
                  {/* Rating Stars */}
                  <div className="flex gap-1 text-orange-400 mb-4">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-4.5 h-4.5 fill-current" />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-slate-600 text-xs italic leading-relaxed">
                    "{review.quote}"
                  </blockquote>
                </div>

                {/* Profiling */}
                <div className="flex gap-3 items-center mt-6 pt-6 border-t border-slate-50 shrink-0">
                  <img
                    src={review.avatar}
                    alt={`${review.name} - ${review.role}`}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover shadow-sm shrink-0"
                  />
                  <div>
                    <cite className="not-italic font-bold text-xs text-slate-900 block leading-tight">
                      {review.name}
                    </cite>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {review.role}, <span className="text-slate-500">{review.company}</span>
                    </span>
                  </div>
                  {/* Project Tag */}
                  <span className="ml-auto px-2 py-1 bg-emerald-50 text-emerald-800 text-[9px] font-bold rounded-md">
                    {review.useCase}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
