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

interface AdminLeadRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  companyName?: string;
  landType: string;
  intendedUse: string;
  preferredState: string;
  preferredLga: string;
  minSize: string;
  maxBudget: string;
  leaseDuration: string;
  additionalRequirements: string;
  submittedAt: string;
  contactStatus: "new" | "contacted" | "matched" | "not-interested";
  status: "new" | "follow-up" | "qualified" | "closed";
  internalNotes: string;
}

const adminLeads: AdminLeadRecord[] = [];
let adminSessionToken: string | null = null;

function createAdminToken(username: string) {
  return Buffer.from(`${username}:${Date.now()}`).toString("base64");
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization || "";
  if (!adminSessionToken || authHeader !== `Bearer ${adminSessionToken}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}

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
  console.log("Incoming lead:", req.body);

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
      console.error("Supabase Error:", error);
      return res.status(500).json({
        success: false,
        error: error?.message ?? "Database insert failed.",
      });
    }

    console.log("Inserted lead:", data);

    const newAdminLead: AdminLeadRecord = {
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
      submittedAt: new Date().toISOString(),
      contactStatus: "new",
      status: "new",
      internalNotes: "",
    };

    adminLeads.unshift(newAdminLead);

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
