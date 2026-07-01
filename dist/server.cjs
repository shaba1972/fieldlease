var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// supabase.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_supabase_js = require("@supabase/supabase-js");
import_dotenv.default.config();
var supabase = (0, import_supabase_js.createClient)(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// server.ts
var import_express = __toESM(require("express"), 1);
var import_express_rate_limit = __toESM(require("express-rate-limit"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv2 = __toESM(require("dotenv"), 1);
import_dotenv2.default.config();
var app = (0, import_express.default)();
var PORT = Number(process.env.PORT) || 3e3;
var TURNSTILE_SITE_KEY = process.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY || (process.env.NODE_ENV !== "production" ? "1x00000000000000000000AA" : "");
var TURNSTILE_SECRET_KEY = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || (process.env.NODE_ENV !== "production" ? "1x0000000000000000000000000000000AA" : "");
var TURNSTILE_ACTION = "lead_capture";
app.set("trust proxy", 1);
app.use(import_express.default.json({ limit: "10mb" }));
var leadLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many submissions. Please try again later."
  }
});
app.use("/api/leads", leadLimiter);
var adminSessionToken = null;
function normalizePipelineStatus(value) {
  if (value === "contacted" || value === "searching" || value === "matched" || value === "closed") {
    return value;
  }
  if (value === "not-interested" || value === "qualified" || value === "follow-up") {
    return "closed";
  }
  return "new";
}
function getAdminMetaFromRow(row) {
  const aiAssessmentValue = row.ai_assessment ?? row.aiAssessment;
  let nestedAdminMeta = {};
  if (typeof aiAssessmentValue === "string") {
    try {
      const parsed = JSON.parse(aiAssessmentValue);
      nestedAdminMeta = parsed?.adminMeta ?? {};
    } catch {
      nestedAdminMeta = {};
    }
  } else if (aiAssessmentValue && typeof aiAssessmentValue === "object") {
    nestedAdminMeta = aiAssessmentValue.adminMeta ?? {};
  }
  const tags = Array.isArray(nestedAdminMeta.tags) ? nestedAdminMeta.tags : [];
  const activityHistory = Array.isArray(nestedAdminMeta.activityHistory) ? nestedAdminMeta.activityHistory : [];
  const documents = Array.isArray(nestedAdminMeta.documents) ? nestedAdminMeta.documents : [];
  const notificationHistory = Array.isArray(nestedAdminMeta.notificationHistory) ? nestedAdminMeta.notificationHistory : [];
  return {
    contactStatus: normalizePipelineStatus(row.contact_status ?? row.contactStatus ?? nestedAdminMeta.contactStatus ?? nestedAdminMeta.contact_status ?? "new"),
    status: row.status ?? nestedAdminMeta.status ?? "new",
    internalNotes: row.internal_notes ?? row.internalNotes ?? nestedAdminMeta.internalNotes ?? nestedAdminMeta.internal_notes ?? "",
    assignee: nestedAdminMeta.assignee ?? "",
    priority: nestedAdminMeta.priority ?? "medium",
    tags,
    followUpDate: nestedAdminMeta.followUpDate ?? nestedAdminMeta.follow_up_date ?? null,
    reminderEnabled: Boolean(nestedAdminMeta.reminderEnabled ?? nestedAdminMeta.reminder_enabled ?? false),
    reminderSentAt: nestedAdminMeta.reminderSentAt ?? nestedAdminMeta.reminder_sent_at ?? null,
    activityHistory,
    documents,
    notificationHistory
  };
}
function normalizeLeadRecord(row) {
  const submittedAt = row.submitted_at ?? row.submittedAt ?? row.created_at ?? row.createdAt ?? (/* @__PURE__ */ new Date()).toISOString();
  const adminMeta = getAdminMetaFromRow(row);
  return {
    id: row.id,
    fullName: row.full_name ?? row.fullName ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    whatsapp: row.whatsapp ?? row.whatsAppNumber ?? "",
    companyName: row.company_name ?? row.companyName ?? "",
    landType: row.land_type ?? row.landType ?? "",
    intendedUse: row.intended_use ?? row.intendedUse ?? "",
    preferredState: row.preferred_state ?? row.preferredState ?? "",
    preferredLga: row.preferred_lga ?? row.preferredLga ?? "",
    minSize: row.minimum_size ?? row.minSize ?? "",
    maxBudget: row.maximum_budget ?? row.maxBudget ?? "",
    leaseDuration: row.lease_duration ?? row.leaseDuration ?? "",
    additionalRequirements: row.additional_requirements ?? row.additionalRequirements ?? "",
    submittedAt,
    contactStatus: adminMeta.contactStatus,
    status: adminMeta.status,
    internalNotes: adminMeta.internalNotes,
    assignee: adminMeta.assignee,
    priority: adminMeta.priority,
    tags: adminMeta.tags,
    followUpDate: adminMeta.followUpDate,
    reminderEnabled: adminMeta.reminderEnabled,
    reminderSentAt: adminMeta.reminderSentAt,
    activityHistory: adminMeta.activityHistory,
    documents: adminMeta.documents,
    notificationHistory: adminMeta.notificationHistory
  };
}
function buildNextAdminMeta(currentAdminMeta, updates) {
  return {
    contactStatus: normalizePipelineStatus(updates.contactStatus ?? currentAdminMeta.contactStatus ?? "new"),
    status: updates.status ?? currentAdminMeta.status ?? "new",
    internalNotes: updates.internalNotes ?? currentAdminMeta.internalNotes ?? "",
    assignee: updates.assignee ?? currentAdminMeta.assignee ?? "",
    priority: updates.priority ?? currentAdminMeta.priority ?? "medium",
    tags: Array.isArray(updates.tags) ? updates.tags : Array.isArray(currentAdminMeta.tags) ? currentAdminMeta.tags : [],
    followUpDate: updates.followUpDate ?? currentAdminMeta.followUpDate ?? null,
    reminderEnabled: updates.reminderEnabled ?? currentAdminMeta.reminderEnabled ?? false,
    reminderSentAt: updates.reminderSentAt ?? currentAdminMeta.reminderSentAt ?? null,
    activityHistory: Array.isArray(updates.activityHistory) ? updates.activityHistory : Array.isArray(currentAdminMeta.activityHistory) ? currentAdminMeta.activityHistory : [],
    documents: Array.isArray(updates.documents) ? updates.documents : Array.isArray(currentAdminMeta.documents) ? currentAdminMeta.documents : [],
    notificationHistory: Array.isArray(updates.notificationHistory) ? updates.notificationHistory : Array.isArray(currentAdminMeta.notificationHistory) ? currentAdminMeta.notificationHistory : []
  };
}
function mapLeadUpdateToSupabase(updates) {
  const mapped = {};
  for (const [key, value] of Object.entries(updates)) {
    switch (key) {
      case "contactStatus":
        mapped.contact_status = value;
        break;
      case "internalNotes":
        mapped.internal_notes = value;
        break;
      case "status":
        mapped.status = value;
        break;
      case "contact_status":
      case "internal_notes":
        mapped[key] = value;
        break;
      default:
        break;
    }
  }
  return mapped;
}
function createAdminToken(username) {
  return Buffer.from(`${username}:${Date.now()}`).toString("base64");
}
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || "";
  if (!adminSessionToken || authHeader !== `Bearer ${adminSessionToken}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}
async function verifyTurnstileToken(token, remoteIp) {
  if (!TURNSTILE_SECRET_KEY) {
    return {
      success: false,
      error: "Spam protection is not configured. Please contact support."
    };
  }
  if (!token) {
    return {
      success: false,
      error: "Please complete the spam protection check before submitting."
    };
  }
  try {
    const body = new URLSearchParams({
      secret: TURNSTILE_SECRET_KEY,
      response: token
    });
    if (remoteIp) {
      body.set("remoteip", remoteIp);
    }
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    });
    if (!response.ok) {
      throw new Error(`Turnstile verification returned ${response.status}`);
    }
    const result = await response.json();
    if (!result.success) {
      console.warn("Turnstile verification failed:", result["error-codes"] || []);
      return {
        success: false,
        error: "Spam protection verification failed. Please refresh and try again."
      };
    }
    if (process.env.NODE_ENV === "production" && result.action !== TURNSTILE_ACTION) {
      console.warn("Turnstile action mismatch:", result.action);
      return {
        success: false,
        error: "Spam protection verification failed. Please refresh and try again."
      };
    }
    return { success: true };
  } catch (error) {
    console.warn("Turnstile verification error:", error);
    return {
      success: false,
      error: "Spam protection is temporarily unavailable. Please try again in a moment."
    };
  }
}
var ai = null;
if (process.env.GEMINI_API_KEY) {
  ai = new import_genai.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
function getUserFriendlyErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("network") || message.includes("fetch") || message.includes("timeout")) {
      return "We couldn\u2019t reach the service right now. Please try again in a moment.";
    }
    if (message.includes("unauthorized") || message.includes("credential") || message.includes("invalid")) {
      return "The provided credentials were not accepted.";
    }
    if (message.includes("database") || message.includes("supabase") || message.includes("insert") || message.includes("update")) {
      return "We couldn\u2019t save your request right now. Please try again in a moment.";
    }
    return error.message;
  }
  return fallback;
}
async function generateAiAssessment(payload) {
  if (!ai) {
    return {};
  }
  const prompt = `
Analyze the following temporary land lease requirements for feasibility, capacity estimates, regulatory considerations, and lease strategy.
Requirements:
- Type of Land: ${payload.landType || "Not specified"}
- Intended Use: ${payload.intendedUse || "Not specified"}
- Minimum Size Needed: ${payload.minSize || "Not specified"}
- Budget Constraint: ${payload.maxBudget || "Flexible"}
- Lease Duration: ${payload.leaseDuration || "Flexible"}
- Preferred Location: State of ${payload.preferredState || "Any State"}, Local Government of ${payload.preferredLga || "Any LGA"}
- Additional Requirements: ${payload.additionalRequirements || "None specified"}

Generate a detailed zoning, capacity, and leasing advisory report for this land seeker. You must output a JSON response matching the required schema.
`;
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      systemInstruction: "You are a professional Land Consultant, Zoning Advisor, and Senior Real Estate Expert in temporary commercial, agricultural, and industrial land leasing. Generate realistic, data-driven, practical lease feasibility assessments.",
      responseMimeType: "application/json",
      responseSchema: {
        type: import_genai.Type.OBJECT,
        properties: {
          suitabilityScore: {
            type: import_genai.Type.INTEGER,
            description: "A feasibility score from 10 to 100 based on the viability of doing this temporarily."
          },
          assessment: {
            type: import_genai.Type.STRING,
            description: "A highly professional, authoritative assessment (2-3 sentences) of the lease viability."
          },
          capacityEstimate: {
            type: import_genai.Type.STRING,
            description: "Estimated capacity or layout potential for this specific size and use (e.g. storage volume, head of livestock, or layout staging)."
          },
          regulatoryBottlenecks: {
            type: import_genai.Type.ARRAY,
            items: { type: import_genai.Type.STRING },
            description: "3 key local regulations, zoning constraints, or permits they should watch out for."
          },
          leasingRecommendations: {
            type: import_genai.Type.ARRAY,
            items: { type: import_genai.Type.STRING },
            description: "3 high-value, professional recommendations for drafting a temporary lease for this use."
          },
          matchingInsight: {
            type: import_genai.Type.STRING,
            description: "An encouraging call-to-action confirming that landowners in our network support this type of lease."
          }
        },
        required: [
          "suitabilityScore",
          "assessment",
          "capacityEstimate",
          "regulatoryBottlenecks",
          "leasingRecommendations",
          "matchingInsight"
        ]
      }
    }
  });
  const resultText = response.text || "{}";
  return JSON.parse(resultText);
}
app.post("/api/analyze-requirements", async (req, res) => {
  try {
    const assessment = await generateAiAssessment(req.body || {});
    return res.json(assessment);
  } catch (error) {
    console.warn("AI analysis fallback used:", error);
    return res.json({
      suitabilityScore: 0,
      assessment: "We\u2019re currently unable to generate a live AI zoning read. You can still proceed to submit your requirements and our team will follow up.",
      capacityEstimate: "Pending review",
      regulatoryBottlenecks: ["Local zoning review pending", "Permit requirements pending"],
      leasingRecommendations: ["Submit your requirements for manual review", "Our team will advise on lease terms"],
      matchingInsight: "Our land network is still ready to match your temporary lease request."
    });
  }
});
app.get("/api/security/turnstile-site-key", (_req, res) => {
  if (!TURNSTILE_SITE_KEY) {
    return res.status(503).json({ error: "Spam protection is not configured." });
  }
  return res.json({ siteKey: TURNSTILE_SITE_KEY });
});
app.post("/api/leads", async (req, res) => {
  const leadData = req.body;
  const turnstileResult = await verifyTurnstileToken(String(leadData?.turnstileToken || ""), req.ip);
  if (!turnstileResult.success) {
    return res.status(403).json({ error: turnstileResult.error });
  }
  if (!leadData?.fullName || !leadData?.email || !leadData?.phone || !leadData?.landType || !leadData?.intendedUse) {
    return res.status(400).json({ error: "Please complete the required contact and land details before submitting." });
  }
  try {
    const { data, error } = await supabase.from("leads").insert({
      full_name: leadData.fullName,
      email: leadData.email,
      phone: leadData.phone,
      whatsapp: leadData.whatsapp ?? leadData.whatsAppNumber,
      company_name: leadData.companyName,
      land_type: leadData.landType,
      intended_use: leadData.intendedUse,
      preferred_state: leadData.preferredState,
      preferred_lga: leadData.preferredLga,
      minimum_size: leadData.minSize,
      maximum_budget: leadData.maxBudget,
      lease_duration: leadData.leaseDuration,
      additional_requirements: leadData.additionalRequirements
    }).select().single();
    if (error) {
      console.error("Supabase Error:", error);
      return res.status(500).json({
        success: false,
        error: "We couldn\u2019t save your request right now. Please try again in a moment."
      });
    }
    const aiAssessment = {};
    const adminMetaPayload = {
      contactStatus: "new",
      status: "new",
      internalNotes: "",
      assignee: "",
      priority: "medium",
      tags: [],
      followUpDate: null,
      reminderEnabled: false,
      reminderSentAt: null,
      activityHistory: [
        {
          id: `${data.id}-created`,
          type: "system",
          message: "Lead submitted through the intake form.",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      ],
      documents: [],
      notificationHistory: []
    };
    try {
      Object.assign(aiAssessment, await generateAiAssessment(leadData));
    } catch (assessmentError) {
      console.warn("AI assessment skipped, continuing with lead submission:", assessmentError);
    }
    try {
      await supabase.from("leads").update({
        ai_assessment: { ...aiAssessment, adminMeta: adminMetaPayload },
        contact_status: "new",
        status: "new",
        internal_notes: ""
      }).eq("id", data.id);
    } catch (metaError) {
      console.warn("Admin metadata storage skipped:", metaError);
    }
    return res.status(201).json({
      success: true,
      message: "Lead requirements submitted successfully! Our agents will contact you within 2 hours.",
      leadId: data.id,
      aiAssessment
    });
  } catch (error) {
    console.error("Lead endpoint error:", error);
    return res.status(500).json({ error: getUserFriendlyErrorMessage(error, "We couldn\u2019t save your request right now. Please try again in a moment.") });
  }
});
app.post("/api/admin/login", (req, res) => {
  const username = String(req.body?.username || "");
  const password = String(req.body?.password || "");
  const expectedUsername = process.env.ADMIN_USERNAME || "admin";
  const expectedPassword = process.env.ADMIN_PASSWORD || "fieldlease2026";
  if (username !== expectedUsername || password !== expectedPassword) {
    return res.status(401).json({ error: "The username or password you entered is incorrect." });
  }
  adminSessionToken = createAdminToken(username);
  return res.json({ token: adminSessionToken, username });
});
app.get("/api/admin/leads", requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    const leads = (data || []).map(normalizeLeadRecord);
    return res.json({ leads });
  } catch (error) {
    console.error("Admin leads fetch error:", error);
    return res.status(500).json({ error: getUserFriendlyErrorMessage(error, "We couldn\u2019t load the lead list right now. Please refresh and try again.") });
  }
});
app.patch("/api/admin/leads/:id", requireAdmin, async (req, res) => {
  const updates = req.body || {};
  const mappedUpdates = mapLeadUpdateToSupabase(updates);
  try {
    if (Object.keys(mappedUpdates).length) {
      const { error: updateError } = await supabase.from("leads").update(mappedUpdates).eq("id", req.params.id);
      if (updateError) {
        console.warn("Supabase lead update warning:", updateError.message);
      }
    }
    const { data, error: selectError } = await supabase.from("leads").select("*").eq("id", req.params.id).maybeSingle();
    if (selectError) {
      throw selectError;
    }
    const mergedRow = { ...data || {}, ...updates };
    for (const [key, value] of Object.entries(updates)) {
      switch (key) {
        case "contactStatus":
          mergedRow.contact_status = value;
          break;
        case "internalNotes":
          mergedRow.internal_notes = value;
          break;
        case "status":
          mergedRow.status = value;
          break;
        default:
          break;
      }
    }
    const currentAdminMeta = getAdminMetaFromRow(mergedRow);
    const nextAdminMeta = buildNextAdminMeta(currentAdminMeta, updates);
    try {
      const currentAiAssessment = mergedRow.ai_assessment ?? mergedRow.aiAssessment;
      let nextAiAssessment = {};
      if (typeof currentAiAssessment === "string") {
        try {
          nextAiAssessment = JSON.parse(currentAiAssessment);
        } catch {
          nextAiAssessment = {};
        }
      } else if (currentAiAssessment && typeof currentAiAssessment === "object") {
        nextAiAssessment = { ...currentAiAssessment };
      }
      nextAiAssessment.adminMeta = nextAdminMeta;
      await supabase.from("leads").update({ ai_assessment: nextAiAssessment }).eq("id", req.params.id);
    } catch (metaStorageError) {
      console.warn("Admin metadata storage update skipped:", metaStorageError);
    }
    return res.json({ lead: normalizeLeadRecord(mergedRow) });
  } catch (error) {
    console.error("Admin lead update error:", error);
    return res.status(500).json({ error: getUserFriendlyErrorMessage(error, "We couldn\u2019t update this lead right now. Please try again.") });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.info(`Server starting on port ${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
//# sourceMappingURL=server.cjs.map
