import { AIAssessmentResult } from "../types";
import { Sparkles, ShieldAlert, Award, Compass, CheckCircle2, ArrowRight } from "lucide-react";

interface AIAssessmentCardProps {
  assessment: AIAssessmentResult;
  onContinueToSubmit: () => void;
  isLeadSubmitted: boolean;
}

export default function AIAssessmentCard({ assessment, onContinueToSubmit, isLeadSubmitted }: AIAssessmentCardProps) {
  // Determine score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-700 bg-emerald-50 border-emerald-100";
    if (score >= 50) return "text-amber-700 bg-amber-50 border-amber-100";
    return "text-rose-700 bg-rose-50 border-rose-100";
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return "bg-emerald-600";
    if (score >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div
      id="ai-assessment-card"
      className="bg-slate-950/90 backdrop-blur-xl text-white rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/20 border border-white/10 overflow-hidden relative"
    >
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full filter blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      
      {/* Top Tag */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-600/20 to-orange-500/20 border border-emerald-500/30">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="font-mono text-xs font-semibold text-emerald-300 uppercase tracking-wider">
            AI Land Suitability Assessment
          </span>
        </div>
        <div className="font-mono text-xs text-slate-400">
          Report #{Math.floor(100000 + Math.random() * 900000)}
        </div>
      </div>

      {/* Main Grid: Score & Overview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-b border-slate-800/80 pb-6 mb-6">
        {/* Score Ring / Bar */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
          <div className="text-sm font-medium text-slate-400 mb-1">Feasibility Score</div>
          <div className="text-5xl font-extrabold font-sans tracking-tight text-white flex items-baseline">
            {assessment.suitabilityScore}
            <span className="text-lg text-slate-500 font-normal">/100</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${getScoreBarColor(assessment.suitabilityScore)}`}
              style={{ width: `${assessment.suitabilityScore}%` }}
            ></div>
          </div>
          
          <div className="text-center mt-2 text-xs font-semibold text-emerald-400">
            {assessment.suitabilityScore >= 80 ? "Highly Viable Project" : assessment.suitabilityScore >= 50 ? "Feasible with Conditions" : "Requires Advisory Review"}
          </div>
        </div>

        {/* Written Overview */}
        <div className="md:col-span-8">
          <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-500" />
            Executive Summary
          </h4>
          <p className="text-slate-300 text-sm leading-relaxed">
            {assessment.assessment}
          </p>
          
          {/* Capacity Calculation */}
          {assessment.capacityEstimate && (
            <div className="mt-3 p-3 rounded-xl bg-slate-950/30 border border-slate-800/50 flex gap-2.5 items-start">
              <Compass className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-orange-400 block uppercase tracking-wider mb-0.5">Capacity Estimate</span>
                <span className="text-slate-300 text-xs leading-relaxed">{assessment.capacityEstimate}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Two Column Grid: Zoning Bottlenecks vs Contract Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Permits & Zoning */}
        <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800/60">
          <h5 className="text-xs font-bold text-orange-400 uppercase tracking-widest flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4.5 h-4.5" />
            Zoning & Permitting Checks
          </h5>
          <ul className="space-y-3">
            {assessment.regulatoryBottlenecks.map((bottleneck, index) => (
              <li key={index} className="flex gap-2 text-xs text-slate-300 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 mt-1.5"></span>
                <span>{bottleneck}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Leasing Strategy */}
        <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800/60">
          <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4.5 h-4.5" />
            Lease Agreement Strategy
          </h5>
          <ul className="space-y-3">
            {assessment.leasingRecommendations.map((rec, index) => (
              <li key={index} className="flex gap-2 text-xs text-slate-300 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5"></span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Conversion Booster / Bottom Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/50 to-slate-950/50 border border-emerald-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h6 className="text-sm font-bold text-white mb-1">Ready to Secure Matching Land?</h6>
          <p className="text-xs text-slate-400">
            {assessment.matchingInsight}
          </p>
        </div>
        {!isLeadSubmitted && (
          <button
            onClick={onContinueToSubmit}
            className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shrink-0 transition-all shadow-md shadow-emerald-950/40 group active:scale-[0.98]"
          >
            <span>Finish Submission</span>
            <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
}
