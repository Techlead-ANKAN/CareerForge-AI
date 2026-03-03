"use client";

import Link from "next/link";
import {
  FileText,
  Sparkles,
  ScanSearch,
  Mail,
  Mic,
  ArrowRight,
  Zap,
  Brain,
  Target,
  Shield,
} from "lucide-react";

const features = [
  {
    href: "/resume-builder",
    icon: FileText,
    title: "Resume Builder",
    description: "Generate professional LaTeX resumes tailored to your target role. AI crafts ATS-optimized content and exports to PDF.",
    color: "from-indigo-500 to-purple-600",
    tag: "Most Popular",
  },
  {
    href: "/ai-enhance",
    icon: Sparkles,
    title: "AI Enhance",
    description: "Multi-level AI improvements: from basic grammar fixes to complete professional rewrites of your resume.",
    color: "from-amber-500 to-orange-600",
    tag: "Smart",
  },
  {
    href: "/ats-checker",
    icon: ScanSearch,
    title: "ATS Checker",
    description: "Score your resume against job descriptions. Get keyword analysis, formatting checks, and actionable suggestions.",
    color: "from-emerald-500 to-teal-600",
    tag: "Essential",
  },
  {
    href: "/cv-generator",
    icon: Mail,
    title: "CV / Cover Letter",
    description: "Generate tailored cover letters and academic CVs that complement your resume for any application.",
    color: "from-cyan-500 to-blue-600",
    tag: "Complete",
  },
  {
    href: "/interview-prep",
    icon: Mic,
    title: "Interview Prep",
    description: "Live AI-powered interview simulation with voice interaction. Practice technical and behavioral questions.",
    color: "from-rose-500 to-pink-600",
    tag: "Live AI",
  },
];

const stats = [
  { icon: Brain, label: "Gemini 2.0 Flash", desc: "Latest AI Model" },
  { icon: Target, label: "ATS Optimized", desc: "Beat the bots" },
  { icon: Shield, label: "LaTeX Quality", desc: "Professional output" },
  { icon: Zap, label: "Real-time", desc: "Instant results" },
];

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="text-center mb-16 pt-8">
        <div className="inline-flex items-center gap-2 bg-primary-light border border-primary/30 rounded-full px-4 py-2 mb-6">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary font-medium">Powered by Gemini 2.0 Flash</span>
        </div>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
          CareerForge AI
        </h1>
        <p className="text-xl text-muted max-w-2xl mx-auto mb-8">
          Your complete AI-powered career toolkit. Build stunning resumes, ace interviews,
          and land your dream job — all in one place.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/resume-builder"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-medium transition-all"
          >
            Start Building <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 bg-card border border-border hover:border-primary/50 text-foreground px-6 py-3 rounded-xl font-medium transition-all"
          >
            Configure API Key
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-16">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <s.icon className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-sm font-semibold text-foreground">{s.label}</div>
            <div className="text-xs text-muted">{s.desc}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {features.map((f, i) => (
          <Link
            key={f.href}
            href={f.href}
            className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-lg`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs bg-primary-light text-primary px-2 py-1 rounded-full font-medium">
                {f.tag}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
              {f.title}
            </h3>
            <p className="text-sm text-muted leading-relaxed">{f.description}</p>
            <div className="mt-4 flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 text-center mb-8">
        <h2 className="text-2xl font-bold mb-3">Getting Started</h2>
        <p className="text-muted mb-6 max-w-lg mx-auto">
          Configure your Gemini API key in Settings, then start building your career materials with AI assistance.
        </p>
        <div className="flex gap-6 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">1</div>
            <span className="text-muted">Add API Key</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">2</div>
            <span className="text-muted">Enter Details</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">3</div>
            <span className="text-muted">Generate & Download</span>
          </div>
        </div>
      </div>
    </div>
  );
}
