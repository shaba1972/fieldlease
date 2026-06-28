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

let adminSessionToken: string | null = null;

function getAdminMetaFromRow(row: Record<string, any>) {
  const aiAssessmentValue = row.ai_assessment ?? row.aiAssessment;
  let nestedAdminMeta: Record<string, any> = {};

  if (typeof aiAssessmentValue === "string") {
    try {
      const parsed = JSON.parse(aiAssessmentValue);
      nestedAdminMeta = parsed?.adminMeta ?? {};
    } catch {
      nestedAdminMeta = {};
    }
  } else if (aiAssessmentValue && typeof aiAssessmentValue === "object") {
    nestedAdminMeta = (aiAssessmentValue as Record<string, any>).adminMeta ?? {};
  }

  return {
    contactStatus: (row.contact_status ?? row.contactStatus ?? nestedAdminMeta.contactStatus ?? nestedAdminMeta.contact_status ?? "new") as AdminLeadRecord["contactStatus"],
    status: (row.status ?? nestedAdminMeta.status ?? "new") as AdminLeadRecord["status"],
    internalNotes: (row.internal_notes ?? row.internalNotes ?? nestedAdminMeta.internalNotes ?? nestedAdminMeta.internal_notes ?? "") as string,
  };
}

function normalizeLeadRecord(row: Record<string, any>): AdminLeadRecord {
  const submittedAt =
    row.submitted_at ??
    row.submittedAt ??
    row.created_at ??
    row.createdAt ??
    new Date().toISOString();

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
  };
}

function mapLeadUpdateToSupabase(updates: Record<string, any>) {
  const mapped: Record<string, any> = {};

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

async function generateAiAssessment(payload: Record<string, any>) {
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
      assessment: "We’re currently unable to generate a live AI zoning read. You can still proceed to submit your requirements and our team will follow up.",
      capacityEstimate: "Pending review",
      regulatoryBottlenecks: ["Local zoning review pending", "Permit requirements pending"],
      leasingRecommendations: ["Submit your requirements for manual review", "Our team will advise on lease terms"],
      matchingInsight: "Our land network is still ready to match your temporary lease request.",
    });
  }
});

app.post("/api/leads", async (req, res) => {
  const leadData = req.body;
  console.log("Incoming lead:", req.body);

  if (!leadData?.fullName || !leadData?.email || !leadData?.phone || !leadData?.landType || !leadData?.intendedUse) {
    return res.status(400).json({ error: "Missing required contact or land requirements fields." });
  }

  try {
    const { data, error } = await supabase
      .from("leads")
      .insert({
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

    const aiAssessment: any = {};
    const adminMetaPayload = {
      contactStatus: "new",
      status: "new",
      internalNotes: "",
    };

    try {
      Object.assign(aiAssessment, await generateAiAssessment(leadData));
    } catch (assessmentError) {
      console.warn("AI assessment skipped, continuing with lead submission:", assessmentError);
    }

    try {
      await supabase
  .from("leads")
  .update({
    ai_assessment: aiAssessment,
    contact_status: "new",
    status: "new",
    internal_notes: "",
  })
  .eq("id", data.id);
    } catch (metaError) {
      console.warn("Admin metadata storage skipped:", metaError);
    }

    return res.status(201).json({
      success: true,
      message: "Lead requirements submitted successfully! Our agents will contact you within 2 hours.",
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

app.get("/api/admin/leads", requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
  .from("leads")
  .select("*")
  .order("created_at", { ascending: false });

if (error) throw error;

const leads = (data || []).map(normalizeLeadRecord);

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

    const mergedRow = { ...(data || {}), ...updates };
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
      internalNotes: updates.internalNotes ?? currentAdminMeta.internalNotes,
    };

    try {
      const currentAiAssessment = mergedRow.ai_assessment ?? mergedRow.aiAssessment;
      let nextAiAssessment: any = {};

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
