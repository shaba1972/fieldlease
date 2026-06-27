export interface LeadFormData {
  fullName: string;
  email: string;
  phone: string;
  whatsAppNumber: string;
  companyName?: string;
  landType: string;
  intendedUse: string;
  preferredState: string;
  preferredLga: string;
  minSize: string;
  maxBudget: string;
  leaseDuration: string;
  additionalRequirements: string;
}

export interface AIAssessmentResult {
  suitabilityScore: number;
  assessment: string;
  capacityEstimate: string;
  regulatoryBottlenecks: string[];
  leasingRecommendations: string[];
  matchingInsight: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SuccessMetric {
  value: string;
  label: string;
  description: string;
}

export interface Testimonial {
  name: string;
  role: string;
  company?: string;
  quote: string;
  avatar: string;
  rating: number;
  useCase: string;
}
