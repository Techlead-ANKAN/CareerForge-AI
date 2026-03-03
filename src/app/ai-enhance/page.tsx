"use client";

import { useState } from "react";
import {
  Sparkles,
  Loader2,
  ArrowRight,
  Zap,
  Target,
  Rocket,
  Crown,
  Copy,
  CheckCircle,
  Download,
} from "lucide-react";
import { getApiKey, generateWithRetry } from "@/lib/gemini";
import ReactMarkdown from "react-markdown";

const enhancementLevels = [
  {
    id: "basic",
    label: "Basic Polish",
    icon: Zap,
    color: "from-blue-500 to-cyan-500",
    description: "Grammar, spelling, and formatting fixes. Clean up language.",
    prompt: `You are an expert resume editor. Polish this resume with BASIC improvements:
- Fix all grammar, spelling, and punctuation errors
- Improve sentence structure and clarity
- Ensure consistent formatting and tense usage
- Fix any awkward phrasing

Keep the same content and structure. Output the improved resume text.`,
  },
  {
    id: "intermediate",
    label: "Professional Upgrade",
    icon: Target,
    color: "from-amber-500 to-orange-500",
    description: "Rewrite with stronger action verbs, quantified achievements, and better keywords.",
    prompt: `You are a professional resume writer. Enhance this resume at an INTERMEDIATE level:
- Replace weak verbs with powerful action verbs (Led, Architected, Spearheaded, etc.)
- Add quantified achievements where possible (percentages, numbers, metrics)
- Optimize for ATS with industry-standard keywords
- Improve bullet point structure using the STAR method
- Make each point impactful and specific
- Ensure professional tone throughout

Maintain the person's actual experience but present it more compellingly. Output the improved resume text.`,
  },
  {
    id: "advanced",
    label: "Executive Rewrite",
    icon: Rocket,
    color: "from-purple-500 to-pink-500",
    description: "Complete professional rewrite with strategic positioning and executive-level language.",
    prompt: `You are an elite executive resume strategist. Perform an ADVANCED rewrite of this resume:
- Completely restructure for maximum impact
- Use executive-level language and strategic positioning
- Create a compelling professional narrative
- Add a powerful professional summary/branding statement
- Transform bullet points into achievement stories with measurable outcomes
- Optimize keyword density for ATS systems
- Ensure every bullet demonstrates value and business impact
- Group skills strategically
- Make the person sound like a top-tier candidate

This should read like a resume that would get callbacks from top companies. Output the improved resume text.`,
  },
  {
    id: "targeted",
    label: "Role-Targeted",
    icon: Crown,
    color: "from-emerald-500 to-teal-500",
    description: "Tailor resume specifically for a target role, matching job requirements precisely.",
    prompt: `You are an expert career strategist. Perform a TARGETED enhancement of this resume for the specified role:
- Reorder and prioritize content that's most relevant to the target role
- Mirror the language and keywords from the job requirements
- Highlight transferable skills that match the role
- Adjust the professional summary to target this specific position
- Emphasize relevant achievements and downplay less relevant ones
- Add industry-specific terminology
- Make it clear why this person is a perfect fit for this role

Output the enhanced resume text optimized for the target role.`,
  },
];

export default function AIEnhancePage() {
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("basic");
  const [enhancedText, setEnhancedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const enhance = async () => {
    const key = getApiKey();
    if (!key) {
      setError("Please configure your Gemini API key in Settings first.");
      return;
    }
    if (!resumeText.trim()) {
      setError("Please paste your resume text first.");
      return;
    }

    setLoading(true);
    setError("");
    setEnhancedText("");

    try {
      const level = enhancementLevels.find((l) => l.id === selectedLevel)!;
      const prompt = `${level.prompt}

${selectedLevel === "targeted" && targetRole ? `TARGET ROLE: ${targetRole}\n` : ""}

RESUME TO ENHANCE:
${resumeText}

Provide the enhanced resume. Also include a brief "Changes Made" section at the end listing key improvements.`;

      const text = await generateWithRetry(prompt);
      setEnhancedText(text);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Enhancement failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(enhancedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadResult = () => {
    const blob = new Blob([enhancedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "enhanced_resume.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Resume Enhancer</h1>
          <p className="text-sm text-muted">Multi-level AI improvements for your resume</p>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Enhancement Level Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {enhancementLevels.map((level) => (
          <button
            key={level.id}
            onClick={() => setSelectedLevel(level.id)}
            className={`text-left p-4 rounded-xl border transition-all ${
              selectedLevel === level.id
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                : "border-border bg-card hover:border-primary/30"
            }`}
          >
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${level.color} flex items-center justify-center mb-3`}>
              <level.icon className="w-4.5 h-4.5 text-white" />
            </div>
            <h3 className="text-sm font-semibold mb-1">{level.label}</h3>
            <p className="text-xs text-muted leading-relaxed">{level.description}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          {selectedLevel === "targeted" && (
            <div className="bg-card border border-border rounded-xl p-4">
              <label className="text-sm font-semibold mb-2 block">Target Role</label>
              <input
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                placeholder="e.g., Senior Software Engineer at Google"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>
          )}

          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col h-[500px]">
            <label className="text-sm font-semibold mb-3">Paste Your Resume</label>
            <textarea
              className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none"
              placeholder="Paste your entire resume text here...&#10;&#10;Include all sections: summary, experience, education, skills, projects, etc."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </div>

          <button
            onClick={enhance}
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Enhancing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Enhance Resume
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Output */}
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col h-[600px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Enhanced Result</h3>
            {enhancedText && (
              <div className="flex gap-2">
                <button
                  onClick={copyResult}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-lg text-xs hover:border-primary/50"
                >
                  {copied ? <CheckCircle className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={downloadResult}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs hover:bg-primary-hover"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            )}
          </div>
          {enhancedText ? (
            <div className="flex-1 overflow-y-auto markdown-content text-sm">
              <ReactMarkdown>{enhancedText}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted text-sm">
              <div className="text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Enhanced resume will appear here</p>
                <p className="text-xs mt-1 opacity-60">Select a level and click Enhance</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
