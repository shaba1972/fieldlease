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
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SERVICE_ROLE_KEY exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
var supabase = (0, import_supabase_js.createClient)(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv2 = __toESM(require("dotenv"), 1);
import_dotenv2.default.config();
var app = (0, import_express.default)();
var PORT = Number(process.env.PORT) || 3e3;
app.use(import_express.default.json());
var adminSessionToken = null;
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
  return {
    contactStatus: row.contact_status ?? row.contactStatus ?? nestedAdminMeta.contactStatus ?? nestedAdminMeta.contact_status ?? "new",
    status: row.status ?? nestedAdminMeta.status ?? "new",
    internalNotes: row.internal_notes ?? row.internalNotes ?? nestedAdminMeta.internalNotes ?? nestedAdminMeta.internal_notes ?? ""
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
    internalNotes: adminMeta.internalNotes
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
app.post("/api/leads", async (req, res) => {
  const leadData = req.body;
  console.log("Incoming lead:", req.body);
  if (!leadData.fullName || !leadData.email || !leadData.phone || !leadData.landType || !leadData.intendedUse) {
    return res.status(400).json({ error: "Missing required contact or land requirements fields." });
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
        error: error?.message ?? "Database insert failed."
      });
    }
    console.log("Inserted lead:", data);
    const aiAssessment = {};
    try {
      const adminMetaPayload = {
        contactStatus: "new",
        status: "new",
        internalNotes: ""
      };
      if (ai) {
        const prompt = `
Analyze the following temporary land lease requirements for feasibility, capacity estimates, regulatory considerations, and lease strategy.
Requirements:
- Type of Land: ${leadData.landType}
- Intended Use: ${leadData.intendedUse}
- Minimum Size Needed: ${leadData.minSize}
- Budget Constraint: ${leadData.maxBudget || "Flexible"}
- Lease Duration: ${leadData.leaseDuration || "Flexible"}
- Preferred Location: State of ${leadData.preferredState || "Any State"}, Local Government of ${leadData.preferredLga || "Any LGA"}
- Additional Requirements: ${leadData.additionalRequirements || "None specified"}

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
        Object.assign(aiAssessment, JSON.parse(resultText));
      }
      try {
        await supabase.from("leads").update({
          ai_assessment: {
            adminMeta: adminMetaPayload,
            aiAssessment
          }
        }).eq("id", data.id);
      } catch (metaError) {
        console.warn("Admin metadata storage skipped:", metaError);
      }
    } catch (assessmentError) {
      console.warn("AI assessment skipped, continuing with lead submission:", assessmentError);
    }
    return res.status(201).json({
      success: true,
      message: "Lead requirements submitted successfully! Our agents will contact you within 2 hours.",
      leadId: data.id,
      aiAssessment
    });
  } catch (error) {
    console.error("Lead endpoint error:", error);
    return res.status(500).json({ error: "Failed to save lead or generate assessment." });
  }
});
app.post("/api/admin/login", (req, res) => {
  const username = String(req.body?.username || "");
  const password = String(req.body?.password || "");
  const expectedUsername = process.env.ADMIN_USERNAME || "admin";
  const expectedPassword = process.env.ADMIN_PASSWORD || "fieldlease2026";
  if (username !== expectedUsername || password !== expectedPassword) {
    return res.status(401).json({ error: "Invalid admin credentials" });
  }
  adminSessionToken = createAdminToken(username);
  return res.json({ token: adminSessionToken, username });
});
app.get("/api/admin/leads", requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from("leads").select("*");
    if (error) {
      throw error;
    }
    const leads = (data || []).map(normalizeLeadRecord).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    return res.json({ leads });
  } catch (error) {
    console.error("Admin leads fetch error:", error);
    return res.status(500).json({ error: "Unable to load leads" });
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
    const nextAdminMeta = {
      contactStatus: updates.contactStatus ?? currentAdminMeta.contactStatus,
      status: updates.status ?? currentAdminMeta.status,
      internalNotes: updates.internalNotes ?? currentAdminMeta.internalNotes
    };
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
    return res.status(500).json({ error: "Unable to update lead" });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware mounted.");
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
    console.log("Production static files mounted from dist/.");
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT} (Access via port 3000 only)`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
//# sourceMappingURL=server.cjs.map
