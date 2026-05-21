"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Briefcase, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/PageHeader";

export default function PostJobPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    requirements: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function setField(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to post job.");
        return;
      }

      setSuccess("Job posted successfully!");
      setTimeout(() => router.push("/employer/jobs"), 1200);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      <PageHeader
        title="Post a New Job"
        subtitle="Describe the role and requirements. Candidates will apply with their resume and get automatically scored."
        icon={Briefcase}
        gradient="from-amber-500 to-orange-600"
      />

      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Jobs
      </button>

      <div className="rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-md p-8">
        {success ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-400">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">{success}</p>
              <p className="text-emerald-400/70 text-xs mt-0.5">Redirecting to your dashboard...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Job Title <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. Senior Frontend Engineer"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Job Description <span className="text-destructive">*</span>
              </label>
              <textarea
                placeholder="Describe the role, responsibilities, team, and what success looks like in this position..."
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                required
                rows={5}
                className="flex w-full rounded-lg border border-glass-border bg-surface-2 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/30 focus-visible:shadow-[0_0_15px_rgba(139,92,246,0.1)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Requirements <span className="text-destructive">*</span>
              </label>
              <p className="text-xs text-muted-foreground">
                Be specific — these are used by the AI to score candidate resumes.
              </p>
              <textarea
                placeholder="e.g. 3+ years of React experience, TypeScript, REST API design, Node.js, strong communication skills..."
                value={form.requirements}
                onChange={(e) => setField("requirements", e.target.value)}
                required
                rows={5}
                className="flex w-full rounded-lg border border-glass-border bg-surface-2 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/30 focus-visible:shadow-[0_0_15px_rgba(139,92,246,0.1)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                variant="glow"
                size="lg"
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                    Posting job...
                  </span>
                ) : (
                  "Post Job"
                )}
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/employer/jobs">Cancel</Link>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
