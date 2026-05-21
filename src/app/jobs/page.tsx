"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Clock,
  Users,
  Search,
  PlusCircle,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/shared/AuthProvider";
import { PageHeader } from "@/components/shared/PageHeader";

interface Job {
  _id: string;
  title: string;
  description: string;
  requirements: string;
  employer: string;
  employerId: string;
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

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filtered, setFiltered] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch("/api/jobs");
        if (!res.ok) throw new Error("Failed to load jobs.");
        const data = await res.json();
        setJobs(data.jobs);
        setFiltered(data.jobs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load jobs.");
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.employer.toLowerCase().includes(q) ||
          j.requirements.toLowerCase().includes(q)
      )
    );
  }, [search, jobs]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Job Board"
        subtitle="Browse open positions and apply with your resume. Employers review applications with AI-powered ATS scoring."
        icon={Briefcase}
        gradient="from-blue-500 to-cyan-600"
      />

      {/* Controls */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs, companies, skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {user?.role === "employer" && (
          <Button asChild variant="glow" size="sm">
            <Link href="/employer/jobs/new">
              <PlusCircle className="h-4 w-4" />
              Post a Job
            </Link>
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="mt-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-52 rounded-xl border border-glass-border bg-glass-bg animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Briefcase className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">
              {search ? "No jobs match your search." : "No jobs posted yet."}
            </p>
            {user?.role === "employer" && !search && (
              <Button asChild variant="glow" size="sm" className="mt-4">
                <Link href="/employer/jobs/new">Post the first job</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((job) => (
              <Link
                key={job._id}
                href={`/jobs/${job._id}`}
                className="group flex flex-col rounded-xl border border-glass-border bg-glass-bg backdrop-blur-md p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.08)] hover:-translate-y-0.5"
              >
                {/* Icon + title */}
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {job.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      by {job.employer}
                    </p>
                  </div>
                </div>

                {/* Description snippet */}
                <p className="flex-1 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {job.description}
                </p>

                {/* Footer meta */}
                <div className="mt-4 flex items-center justify-between border-t border-glass-border pt-3">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {job.applicationCount} applied
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeAgo(job.createdAt)}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>

                {/* Employer owns it badge */}
                {user?.role === "employer" && user.id === job.employerId && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400">
                    Your posting
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
