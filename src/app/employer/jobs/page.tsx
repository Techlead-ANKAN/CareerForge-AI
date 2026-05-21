"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  PlusCircle,
  Users,
  Clock,
  ArrowRight,
  AlertCircle,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/shared/AuthProvider";
import { PageHeader } from "@/components/shared/PageHeader";

interface Job {
  _id: string;
  title: string;
  description: string;
  applicationCount: number;
  createdAt: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function EmployerJobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch("/api/jobs");
        if (!res.ok) throw new Error("Failed to load jobs.");
        const data = await res.json();
        // Filter to only employer's own jobs
        const myJobs = data.jobs.filter(
          (j: Job & { employerId: string }) => j.employerId === user?.id
        );
        setJobs(myJobs);
      } catch {
        setError("Failed to load your job postings.");
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchJobs();
  }, [user]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="My Job Postings"
        subtitle="Manage your open positions and review candidate applications."
        icon={Briefcase}
        gradient="from-amber-500 to-orange-600"
      />

      <div className="mt-8 flex justify-end">
        <Button asChild variant="glow" size="sm">
          <Link href="/employer/jobs/new">
            <PlusCircle className="h-4 w-4" />
            Post a New Job
          </Link>
        </Button>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl border border-glass-border bg-glass-bg animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-20 text-center">
            <Briefcase className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">You haven&apos;t posted any jobs yet.</p>
            <Button asChild variant="glow" size="sm" className="mt-4">
              <Link href="/employer/jobs/new">Post your first job</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="flex items-center gap-4 rounded-xl border border-glass-border bg-glass-bg backdrop-blur-md px-5 py-4 transition-all hover:border-primary/20 hover:shadow-[0_0_20px_rgba(139,92,246,0.06)]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-md">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{job.title}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {job.applicationCount} application{job.applicationCount !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeAgo(job.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/jobs/${job._id}`}>
                      <Eye className="h-3.5 w-3.5" />
                      View Applications
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
