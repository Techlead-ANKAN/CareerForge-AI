"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Eye, EyeOff, UserPlus, AlertCircle, Briefcase, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/shared/AuthProvider";

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "candidate" as "candidate" | "employer",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Sign up failed.");
        return;
      }

      setUser(data.user);
      router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        {/* Card */}
        <div className="rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-md p-8 shadow-[0_0_40px_rgba(139,92,246,0.08)]">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-[0_0_20px_rgba(139,92,246,0.4)]">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Create your account
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Join CareerForge AI today
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Role toggle */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-foreground">
              I am a...
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, role: "candidate" }))}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  form.role === "candidate"
                    ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                    : "border-glass-border bg-glass-bg text-muted-foreground hover:border-primary/30 hover:bg-surface-3"
                }`}
              >
                <User className="h-4 w-4" />
                Candidate
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, role: "employer" }))}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  form.role === "employer"
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                    : "border-glass-border bg-glass-bg text-muted-foreground hover:border-amber-500/30 hover:bg-surface-3"
                }`}
              >
                <Briefcase className="h-4 w-4" />
                Employer
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {form.role === "candidate"
                ? "Browse jobs and apply with your resume."
                : "Post job openings and find top candidates."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Username
                <span className="ml-1 text-xs text-muted-foreground">(unique, 3-30 chars)</span>
              </label>
              <Input
                type="text"
                placeholder="your_username"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                required
                autoComplete="username"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Password
                <span className="ml-1 text-xs text-muted-foreground">(min 6 chars)</span>
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="glow"
              size="lg"
              className="w-full mt-2"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </span>
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
