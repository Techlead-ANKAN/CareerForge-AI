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
import { getApiKey, generateWithRetry } from "@/lib/ai/gemini";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/PageHeader";

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

  const currentLevel = enhancementLevels.find((l) => l.id === selectedLevel)!;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="max-w-[1440px] mx-auto">
      <PageHeader
        icon={Sparkles}
        title="AI Resume Enhancer"
        subtitle="Multi-level AI improvements for your resume"
        gradient="from-amber-500 to-orange-600"
      />

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-xl px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Enhancement Level Ribbon */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-surface-1 border border-glass-border mb-6 overflow-x-auto">
        {enhancementLevels.map((level) => (
          <button
            key={level.id}
            onClick={() => setSelectedLevel(level.id)}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 whitespace-nowrap flex-1 min-w-0 ${
              selectedLevel === level.id
                ? "bg-primary/10 border border-primary/30 shadow-[0_0_20px_rgba(139,92,246,0.12)]"
                : "border border-transparent hover:bg-surface-2"
            }`}
          >
            <div className={`h-9 w-9 rounded-lg bg-linear-to-br ${level.color} flex items-center justify-center shrink-0 ${
              selectedLevel === level.id ? "shadow-lg" : ""
            }`}>
              <level.icon className="h-4 w-4 text-white" />
            </div>
            <div className="text-left min-w-0">
              <div className={`text-xs font-semibold truncate ${selectedLevel === level.id ? "text-foreground" : "text-muted-foreground"}`}>
                {level.label}
              </div>
              <div className="text-[10px] text-muted-foreground/60 truncate hidden sm:block">{level.description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Main Content: 3-column layout */}
      <div className="flex gap-6">
        {/* Left: Input Panel */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Active level description banner */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-glass-border bg-glass-bg">
            <div className={`h-8 w-8 rounded-lg bg-linear-to-br ${currentLevel.color} flex items-center justify-center shrink-0`}>
              <currentLevel.icon className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold">{currentLevel.label}</div>
              <div className="text-[10px] text-muted-foreground">{currentLevel.description}</div>
            </div>
          </div>

          {selectedLevel === "targeted" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Target Role</label>
              <Input
                placeholder="e.g., Senior Software Engineer at Google"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>
          )}

          <Card className="flex flex-col flex-1">
            <CardContent className="p-5 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="bg-linear-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Paste Your Resume</span>
                </h2>
                {resumeText && (
                  <span className="text-[10px] text-muted-foreground bg-surface-2 px-2 py-1 rounded-lg">
                    {resumeText.split(/\s+/).filter(Boolean).length} words
                  </span>
                )}
              </div>
              <Textarea
                className="flex-1 resize-none min-h-[400px]"
                placeholder={"Paste your entire resume text here...\n\nInclude all sections: summary, experience, education, skills, projects, etc."}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Sticky enhance bar */}
          <div className="sticky bottom-4 z-20">
            <div className="p-3 rounded-2xl border border-glass-border bg-sticky-bg backdrop-blur-xl shadow-[0_-8px_30px_var(--shadow-heavy)]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className={`h-8 w-8 rounded-lg bg-linear-to-br ${currentLevel.color} flex items-center justify-center shrink-0`}>
                    <currentLevel.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">{currentLevel.label}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{resumeText ? `${resumeText.split(/\s+/).filter(Boolean).length} words ready` : "Paste resume to begin"}</div>
                  </div>
                </div>
                <Button
                  onClick={enhance}
                  disabled={loading}
                  variant="glow"
                  className="gap-2 px-6 py-5 text-sm bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shrink-0"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Enhancing...</>
                  ) : (
                    <><Sparkles className="h-4 w-4" /> Enhance <ArrowRight className="h-3.5 w-3.5" /></>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Output Section — Full Width Below Form */}
      {enhancedText ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-amber-500/40 to-transparent" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-lg bg-linear-to-br ${currentLevel.color} flex items-center justify-center`}>
                    <currentLevel.icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Enhanced Result</h3>
                    <p className="text-[11px] text-muted-foreground">{currentLevel.label} enhancement applied</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyResult} className="gap-1.5 text-xs">
                    {copied ? <CheckCircle className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button size="sm" onClick={downloadResult} className="gap-1.5 text-xs">
                    <Download className="h-3.5 w-3.5" /> Download
                  </Button>
                </div>
              </div>
              <div className="markdown-content text-sm max-h-[500px] overflow-y-auto bg-code-bg border border-glass-border rounded-lg p-5">
                <ReactMarkdown>{enhancedText}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : null}
    </motion.div>
  );
}
