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
var adminLeads = [];
var adminSessionToken = null;
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
      whatsapp: leadData.whatsapp,
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
    const newAdminLead = {
      id: data.id,
      fullName: leadData.fullName,
      email: leadData.email,
      phone: leadData.phone,
      whatsapp: leadData.whatsapp,
      companyName: leadData.companyName,
      landType: leadData.landType,
      intendedUse: leadData.intendedUse,
      preferredState: leadData.preferredState,
      preferredLga: leadData.preferredLga,
      minSize: leadData.minSize,
      maxBudget: leadData.maxBudget,
      leaseDuration: leadData.leaseDuration,
      additionalRequirements: leadData.additionalRequirements,
      submittedAt: (/* @__PURE__ */ new Date()).toISOString(),
      contactStatus: "new",
      status: "new",
      internalNotes: ""
    };
    adminLeads.unshift(newAdminLead);
    const aiAssessment = {};
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
app.get("/api/admin/leads", requireAdmin, (req, res) => {
  res.json({ leads: adminLeads.slice().sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)) });
});
app.patch("/api/admin/leads/:id", requireAdmin, (req, res) => {
  const lead = adminLeads.find((item) => item.id === req.params.id);
  if (!lead) {
    return res.status(404).json({ error: "Lead not found" });
  }
  const updates = req.body || {};
  Object.assign(lead, updates);
  return res.json({ lead });
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
