"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Sparkles,
  ScanSearch,
  Mail,
  Mic,
  Home,
  Settings,
  Zap,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/resume-builder", label: "Resume Builder", icon: FileText },
  { href: "/ai-enhance", label: "AI Enhance", icon: Sparkles },
  { href: "/ats-checker", label: "ATS Checker", icon: ScanSearch },
  { href: "/cv-generator", label: "CV / Cover Letter", icon: Mail },
  { href: "/interview-prep", label: "Interview Prep", icon: Mic },
  { href: "/settings", label: "API Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0d0d0d] border-r border-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">CareerForge</h1>
            <p className="text-xs text-muted">AI-Powered</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-muted hover:bg-card-hover hover:text-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-muted group-hover:text-primary"}`} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted text-center">
          Powered by Gemini 2.0 Flash
        </div>
      </div>
    </aside>
  );
}
