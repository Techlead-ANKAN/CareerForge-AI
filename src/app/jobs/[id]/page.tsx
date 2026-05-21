"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Clock,
  Users,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Medal,
  FileText,
  ChevronRight,
  Star,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/shared/AuthProvider";
import {
  isSupportedResumeFile,
  getSupportedResumeFileType,
  extractTextFromPdf,
} from "@/lib/resume/textExtraction";

interface JobDetail {
  _id: string;
  title: string;
  description: string;
  requirements: string;
  employer: string;
  employerId: string;
  applicationCount: number;
  hasApplied: boolean;
  createdAt: string;
}

interface ApplicantRow {
  rank: number;
  applicationId: string;
  candidate: string;
  email: string;
  resumeFilename: string;
  resumeText: string;
  resumeFile: string;
  resumeMimeType: string;
  score: number;
  appliedAt: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function ResumeViewer({ app, onClose }: { app: ApplicantRow; onClose: () => void }) {
  const [structured, setStructured] = useState<{
    name: string;
    contact: string;
    sections: Array<{ title: string; bullets: string[] }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [parseError, setParseError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setParseError(false);
    setStructured(null);
    fetch("/api/resume/structure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText: app.resumeText }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setStructured(data))
      .catch(() => setParseError(true))
      .finally(() => setLoading(false));
  }, [app.applicationId]);

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      {/* overlay */}
      <div className="flex-1 bg-black/60 backdrop-blur-sm" />

      {/* panel */}
      <div
        className="w-full max-w-[480px] h-full flex flex-col border-l border-white/10 bg-[#0d0f14] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4 shrink-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 text-sm font-bold text-white select-none">
            {app.candidate.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-white">{app.candidate}</p>
              <ScoreBadge score={app.score} />
              {app.rank <= 3 && (
                <Medal className={`h-4 w-4 ${app.rank === 1 ? "text-yellow-400" : app.rank === 2 ? "text-slate-300" : "text-amber-600"}`} />
              )}
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {app.email} · {app.resumeFilename}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* body */}
        <div className="overflow-y-auto flex-1 px-5 py-5">
          {loading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-5 w-1/2 rounded bg-white/10" />
              <div className="h-3 w-3/4 rounded bg-white/10" />
              <div className="h-px w-full rounded bg-white/10 mt-5" />
              {["w-1/2", "w-3/4", "w-full", "w-2/3", "w-5/6"].map((w, i) => (
                <div key={i} className={`h-3 rounded bg-white/10 ${w}`} />
              ))}
            </div>
          )}

          {!loading && parseError && (
            <pre className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
              {app.resumeText || "No content available."}
            </pre>
          )}

          {!loading && structured && (
            <div>
              {/* Name + contact */}
              {structured.name && (
                <h2 className="text-xl font-bold text-white mb-1">{structured.name}</h2>
              )}
              {structured.contact && (
                <p className="text-xs text-slate-400 mb-5 leading-relaxed">{structured.contact}</p>
              )}

              {/* Sections */}
              <div className="space-y-6">
                {structured.sections.map((section, si) => (
                  <div key={si}>
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-violet-400">
                        {section.title}
                      </h3>
                      <div className="flex-1 h-px bg-violet-500/20" />
                    </div>
                    <ul className="space-y-2">
                      {section.bullets.map((bullet, bi) => (
                        <li key={bi} className="flex items-start gap-2.5">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-violet-500/70 shrink-0" />
                          <span className="text-sm text-slate-300 leading-relaxed">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


function ScoreBadge({ score }: { score: number }) {
  let color = "text-red-400 bg-red-400/10 border-red-400/20";
  if (score >= 75) color = "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  else if (score >= 50) color = "text-amber-400 bg-amber-400/10 border-amber-400/20";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-sm font-semibold ${color}`}>
      <Star className="h-3 w-3" />
      {score}
    </span>
  );
}

async function extractText(file: File): Promise<string> {
  const type = getSupportedResumeFileType(file);
  if (type === "pdf") return extractTextFromPdf(file);
  if (type === "docx") {
    const mammoth = await import("mammoth/mammoth.browser");
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }
  if (type === "text") return file.text();
  return "";
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [job, setJob] = useState<JobDetail | null>(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [jobError, setJobError] = useState("");

  // Candidate: apply state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");

  // Employer: applications state
  const [applications, setApplications] = useState<ApplicantRow[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState("");
  const [viewerApp, setViewerApp] = useState<ApplicantRow | null>(null);

  const isOwner = user?.role === "employer" && job?.employerId === user?.id;

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`/api/jobs/${id}`);
        if (!res.ok) {
          const d = await res.json();
          setJobError(d.error || "Failed to load job.");
          return;
        }
        const data = await res.json();
        setJob(data.job);
      } catch {
        setJobError("Failed to load job.");
      } finally {
        setJobLoading(false);
      }
    }
    fetchJob();
  }, [id]);

  useEffect(() => {
    if (!isOwner) return;
    async function fetchApps() {
      setAppsLoading(true);
      try {
        const res = await fetch(`/api/jobs/${id}/applications`);
        if (!res.ok) throw new Error("Failed to load applications.");
        const data = await res.json();
        setApplications(data.applications);
      } catch {
        setAppsError("Failed to load applications.");
      } finally {
        setAppsLoading(false);
      }
    }
    fetchApps();
  }, [id, isOwner]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isSupportedResumeFile(file)) {
      setFileError("Unsupported file type. Please upload a PDF, DOCX, or TXT file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setFileError("File size must be under 8 MB.");
      return;
    }
    setSelectedFile(file);
  }

  async function handleApply() {
    if (!selectedFile) return;
    setSubmitError("");
    setSubmitting(true);

    try {
      const [resumeText, resumeFileBase64] = await Promise.all([
        extractText(selectedFile),
        readFileAsBase64(selectedFile),
      ]);
      if (!resumeText || resumeText.trim().length < 50) {
        setSubmitError("Could not extract enough text from your resume. Please try a different file.");
        return;
      }

      const res = await fetch(`/api/jobs/${id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          resumeFilename: selectedFile.name,
          resumeFileBase64,
          resumeMimeType: selectedFile.type,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || "Application failed.");
        return;
      }

      setSubmitSuccess(data.message);
      setJob((prev) => prev ? { ...prev, hasApplied: true, applicationCount: prev.applicationCount + 1 } : prev);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (jobLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-2/3 rounded-lg bg-surface-3" />
          <div className="h-4 w-1/3 rounded-lg bg-surface-3" />
          <div className="h-48 rounded-xl bg-surface-3" />
        </div>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 text-center">
        <AlertCircle className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
        <p className="text-muted-foreground">{jobError || "Job not found."}</p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href="/jobs">Back to Jobs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      {/* Breadcrumb */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </button>

      {/* Job header card */}
      <div className="rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-md p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
            <Briefcase className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {job.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Posted by <span className="text-foreground font-medium">{job.employer}</span>
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {job.applicationCount} applicant{job.applicationCount !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {timeAgo(job.createdAt)}
              </span>
              {isOwner && (
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-400">
                  Your posting
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-foreground mb-2">Description</h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {job.description}
          </p>
        </div>

        {/* Requirements */}
        <div className="mt-5 rounded-xl border border-glass-border bg-surface-2 p-4">
          <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-primary" />
            Requirements
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {job.requirements}
          </p>
        </div>
      </div>

      {/* Candidate: Apply section */}
      {user?.role === "candidate" && !isOwner && (
        <div className="rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-md p-6">
          <h2 className="text-lg font-semibold text-foreground mb-1">Apply for this Role</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Upload your resume. Our AI will score your fit in the background.
          </p>

          {submitSuccess ? (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-400">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Application submitted!</p>
                <p className="text-emerald-400/70 text-xs mt-0.5">{submitSuccess}</p>
              </div>
            </div>
          ) : job.hasApplied ? (
            <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-4 text-sm text-primary">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <p>You have already applied to this job.</p>
            </div>
          ) : (
            <>
              {submitError && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {submitError}
                </div>
              )}

              {/* File picker */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.text,.md"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-xl border-2 border-dashed border-glass-border bg-surface-2 px-6 py-8 text-center transition-all hover:border-primary/40 hover:bg-surface-3"
              >
                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 text-primary" />
                    <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB — click to change
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm font-medium text-foreground">
                      Click to upload your resume
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOCX, or TXT — max 8 MB
                    </p>
                  </div>
                )}
              </div>

              {fileError && (
                <p className="mt-2 text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {fileError}
                </p>
              )}

              <Button
                onClick={handleApply}
                disabled={!selectedFile || submitting}
                variant="glow"
                size="lg"
                className="mt-4 w-full"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                    Submitting & scoring...
                  </span>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </>
          )}
        </div>
      )}

      {/* Employer: Applications list */}
      {isOwner && (
        <div className="rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-md p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Applications
              </h2>
              <p className="text-sm text-muted-foreground">
                Ranked by ATS resume match score — highest first
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {job.applicationCount} total
            </span>
          </div>

          {appsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-surface-2 animate-pulse" />
              ))}
            </div>
          ) : appsError ? (
            <p className="text-sm text-destructive">{appsError}</p>
          ) : applications.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No applications yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.applicationId}
                  className="flex items-center gap-4 rounded-xl border border-glass-border bg-surface-2 px-4 py-3 transition-colors hover:bg-surface-3"
                >
                  {/* Rank medal */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center">
                    {app.rank <= 3 ? (
                      <Medal
                        className={`h-5 w-5 ${
                          app.rank === 1
                            ? "text-yellow-400"
                            : app.rank === 2
                            ? "text-slate-400"
                            : "text-amber-600"
                        }`}
                      />
                    ) : (
                      <span className="text-sm font-semibold text-muted-foreground">
                        #{app.rank}
                      </span>
                    )}
                  </div>

                  {/* Candidate info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {app.candidate}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {app.email} · {app.resumeFilename} · {timeAgo(app.appliedAt)}
                    </p>
                  </div>

                  {/* Score + View Resume */}
                  <div className="flex items-center gap-2 shrink-0">
                    <ScoreBadge score={app.score} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewerApp(app)}
                      className="h-7 px-2 text-xs"
                    >
                      <FileText className="h-3 w-3" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}



      {/* Neither owner nor candidate (other employer viewing) */}
      {!user || (user.role === "employer" && !isOwner) ? (
        <div className="rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-md p-6 text-center">
          <p className="text-sm text-muted-foreground">
            {!user
              ? "Sign in as a candidate to apply for this job."
              : "Only the employer who posted this job can view applications."}
          </p>
          {!user && (
            <div className="mt-4 flex justify-center gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild variant="glow" size="sm">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      ) : null}

      {/* Resume viewer panel */}
      {viewerApp && <ResumeViewer app={viewerApp} onClose={() => setViewerApp(null)} />}
    </div>
  );
}
