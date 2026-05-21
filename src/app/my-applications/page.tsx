"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAuth } from "@/components/shared/AuthProvider";

interface AppliedJob {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  jobDescription: string;
  employer: string;
  resumeFilename: string;
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

export default function MyApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<AppliedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchApps() {
      try {
        const res = await fetch("/api/jobs/applied");
        if (!res.ok) throw new Error("Failed to load applications.");
        const data = await res.json();
        setApplications(data.applications);
      } catch {
        setError("Failed to load your applications.");
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchApps();
  }, [user]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      <PageHeader
        title="My Applications"
        subtitle="Track all the roles you've applied to."
        icon={Briefcase}
        gradient="from-emerald-500 to-teal-600"
      />

      <div className="mt-8">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-xl border border-glass-border bg-glass-bg animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : applications.length === 0 ? (
          <div className="py-24 text-center">
            <Inbox className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">You haven&apos;t applied to any jobs yet.</p>
            <Button asChild variant="glow" size="sm" className="mt-4">
              <Link href="/jobs">Browse Jobs</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.applicationId}
                className="flex items-start gap-4 rounded-xl border border-glass-border bg-glass-bg backdrop-blur-md px-5 py-4 transition-all hover:border-emerald-500/20 hover:shadow-[0_0_20px_rgba(16,185,129,0.06)]"
              >
                {/* Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md mt-0.5">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{app.jobTitle}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    at <span className="text-foreground/80">{app.employer}</span>
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {app.resumeFilename}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Applied {timeAgo(app.appliedAt)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Submitted
                    </span>
                  </div>
                </div>

                {/* Action */}
                <Button asChild variant="outline" size="sm" className="shrink-0 mt-0.5">
                  <Link href={`/jobs/${app.jobId}`}>
                    View Job
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
