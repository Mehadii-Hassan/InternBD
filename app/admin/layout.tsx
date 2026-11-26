"use client";

import Link from "next/link";
import { LogOut, Settings, Users, Shield, FileText, BarChart3 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md">
        <div className="px-4 py-3 lg:px-8 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-bangla font-bold text-lg tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
              IB
            </div>
            <span className="text-inter">Admin</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/moderate" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
              Moderation
            </Link>
            <Link href="/admin/sources" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
              Sources
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-destructive hover:text-destructive/90 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-1" /> Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
