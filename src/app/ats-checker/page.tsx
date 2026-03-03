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
import { getApiKey, generateWithRetry } from "@/lib/gemini";
import ReactMarkdown from "react-markdown";

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
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <ScanSearch className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">ATS Checker</h1>
          <p className="text-sm text-muted">Analyze your resume for ATS compatibility</p>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-primary" />
              <label className="text-sm font-semibold">Your Resume</label>
            </div>
            <textarea
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none h-48"
              placeholder="Paste your complete resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-primary" />
              <label className="text-sm font-semibold">Job Description (Optional)</label>
            </div>
            <textarea
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none h-36"
              placeholder="Paste the target job description for keyword matching analysis..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <button
            onClick={checkATS}
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <ScanSearch className="w-5 h-5" /> Check ATS Score
              </>
            )}
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {result ? (
            <>
              {/* Overall Score */}
              <div className="bg-card border border-border rounded-2xl p-6 text-center">
                <h3 className="text-sm font-semibold text-muted mb-4">Overall ATS Score</h3>
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#222" strokeWidth="10" />
                    <circle
                      cx="60" cy="60" r="50" fill="none"
                      stroke={result.overallScore >= 80 ? "#10b981" : result.overallScore >= 60 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="10"
                      strokeDasharray={`${result.overallScore * 3.14} 314`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-bold ${getScoreColor(result.overallScore)}`}>
                      {result.overallScore}
                    </span>
                    <span className="text-xs text-muted">/100</span>
                  </div>
                </div>
                <p className={`text-sm font-medium ${getScoreColor(result.overallScore)}`}>
                  {result.overallScore >= 80 ? "Excellent" : result.overallScore >= 60 ? "Good - Needs Work" : "Needs Improvement"}
                </p>
              </div>

              {/* Section Scores */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-primary" />
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
                      <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getScoreBg(section.score)}`}
                          style={{ width: `${section.score}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted">{section.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="text-sm font-semibold mb-3">Keyword Analysis</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-medium text-success mb-2">Found Keywords</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {result.keywordAnalysis.found.map((kw) => (
                        <span key={kw} className="bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded-full text-xs">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-danger mb-2">Missing Keywords</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {result.keywordAnalysis.missing.map((kw) => (
                        <span key={kw} className="bg-danger/10 text-danger border border-danger/20 px-2 py-0.5 rounded-full text-xs">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Feedback */}
              {rawFeedback && (
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="text-sm font-semibold mb-3">Detailed Feedback</h3>
                  <div className="markdown-content text-sm max-h-64 overflow-y-auto">
                    <ReactMarkdown>{rawFeedback}</ReactMarkdown>
                  </div>
                </div>
              )}
            </>
          ) : rawFeedback ? (
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="text-sm font-semibold mb-3">ATS Analysis</h3>
              <div className="markdown-content text-sm max-h-[600px] overflow-y-auto">
                <ReactMarkdown>{rawFeedback}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-center h-64">
              <div className="text-center text-muted text-sm">
                <ScanSearch className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>ATS analysis results will appear here</p>
                <p className="text-xs mt-1 opacity-60">Paste resume and click Check</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
