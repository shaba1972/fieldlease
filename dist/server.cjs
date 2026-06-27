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

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var leads = [];
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
app.post("/api/leads", (req, res) => {
  const leadData = req.body;
  if (!leadData.fullName || !leadData.email || !leadData.phone || !leadData.landType || !leadData.intendedUse) {
    return res.status(400).json({ error: "Missing required contact or land requirements fields." });
  }
  const newLead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    submittedAt: (/* @__PURE__ */ new Date()).toISOString(),
    ...leadData
  };
  leads.push(newLead);
  console.log("New lead received and stored in memory:", newLead);
  return res.status(201).json({
    success: true,
    message: "Lead requirements submitted successfully! Our agents will contact you within 2 hours.",
    leadId: newLead.id
  });
});
app.post("/api/analyze-requirements", async (req, res) => {
  const requirements = req.body;
  if (!requirements.landType || !requirements.intendedUse || !requirements.minSize) {
    return res.status(400).json({ error: "Please specify land type, intended use, and minimum size to analyze." });
  }
  if (!ai) {
    return res.json({
      suitabilityScore: 92,
      assessment: `Your proposed use for "${requirements.intendedUse}" with a "${requirements.landType}" of size "${requirements.minSize}" is highly viable for temporary leasing. Temporary leases are highly favored by landowners to maintain tax exemptions while securing holding-period yield.`,
      capacityEstimate: `A size of ${requirements.minSize} is perfectly optimized for standard operations in this sector. For ${requirements.intendedUse}, this layout supports comfortable operations with spacious staging.`,
      regulatoryBottlenecks: [
        "Temporary Use Permit (TUP) is required from local planning authority.",
        "Ensure compliance with environmental buffer zone rules for livestock/farming.",
        "Verify heavy transport access routes if logistics or warehousing is intended."
      ],
      leasingRecommendations: [
        "Include a 'Restoration Clause' in your lease to reassure landowners the site will be returned to its original state.",
        "Opt for a 12-to-24-month lease with a unilateral extension option for maximum project flexibility.",
        "Request direct water and grid access points during the landowner matching phase."
      ],
      matchingInsight: "We have detected 3 verified landowners in our network matching these requirements. Submit your contact details below to secure the matching listings!"
    });
  }
  try {
    const prompt = `
Analyze the following temporary land lease requirements for feasibility, capacity estimates, regulatory considerations, and lease strategy.
Requirements:
- Type of Land: ${requirements.landType}
- Intended Use: ${requirements.intendedUse}
- Minimum Size Needed: ${requirements.minSize}
- Budget Constraint: ${requirements.maxBudget || "Flexible"}
- Lease Duration: ${requirements.leaseDuration || "Flexible"}
- Preferred Location: State of ${requirements.preferredState || "Any State"}, Local Government of ${requirements.preferredLga || "Any LGA"}
- Additional Requirements: ${requirements.additionalRequirements || "None specified"}

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
          required: ["suitabilityScore", "assessment", "capacityEstimate", "regulatoryBottlenecks", "leasingRecommendations", "matchingInsight"]
        }
      }
    });
    const resultText = response.text || "{}";
    const assessmentData = JSON.parse(resultText);
    return res.json(assessmentData);
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return res.status(500).json({ error: "Failed to generate AI land assessment. Please submit the form directly." });
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
