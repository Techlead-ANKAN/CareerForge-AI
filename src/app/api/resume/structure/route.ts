import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSessionFromRequest } from "@/lib/auth/session";

export interface ResumeSection {
  title: string;
  bullets: string[];
}

export interface StructuredResume {
  name: string;
  contact: string;
  sections: ResumeSection[];
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { resumeText } = (await request.json()) as { resumeText?: string };
  if (!resumeText || resumeText.trim().length < 20) {
    return NextResponse.json({ error: "resumeText required" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI not configured" }, { status: 500 });
  }

  const prompt = `You are a professional resume parser. Parse the resume below into clean structured JSON.

RESUME TEXT:
${resumeText.slice(0, 4000)}

Return ONLY a valid JSON object — no markdown, no code fences, no explanation:
{
  "name": "Full name of candidate",
  "contact": "email | phone | location | linkedin | github (only what is present, separated by  |  )",
  "sections": [
    {
      "title": "SECTION TITLE IN UPPERCASE",
      "bullets": ["concise bullet 1", "concise bullet 2"]
    }
  ]
}

Rules:
- Use these standard section titles where applicable: SUMMARY, EDUCATION, EXPERIENCE, PROJECTS, TECHNICAL SKILLS, SOFT SKILLS, CERTIFICATIONS, ACHIEVEMENTS, LANGUAGES
- Each bullet must be a clean, readable sentence (max 120 characters)
- Flatten all sub-items into flat bullets
- Include only sections with real content
- Return valid JSON only`;

  const models = ["gemini-pro", "gemini-1.5-flash", "gemini-1.5-pro"];

  for (const modelName of models) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
      });

      const result = await model.generateContent(prompt);
      let raw = result.response.text().trim();

      // Strip markdown code fences if Gemini wraps the response
      raw = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

      const parsed: StructuredResume = JSON.parse(raw);
      console.log(`[Resume Structure] Parsed with ${modelName}`);
      return NextResponse.json(parsed);
    } catch (err) {
      console.error(`[Resume Structure] ${modelName} failed:`, err);
    }
  }

  return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 });
}
