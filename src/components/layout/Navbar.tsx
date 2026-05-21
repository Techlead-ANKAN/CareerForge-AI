"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  FileText,
  Sparkles,
  ScanSearch,
  ShieldCheck,
  Mail,
  Mic,
  Settings,
  Zap,
  Menu,
  ChevronDown,
  ArrowRight,
  FolderSearch,
  Briefcase,
  LogOut,
  LogIn,
  UserPlus,
  PlusCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { MobileNav } from "./MobileNav";
import { useAuth } from "@/components/shared/AuthProvider";

export const featureItems = [
  {
    href: "/resume-builder",
    label: "Resume Builder",
    icon: FileText,
    description: "AI-powered LaTeX resumes with PDF export",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    href: "/ai-enhance",
    label: "AI Enhance",
    icon: Sparkles,
    description: "Multi-level AI resume improvements",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    href: "/ats-checker",
    label: "ATS Checker",
    icon: ScanSearch,
    description: "Score & optimize for applicant tracking",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    href: "/project-analyse",
    label: "Project Analyse",
    icon: FolderSearch,
    description: "Compare your resume projects against top real-world similar projects",
    gradient: "from-fuchsia-500 to-indigo-600",
  },
  {
    href: "/resume-verifier",
    label: "Resume Verifier",
    icon: ShieldCheck,
    description: "Interview-style resume claim validation",
    gradient: "from-indigo-500 to-sky-600",
  },
  {
    href: "/cv-generator",
    label: "CV / Cover Letter",
    icon: Mail,
    description: "Tailored cover letters & academic CVs",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    href: "/interview-prep",
    label: "Interview Prep",
    icon: Mic,
    description: "Live AI interview simulation with voice",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    href: "/jobs",
    label: "Job Board",
    icon: Briefcase,
    description: "Browse jobs and apply with your resume",
    gradient: "from-blue-500 to-cyan-600",
  },
];

export const navItems = [
  { href: "/", label: "Home", icon: Zap },
  ...featureItems.map((f) => ({ href: f.href, label: f.label, icon: f.icon })),
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const megaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const megaRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isFeatureActive = featureItems.some(
    (f) => pathname === f.href || pathname.startsWith(f.href)
  );

  const openMega = () => {
    if (megaTimeout.current) clearTimeout(megaTimeout.current);
    setMegaOpen(true);
  };

  const closeMega = () => {
    megaTimeout.current = setTimeout(() => setMegaOpen(false), 150);
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    router.push("/");
  };

  useEffect(() => {
    return () => {
      if (megaTimeout.current) clearTimeout(megaTimeout.current);
    };
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-glass-border bg-nav-bg backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-shadow group-hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              CareerForge
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              href="/"
              className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === "/"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Home
            </Link>

            {/* Features mega menu trigger */}
            <div
              ref={megaRef}
              className="relative"
              onMouseEnter={openMega}
              onMouseLeave={closeMega}
            >
              <button
                className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isFeatureActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Features
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    megaOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Mega menu panel */}
              {megaOpen && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[580px] rounded-xl border border-glass-border bg-mega-bg backdrop-blur-xl p-1 shadow-[0_20px_60px_var(--shadow-heavy),0_0_40px_rgba(139,92,246,0.08)] animate-fade-in"
                  onMouseEnter={openMega}
                  onMouseLeave={closeMega}
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent" />
                  <div className="grid grid-cols-1 gap-0.5 p-2">
                    {featureItems.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        pathname === item.href ||
                        pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMegaOpen(false)}
                          className={`group flex items-center gap-3 rounded-lg px-3 py-3 transition-all duration-200 ${
                            isActive
                              ? "bg-primary/10 border border-primary/20"
                              : "hover:bg-surface-3 border border-transparent"
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br ${item.gradient} shadow-lg opacity-80 group-hover:opacity-100 transition-opacity`}
                          >
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                              {item.label}
                            </div>
                            <div className="text-xs text-muted-foreground leading-snug">
                              {item.description}
                            </div>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/settings"
              className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === "/settings"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Settings
            </Link>

            {/* Employer-only: Post a Job shortcut */}
            {user?.role === "employer" && (
              <Link
                href="/employer/jobs/new"
                className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === "/employer/jobs/new"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Post Job
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Auth section */}
            {loading ? (
              <div className="hidden lg:block h-8 w-20 rounded-lg bg-surface-3 animate-pulse" />
            ) : user ? (
              /* Logged-in: user badge + dropdown */
              <div ref={userMenuRef} className="relative hidden lg:block">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-lg border border-glass-border bg-glass-bg px-3 py-1.5 text-sm font-medium transition-all hover:border-primary/30 hover:bg-surface-5"
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      user.role === "employer" ? "bg-amber-400" : "bg-emerald-400"
                    }`}
                  />
                  <span className="text-foreground">{user.username}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    ({user.role})
                  </span>
                  <ChevronDown
                    className={`h-3 w-3 text-muted-foreground transition-transform ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-glass-border bg-mega-bg backdrop-blur-xl p-1 shadow-[0_20px_60px_var(--shadow-heavy)] animate-fade-in">
                    <div className="px-3 py-2 border-b border-glass-border mb-1">
                      <p className="text-xs text-muted-foreground">Signed in as</p>
                      <p className="text-sm font-medium text-foreground truncate">{user.username}</p>
                    </div>
                    {user.role === "employer" && (
                      <Link
                        href="/employer/jobs"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-surface-3 transition-colors"
                      >
                        <Briefcase className="h-4 w-4" />
                        My Job Postings
                      </Link>
                    )}
                    {user.role === "candidate" && (
                      <Link
                        href="/my-applications"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-surface-3 transition-colors"
                      >
                        <Briefcase className="h-4 w-4" />
                        My Applications
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Logged-out: Login + Sign Up buttons */
              <div className="hidden lg:flex items-center gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href="/login">
                    <LogIn className="h-3.5 w-3.5" />
                    Login
                  </Link>
                </Button>
                <Button asChild size="sm" variant="glow">
                  <Link href="/signup">
                    <UserPlus className="h-3.5 w-3.5" />
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} />
    </>
  );
}
