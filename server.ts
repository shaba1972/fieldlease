import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory lead storage
const leads: any[] = [];

// Gemini client initialization (with safety fallback for missing key)
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Leads API endpoint
app.post("/api/leads", (req, res) => {
  const leadData = req.body;
  
  // Basic validation
  if (!leadData.fullName || !leadData.email || !leadData.phone || !leadData.landType || !leadData.intendedUse) {
    return res.status(400).json({ error: "Missing required contact or land requirements fields." });
  }

  const newLead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    submittedAt: new Date().toISOString(),
    ...leadData,
  };

  leads.push(newLead);
  console.log("New lead received and stored in memory:", newLead);

  return res.status(201).json({
    success: true,
    message: "Lead requirements submitted successfully! Our agents will contact you within 2 hours.",
    leadId: newLead.id,
  });
});

// AI Requirements Assessment API
app.post("/api/analyze-requirements", async (req, res) => {
  const requirements = req.body;

  if (!requirements.landType || !requirements.intendedUse || !requirements.minSize) {
    return res.status(400).json({ error: "Please specify land type, intended use, and minimum size to analyze." });
  }

  if (!ai) {
    // Return mock assessment if Gemini API Key is missing, for seamless local dev preview
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
          type: Type.OBJECT,
          properties: {
            suitabilityScore: {
              type: Type.INTEGER,
              description: "A feasibility score from 10 to 100 based on the viability of doing this temporarily.",
            },
            assessment: {
              type: Type.STRING,
              description: "A highly professional, authoritative assessment (2-3 sentences) of the lease viability.",
            },
            capacityEstimate: {
              type: Type.STRING,
              description: "Estimated capacity or layout potential for this specific size and use (e.g. storage volume, head of livestock, or layout staging).",
            },
            regulatoryBottlenecks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 key local regulations, zoning constraints, or permits they should watch out for.",
            },
            leasingRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 high-value, professional recommendations for drafting a temporary lease for this use.",
            },
            matchingInsight: {
              type: Type.STRING,
              description: "An encouraging call-to-action confirming that landowners in our network support this type of lease.",
            },
          },
          required: ["suitabilityScore", "assessment", "capacityEstimate", "regulatoryBottlenecks", "leasingRecommendations", "matchingInsight"],
        },
      },
    });

    const resultText = response.text || "{}";
    const assessmentData = JSON.parse(resultText);
    return res.json(assessmentData);
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return res.status(500).json({ error: "Failed to generate AI land assessment. Please submit the form directly." });
  }
});

// Configure Vite or serve static production bundle
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
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
