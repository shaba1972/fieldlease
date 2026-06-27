import { supabase } from "./supabase";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-memory lead storage
//const leads: any[] = [];

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
app.post("/api/leads", async (req, res) => {
  const leadData = req.body;

  // Basic validation
  if (!leadData.fullName || !leadData.email || !leadData.phone || !leadData.landType || !leadData.intendedUse) {
    return res.status(400).json({ error: "Missing required contact or land requirements fields." });
  }

  try {
    const { data, error } = await supabase
      .from("leads")
      .insert({
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
        additional_requirements: leadData.additionalRequirements,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to save lead." });
    }

    const aiAssessment: any = {};

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
          systemInstruction:
            "You are a professional Land Consultant, Zoning Advisor, and Senior Real Estate Expert in temporary commercial, agricultural, and industrial land leasing. Generate realistic, data-driven, practical lease feasibility assessments.",
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
            required: [
              "suitabilityScore",
              "assessment",
              "capacityEstimate",
              "regulatoryBottlenecks",
              "leasingRecommendations",
              "matchingInsight",
            ],
          },
        },
      });

      const resultText = response.text || "{}";
      Object.assign(aiAssessment, JSON.parse(resultText));
    }

    return res.status(201).json({
      success: true,
      message:
        "Lead requirements submitted successfully! Our agents will contact you within 2 hours.",
      leadId: data.id,
      aiAssessment,
    });
  } catch (error) {
    console.error("Lead endpoint error:", error);
    return res.status(500).json({ error: "Failed to save lead or generate assessment." });
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
