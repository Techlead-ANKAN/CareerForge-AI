"use client";

import { useState } from "react";
import {
  ScanSearch,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
  FileText,
  Target,
} from "lucide-react";
import { getApiKey, generateWithRetry } from "@/lib/ai/gemini";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";

interface ATSResult {
  overallScore: number;
  sections: {
    name: string;
    score: number;
    status: "good" | "warning" | "critical";
    feedback: string;
  }[];
  keywordAnalysis: {
    found: string[];
    missing: string[];
  };
  detailedFeedback: string;
}

export default function ATSCheckerPage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<ATSResult | null>(null);
  const [rawFeedback, setRawFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkATS = async () => {
    const key = getApiKey();
    if (!key) {
      setError("Please configure your Gemini API key in Settings first.");
      return;
    }
    if (!resumeText.trim()) {
      setError("Please paste your resume text.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setRawFeedback("");

    try {

      const prompt = `You are an expert ATS (Applicant Tracking System) analyzer. Analyze this resume for ATS compatibility and provide a detailed assessment.

RESUME:
${resumeText}

${jobDescription ? `JOB DESCRIPTION:\n${jobDescription}` : "No specific job description provided - do a general ATS assessment."}

Respond in EXACTLY this JSON format (no markdown, no code blocks, just pure JSON):
{
  "overallScore": <number 0-100>,
  "sections": [
    {
      "name": "Formatting & Structure",
      "score": <number 0-100>,
      "status": "<good|warning|critical>",
      "feedback": "<specific feedback>"
    },
    {
      "name": "Keyword Optimization",
      "score": <number 0-100>,
      "status": "<good|warning|critical>",
      "feedback": "<specific feedback>"
    },
    {
      "name": "Content Quality",
      "score": <number 0-100>,
      "status": "<good|warning|critical>",
      "feedback": "<specific feedback>"
    },
    {
      "name": "Action Verbs & Impact",
      "score": <number 0-100>,
      "status": "<good|warning|critical>",
      "feedback": "<specific feedback>"
    },
    {
      "name": "Section Completeness",
      "score": <number 0-100>,
      "status": "<good|warning|critical>",
      "feedback": "<specific feedback>"
    },
    {
      "name": "ATS Parseability",
      "score": <number 0-100>,
      "status": "<good|warning|critical>",
      "feedback": "<specific feedback>"
    }
  ],
  "keywordAnalysis": {
    "found": ["keyword1", "keyword2"],
    "missing": ["keyword3", "keyword4"]
  },
  "detailedFeedback": "<comprehensive markdown feedback with specific suggestions for improvement, at least 200 words>"
}

Score guidelines:
- 90-100: Excellent ATS compatibility
- 70-89: Good, minor improvements needed
- 50-69: Fair, significant improvements recommended
- Below 50: Needs major overhaul

Be thorough and specific in your analysis.`;

      let text = (await generateWithRetry(prompt)).trim();

      // Clean up response
      text = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

      try {
        const parsed = JSON.parse(text) as ATSResult;
        setResult(parsed);
        setRawFeedback(parsed.detailedFeedback);
      } catch {
        // If JSON parsing fails, show raw text
        setRawFeedback(text);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "ATS check failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-accent";
    return "text-danger";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-accent";
    return "bg-danger";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good": return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-accent" />;
      case "critical": return <XCircle className="w-4 h-4 text-danger" />;
      default: return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="max-w-[1440px] mx-auto">
      <PageHeader
        icon={ScanSearch}
        title="ATS Checker"
        subtitle="Analyze your resume for ATS compatibility"
        gradient="from-emerald-500 to-teal-600"
      />

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-xl px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-6">
        {/* Left: Input Section */}
        <div className="flex-1 min-w-0 space-y-4">
          <Card>
            <CardContent className="p-6 space-y-5">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2.5">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="bg-linear-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Your Resume</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Paste your complete resume text for analysis</p>
              </div>
              <Textarea
                className="min-h-[200px] resize-none"
                placeholder="Paste your complete resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-5">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2.5">
                  <Target className="h-5 w-5 text-primary" />
                  <span className="bg-linear-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Job Description</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Optional — add a JD for keyword matching analysis</p>
              </div>
              <Textarea
                className="min-h-[140px] resize-none"
                placeholder="Paste the target job description for keyword matching analysis..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Sticky analyze bar */}
          <div className="sticky bottom-4 z-20">
            <div className="p-3 rounded-2xl border border-glass-border bg-sticky-bg backdrop-blur-xl shadow-[0_-8px_30px_var(--shadow-heavy)]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                    <ScanSearch className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">ATS Analysis</div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {resumeText ? `${resumeText.split(/\s+/).filter(Boolean).length} words` : "Paste resume to begin"}{jobDescription ? " + JD" : ""}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={checkATS}
                  disabled={loading}
                  variant="glow"
                  className="gap-2 px-6 py-5 text-sm bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shrink-0"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
                  ) : (
                    <><ScanSearch className="h-4 w-4" /> Check Score</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Results Panel (sticky on desktop) */}
        <div className="hidden lg:block w-[480px] shrink-0">
          <div className="sticky top-24 space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1 scrollbar-thin">
            {result ? (
              <>
                {/* Overall Score */}
                <Card className="text-center relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-emerald-500/40 to-transparent" />
                  <CardContent className="p-6">
                    <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Overall ATS Score</h3>
                    <div className="relative w-36 h-36 mx-auto mb-4">
                      <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(16,185,129,0.25)]" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="var(--surface-4)" strokeWidth="8" />
                        <circle
                          cx="60" cy="60" r="50" fill="none"
                          stroke={result.overallScore >= 80 ? "#10b981" : result.overallScore >= 60 ? "#f59e0b" : "#ef4444"}
                          strokeWidth="8"
                          strokeDasharray={`${result.overallScore * 3.14} 314`}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-bold ${getScoreColor(result.overallScore)}`}>
                          {result.overallScore}
                        </span>
                        <span className="text-xs text-muted-foreground">/100</span>
                      </div>
                    </div>
                    <p className={`text-sm font-medium ${getScoreColor(result.overallScore)}`}>
                      {result.overallScore >= 80 ? "Excellent" : result.overallScore >= 60 ? "Good - Needs Work" : "Needs Improvement"}
                    </p>
                  </CardContent>
                </Card>

                {/* Section Scores */}
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold">Section Analysis</h3>
                    </div>
                    <div className="space-y-3">
                      {result.sections.map((section) => (
                        <div key={section.name} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(section.status)}
                              <span className="text-xs font-medium">{section.name}</span>
                            </div>
                            <span className={`text-xs font-bold ${getScoreColor(section.score)}`}>
                              {section.score}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-surface-4 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${getScoreBg(section.score)}`}
                              style={{ width: `${section.score}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">{section.feedback}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Keywords */}
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-sm font-semibold mb-3">Keyword Analysis</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-medium text-success mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3" /> Found Keywords
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {result.keywordAnalysis.found.map((kw) => (
                            <Badge key={kw} variant="success" className="text-xs">{kw}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-destructive mb-2 flex items-center gap-1.5">
                          <XCircle className="h-3 w-3" /> Missing Keywords
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {result.keywordAnalysis.missing.map((kw) => (
                            <Badge key={kw} variant="destructive" className="text-xs">{kw}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Feedback */}
                {rawFeedback && (
                  <Card>
                    <CardContent className="p-5">
                      <h3 className="text-sm font-semibold mb-3">Detailed Feedback</h3>
                      <div className="markdown-content text-sm max-h-64 overflow-y-auto">
                        <ReactMarkdown>{rawFeedback}</ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : rawFeedback ? (
              <Card>
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold mb-3">ATS Analysis</h3>
                  <div className="markdown-content text-sm max-h-[600px] overflow-y-auto">
                    <ReactMarkdown>{rawFeedback}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-[400px] relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-emerald-500/40 to-transparent" />
                <CardContent className="p-5 h-full flex items-center justify-center">
                  <div className="text-center text-muted-foreground text-sm">
                    <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-surface-2 border border-glass-border flex items-center justify-center">
                      <ScanSearch className="h-8 w-8 opacity-20" />
                    </div>
                    <p className="font-medium text-foreground/50">Ready to analyze</p>
                    <p className="text-xs mt-1.5 opacity-50 max-w-[200px] mx-auto leading-relaxed">
                      Paste your resume and click Check Score
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Mobile results (below form) */}
      <div className="lg:hidden mt-6 space-y-4">
        {result && (
          <>
            <Card className="text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-emerald-500/40 to-transparent" />
              <CardContent className="p-6">
                <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Overall ATS Score</h3>
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="var(--surface-5)" strokeWidth="8" />
                    <circle cx="60" cy="60" r="50" fill="none"
                      stroke={result.overallScore >= 80 ? "#10b981" : result.overallScore >= 60 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="8" strokeDasharray={`${result.overallScore * 3.14} 314`} strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-bold ${getScoreColor(result.overallScore)}`}>{result.overallScore}</span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold mb-3">Section Analysis</h3>
                <div className="space-y-3">
                  {result.sections.map((section) => (
                    <div key={section.name} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(section.status)}
                          <span className="text-xs font-medium">{section.name}</span>
                        </div>
                        <span className={`text-xs font-bold ${getScoreColor(section.score)}`}>{section.score}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-4 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${getScoreBg(section.score)}`} style={{ width: `${section.score}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground">{section.feedback}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold mb-3">Keywords</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-medium text-success mb-2">Found</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {result.keywordAnalysis.found.map((kw) => <Badge key={kw} variant="success" className="text-xs">{kw}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-destructive mb-2">Missing</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {result.keywordAnalysis.missing.map((kw) => <Badge key={kw} variant="destructive" className="text-xs">{kw}</Badge>)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </motion.div>
  );
}
