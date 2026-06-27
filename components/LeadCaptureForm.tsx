import React, { useState } from "react";
import { LeadFormData, AIAssessmentResult } from "../types";
import { LAND_TYPES, INTENDED_USES, STATES_AND_REGIONS } from "../data";
import AIAssessmentCard from "./AIAssessmentCard";
import {
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  Maximize2,
  FileText,
  User,
  Mail,
  Phone,
  MessageSquare,
  Building,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ThumbsUp,
} from "lucide-react";

interface LeadCaptureFormProps {
  onSuccessSubmit?: (leadId: string) => void;
}

const SIZES_PILLS = ["1-2 Acres", "5-10 Acres", "25-50 Acres", "100+ Acres", "10,000 sqft"];
const DURATIONS_PILLS = ["6 Months", "1 Year", "2-3 Years", "5+ Years", "Flexible Term"];
const BUDGETS_PILLS = ["Under $5k/yr", "$10k-$25k/yr", "$50k+/yr", "Flexible budget"];
const INFRASTRUCTURE_TAGS = ["Water Source", "Grid Power Connection", "Fenced Enclosure", "Heavy Truck Access", "High road proximity"];

export default function LeadCaptureForm({ onSuccessSubmit }: LeadCaptureFormProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    fullName: "",
    email: "",
    phone: "",
    whatsAppNumber: "",
    companyName: "",
    landType: "farmland",
    intendedUse: INTENDED_USES[0],
    preferredState: "United States",
    preferredLga: STATES_AND_REGIONS["United States"][0],
    minSize: "",
    maxBudget: "",
    leaseDuration: "",
    additionalRequirements: "",
  });

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAssessment, setAiAssessment] = useState<AIAssessmentResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [leadId, setLeadId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Handle Input Changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setError(null);
    setValidationError(null);

    if (name === "preferredState") {
      const lgas = STATES_AND_REGIONS[value] || [];
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        preferredLga: lgas[0] || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Helper to click pre-defined pills to populate input fields
  const handlePillClick = (fieldName: keyof LeadFormData, value: string) => {
    setValidationError(null);
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // Helper to toggle requirements tags in text area
  const handleRequirementTagClick = (tag: string) => {
    setFormData((prev) => {
      const current = prev.additionalRequirements ? prev.additionalRequirements.trim() : "";
      if (current.includes(tag)) {
        // Remove tag if already exists
        const cleaned = current
          .replace(new RegExp(`\\b${tag},?\\s*|\\s*,?\\s*\\b${tag}`), "")
          .trim();
        return { ...prev, additionalRequirements: cleaned };
      } else {
        // Add tag
        const divider = current ? ", " : "";
        return { ...prev, additionalRequirements: `${current}${divider}${tag}` };
      }
    });
  };

  // Validate Active Step
  const validateStep = (step: number, updateUI = true) => {
    if (updateUI) {
      setValidationError(null);
    }
    if (step === 1) {
      if (!formData.landType) {
        if (updateUI) setValidationError("Please select a land category.");
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!formData.minSize.trim()) {
        if (updateUI) setValidationError("Please specify the minimum size needed (e.g., 5 acres).");
        return false;
      }
      if (!formData.leaseDuration.trim()) {
        if (updateUI) setValidationError("Please specify your desired lease duration (e.g., 1 year).");
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (!formData.maxBudget.trim()) {
        if (updateUI) setValidationError("Please enter your estimated maximum budget.");
        return false;
      }
      return true;
    }
    if (step === 4) {
      if (!formData.fullName.trim()) {
        if (updateUI) setValidationError("Please enter your full name.");
        return false;
      }
      if (!formData.email.trim() || !formData.email.includes("@")) {
        if (updateUI) setValidationError("Please enter a valid email address.");
        return false;
      }
      if (!formData.phone.trim()) {
        if (updateUI) setValidationError("Please enter your phone number.");
        return false;
      }
      if (!formData.whatsAppNumber.trim()) {
        if (updateUI) setValidationError("Please enter your WhatsApp contact number.");
        return false;
      }
      return true;
    }
    return true;
  };

  // Trigger AI analysis on the server
  const handleAIAnalysis = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      setValidationError("Please fill in size and lease duration before running zoning checks.");
      setCurrentStep(2);
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze-requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landType: formData.landType,
          intendedUse: formData.intendedUse,
          minSize: formData.minSize,
          maxBudget: formData.maxBudget || "Flexible budget",
          leaseDuration: formData.leaseDuration,
          preferredState: formData.preferredState,
          preferredLga: formData.preferredLga,
          additionalRequirements: formData.additionalRequirements,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to compile AI insights.");
      }

      const data = await response.json();
      setAiAssessment(data);
    } catch (err: any) {
      setError("AI Advisory Service is currently busy. Please proceed to the final step to match land!");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Advance Step
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => (prev + 1) as any);
      const element = document.getElementById("lead-form-container");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // Regress Step
  const handlePrevStep = () => {
    setCurrentStep((prev) => (prev - 1) as any);
    const element = document.getElementById("lead-form-container");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Submit full lead details
  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(4)) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Submission failed.");
      }

      const data = await response.json();
      setLeadId(data.leadId);
      setIsSubmitted(true);
      if (onSuccessSubmit) {
        onSuccessSubmit(data.leadId);
      }
    } catch (err) {
      setError("Failed to submit land lease requirements. Please check your connection and try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="lead-form-container"
      className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl shadow-emerald-950/10 border border-white relative overflow-hidden transition-all duration-300"
    >
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full filter blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-2xl pointer-events-none"></div>

      {/* Progressive Step Tracker */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100/80 pb-5" id="onboarding-progress-header">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-100">
            Step {currentStep} of 4
          </span>
          <span className="text-xs font-bold text-slate-800">
            {currentStep === 1 && "Project Purpose"}
            {currentStep === 2 && "Size & Lease Duration"}
            {currentStep === 3 && "Location & Financial Budget"}
            {currentStep === 4 && "Contact Details & Review"}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-24 sm:w-32 bg-slate-100 h-2 rounded-full overflow-hidden relative border border-slate-200/50">
            <div
              className="absolute left-0 top-0 h-full bg-emerald-800 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
          <span className="font-mono text-[11px] text-slate-500 font-bold">{Math.round((currentStep / 4) * 100)}% Done</span>
        </div>
      </div>

      {/* Horizontal Interactive Steps Grid (Tablet & Desktop) */}
      <div className="hidden md:grid grid-cols-4 gap-4 mb-8 border-b border-slate-100 pb-5" id="onboarding-steps-track">
        {[
          { num: 1, title: "Project Use", desc: "Select category" },
          { num: 2, title: "Size & Term", desc: "Specify scope" },
          { num: 3, title: "Location", desc: "Target region" },
          { num: 4, title: "Contact", desc: "Secure matches" },
        ].map((s) => {
          const isActive = currentStep === s.num;
          const isCompleted = currentStep > s.num;
          return (
            <button
              key={s.num}
              type="button"
              disabled={s.num > currentStep && !validateStep(currentStep, false)}
              onClick={() => setCurrentStep(s.num as any)}
              className="flex gap-2.5 items-center text-left focus:outline-none transition-all disabled:opacity-50"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 shrink-0 ${
                  isActive
                    ? "bg-emerald-800 text-white shadow-md shadow-emerald-950/20"
                    : isCompleted
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-400 border border-slate-200/50"
                }`}
              >
                {isCompleted ? "✓" : s.num}
              </div>
              <div className="leading-none">
                <span className={`text-[11px] font-bold block ${isActive ? "text-slate-900" : "text-slate-400"}`}>
                  {s.title}
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5 block">{s.desc}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Form Content */}
      {!isSubmitted ? (
        <div className="space-y-6">
          {/* Context Header */}
          <div>
            <h3 className="font-sans font-bold text-lg sm:text-xl text-slate-900 tracking-tight leading-none">
              {currentStep === 1 && "What type of project are you matching land for?"}
              {currentStep === 2 && "Let's define your spatial and duration needs"}
              {currentStep === 3 && "Where is your target area and budget range?"}
              {currentStep === 4 && "Provide contact details to receive land matches"}
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-2 leading-relaxed">
              {currentStep === 1 && "Select the land style and intended project use to lock in the correct zoning templates."}
              {currentStep === 2 && "Size ranges help landowners determine availability. Quick options are supplied for ease."}
              {currentStep === 3 && "Select your target region. You can also run our AI Zoning Check to pre-examine restrictions."}
              {currentStep === 4 && "Our expert land advisors will scan the network and reach back within 2 hours. Review specs below."}
            </p>
          </div>

          {/* Validation/Success Error Banners */}
          {validationError && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 animate-fade-in" id="form-val-error">
              <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-fade-in" id="form-server-error">
              <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: PROJECT PURPOSE */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in" id="onboarding-step-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  1. Select Land Category Needed
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {LAND_TYPES.slice(0, 4).map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, landType: type.id }))}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between hover:scale-[1.01] ${
                        formData.landType === type.id
                          ? "border-emerald-800 bg-emerald-50/50 text-slate-900 ring-2 ring-emerald-800/20"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-xs font-extrabold block text-slate-800">{type.label}</span>
                      <span className="text-[10px] text-slate-500 block mt-1.5 leading-relaxed">
                        {type.description}
                      </span>
                    </button>
                  ))}
                </div>
                
                <select
                  name="landType"
                  value={formData.landType}
                  onChange={handleInputChange}
                  className="mt-3.5 w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10"
                >
                  <option value="" disabled>Or browse additional land types...</option>
                  {LAND_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  2. Intended Project Operation
                </label>
                <div className="relative">
                  <select
                    name="intendedUse"
                    value={formData.intendedUse}
                    onChange={handleInputChange}
                    className="w-full p-3.5 pr-10 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 appearance-none"
                  >
                    {INTENDED_USES.map((use, idx) => (
                      <option key={idx} value={use}>
                        {use}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs font-extrabold">▼</div>
                </div>
              </div>

              {/* Visual Onboarding Helper Panel */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/50 flex gap-3 items-start text-xs text-slate-600">
                <HelpCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 block mb-0.5">💡 Sourcing Tip</span>
                  <span>Agricultural and industrial leases rely on state zoning compatibility. Matching your exact project purpose ensures your contract draft covers relevant municipal waivers and tax exemption rules.</span>
                </div>
              </div>

              {/* Next Button only */}
              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-8 py-3.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/10 transition-all active:scale-[0.98]"
                >
                  <span>Next: size & term</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SIZING & DURATION */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fade-in" id="onboarding-step-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Maximize2 className="w-4 h-4 text-emerald-700" />
                  1. Minimum Acreage / Square Footage Required
                </label>
                <input
                  type="text"
                  name="minSize"
                  value={formData.minSize}
                  onChange={handleInputChange}
                  placeholder="e.g., 10 Acres, 15,000 sqft"
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 transition-all"
                />
                
                {/* Visual Aid: Quick select pills */}
                <div className="mt-2.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">Quick select size options:</span>
                  <div className="flex flex-wrap gap-2">
                    {SIZES_PILLS.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handlePillClick("minSize", size)}
                        className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                          formData.minSize === size
                            ? "bg-emerald-800 text-white border-emerald-800 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  2. Requested Lease Term Length
                </label>
                <input
                  type="text"
                  name="leaseDuration"
                  value={formData.leaseDuration}
                  onChange={handleInputChange}
                  placeholder="e.g., 6 months, 2 years"
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 transition-all"
                />

                {/* Visual Aid: Quick select lease pills */}
                <div className="mt-2.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">Quick select duration options:</span>
                  <div className="flex flex-wrap gap-2">
                    {DURATIONS_PILLS.map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => handlePillClick("leaseDuration", dur)}
                        className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                          formData.leaseDuration === dur
                            ? "bg-emerald-800 text-white border-emerald-800 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Visual Onboarding Helper Panel */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/50 flex gap-3 items-start text-xs text-slate-600">
                <ThumbsUp className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 block mb-0.5">📊 Structural Fact</span>
                  <span>Over 85% of landowners favor structured yearly leases, though 6-month staging easements are highly popular for material staging close to municipal construction routes.</span>
                </div>
              </div>

              {/* Step Navigation Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors py-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-8 py-3.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/10 transition-all active:scale-[0.98]"
                >
                  <span>Next: location</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: LOCATION & FINANCIALS */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fade-in" id="onboarding-step-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    Preferred Country
                  </label>
                  <select
                    name="preferredState"
                    value={formData.preferredState}
                    onChange={handleInputChange}
                    className="w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10"
                  >
                    {Object.keys(STATES_AND_REGIONS).map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    Preferred State / Region
                  </label>
                  <select
                    name="preferredLga"
                    value={formData.preferredLga}
                    onChange={handleInputChange}
                    className="w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10"
                  >
                    {(STATES_AND_REGIONS[formData.preferredState] || []).map((lga) => (
                      <option key={lga} value={lga}>
                        {lga}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-700" />
                  Estimated Maximum Budget Range
                </label>
                <input
                  type="text"
                  name="maxBudget"
                  value={formData.maxBudget}
                  onChange={handleInputChange}
                  placeholder="e.g., $15,000 / Year"
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 transition-all"
                />

                {/* Visual Aid: Quick budget pills */}
                <div className="mt-2.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">Quick select budgets:</span>
                  <div className="flex flex-wrap gap-2">
                    {BUDGETS_PILLS.map((bud) => (
                      <button
                        key={bud}
                        type="button"
                        onClick={() => handlePillClick("maxBudget", bud)}
                        className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                          formData.maxBudget === bud
                            ? "bg-emerald-800 text-white border-emerald-800 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {bud}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  Additional Infrastructure Requirements (Optional)
                </label>
                <textarea
                  name="additionalRequirements"
                  value={formData.additionalRequirements}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="e.g. water wells, high road access, heavy-vehicle turning circle..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 resize-none"
                ></textarea>

                {/* Visual Aid: Tap to append specs tags */}
                <div className="mt-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">Tap tag to append requirements:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {INFRASTRUCTURE_TAGS.map((tag) => {
                      const isSelected = formData.additionalRequirements?.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleRequirementTagClick(tag)}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-medium border transition-colors ${
                            isSelected
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* AI Trigger Block inside Onboarding (Outstanding trust & value builder) */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="font-sans font-bold text-xs flex items-center gap-1.5 text-white">
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                    Onboarding Zoning Check
                  </span>
                  <p className="text-[11px] text-slate-300 leading-normal max-w-sm">
                    Run an instant check to verify standard county zoning ordinances and permit drafts matching your specific use case.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAIAnalysis}
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-950/20 disabled:opacity-70 shrink-0"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Run Free AI Check</span>
                    </>
                  )}
                </button>
              </div>

              {/* AI Assessment Card render inline */}
              {aiAssessment && (
                <div className="transition-all duration-500 animate-fade-in">
                  <AIAssessmentCard
                    assessment={aiAssessment}
                    onContinueToSubmit={handleNextStep}
                    isLeadSubmitted={false}
                  />
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors py-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-8 py-3.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/10 transition-all active:scale-[0.98]"
                >
                  <span>Next: contact info</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CONTACT & REVIEW */}
          {currentStep === 4 && (
            <form onSubmit={handleSubmitLead} className="space-y-5 animate-fade-in" id="onboarding-step-4">
              {/* Dynamic Review Card summarizing onboarding choices */}
              <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 border-b border-emerald-100/50 pb-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0" />
                  <span className="font-sans font-bold text-[11px] text-emerald-800 uppercase tracking-wider">
                    Specifications Verification Summary
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-slate-700 leading-normal">
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px] uppercase">Land Category</span>
                    <span className="font-bold text-slate-800">
                      {LAND_TYPES.find((t) => t.id === formData.landType)?.label || formData.landType}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px] uppercase">Acreage Needed</span>
                    <span className="font-bold text-slate-800">{formData.minSize}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px] uppercase">Target Area</span>
                    <span className="font-bold text-slate-800">{formData.preferredState} ({formData.preferredLga})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px] uppercase">Lease Term</span>
                    <span className="font-bold text-slate-800">{formData.leaseDuration}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 font-medium block text-[10px] uppercase">Budget / Year</span>
                    <span className="font-bold text-emerald-900">{formData.maxBudget}</span>
                  </div>
                  {formData.additionalRequirements && (
                    <div className="col-span-2">
                      <span className="text-slate-400 font-medium block text-[10px] uppercase">Extra Infrastructure</span>
                      <span className="font-bold text-slate-800 italic">"{formData.additionalRequirements}"</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Secure Contact Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-400" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Jane Doe"
                    required
                    className="w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-slate-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="jane@company.com"
                    required
                    className="w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-400" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+234 707 825 2672"
                    required
                    className="w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    WhatsApp Number (Matches Alerts)
                  </label>
                  <input
                    type="tel"
                    name="whatsAppNumber"
                    value={formData.whatsAppNumber}
                    onChange={handleInputChange}
                    placeholder="+234 707 825 2672"
                    required
                    className="w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-slate-400" />
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Acme Operations Ltd."
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 transition-all"
                />
              </div>

              {/* Secure guarantee text */}
              <p className="text-[10px] text-center text-slate-400 leading-normal px-2">
                🔒 <strong>100% Confidential Guarantee</strong>. Your information is protected by escrow-standard security rules and will only be shared with verified matches landowners. No spam, ever.
              </p>

              {/* Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors py-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to specs</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-950/20 disabled:opacity-80 transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sourcing...</span>
                    </>
                  ) : (
                    <>
                      <span>Get Matches in 2 Hours</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* SUCCESS SCREEN */
        <div className="text-center py-8 px-4 animate-fade-in" id="form-success-screen">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md shadow-emerald-950/5">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h3 className="font-sans font-extrabold text-2xl text-slate-900 tracking-tight leading-none">
            Specs Safely Registered!
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto mt-3.5 leading-relaxed">
            Thank you, <span className="font-bold text-slate-900">{formData.fullName}</span>. Your requirements are locked under Sourcing Reference ID: <span className="font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 text-xs">{leadId}</span>.
          </p>

          <div className="my-8 p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 max-w-md mx-auto text-left">
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
              What Happens Next?
            </h4>
            <ul className="space-y-3 text-xs text-emerald-900/80 leading-relaxed">
              <li className="flex gap-2">
                <span className="font-extrabold text-emerald-700">1.</span>
                <span>We cross-verify matched arable, commercial, or pasture tracts in <span className="font-bold">{formData.preferredState}</span> ({formData.preferredLga}).</span>
              </li>
              <li className="flex gap-2">
                <span className="font-extrabold text-emerald-700">2.</span>
                <span>Within <span className="font-bold">2 hours</span>, an AcreLease representative will call or WhatsApp you to present 3 pre-vetted landowner files.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-extrabold text-emerald-700">3.</span>
                <span>We supply all standardized lease legal packages completely free.</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-sm mx-auto">
            <a
              href={`https://wa.me/2348152228251?text=Hi%2C%20I%20just%20submitted%20my%20temporary%20land%20lease%20requirements%20on%20AcreLease%20(ID%3A%20${leadId}).%20Can%20I%20get%20updates%3F`}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3.5 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-95 transition-all"
            >
              <MessageSquare className="w-4.5 h-4.5 shrink-0" />
              <span>WhatsApp Advisory</span>
            </a>
            <button
              onClick={() => {
                setAiAssessment(null);
                setIsSubmitted(false);
                setCurrentStep(1);
                setFormData({
                  fullName: "",
                  email: "",
                  phone: "",
                  whatsAppNumber: "",
                  companyName: "",
                  landType: "farmland",
                  intendedUse: INTENDED_USES[0],
                  preferredState: "United States",
                  preferredLga: STATES_AND_REGIONS["United States"][0],
                  minSize: "",
                  maxBudget: "",
                  leaseDuration: "",
                  additionalRequirements: "",
                });
              }}
              className="px-6 py-3.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Request Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
