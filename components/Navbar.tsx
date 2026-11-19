"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, Search, ArrowRight } from "lucide-react";

const CATEGORIES = [
  "Software/IT",
  "Marketing",
  "Design",
  "Finance",
  "HR",
  "Business",
  "Data/AI",
  "Content Writing",
  "Engineering",
  "Others",
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { setTheme, theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-bangla font-bold text-lg tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
            IB
          </div>
          <span className="text-inter">Intern<span className="text-primary-600">BD</span></span>
        </Link>

        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-foreground/80">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/?category=${encodeURIComponent(cat)}`}
              className="hover:text-primary-600 transition-colors"
            >
              {cat}
            </Link>
          ))}
          <Link href="/saved" className="hover:text-primary-600 transition-colors">
            Saved
          </Link>
          <Link href="/post" className="hover:text-primary-600 transition-colors">
            Post Internship
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-2 rounded-md text-foreground/70 hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden p-2 rounded-md text-foreground/70 hover:bg-secondary transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-border/50 border-b absolute top-full left-0 right-0 z-50">
          <div className="px-4 py-4 space-y-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/?category=${encodeURIComponent(cat)}`}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 rounded-lg hover:bg-secondary hover:text-primary-600 transition-colors"
              >
                {cat}
              </Link>
            ))}
            <Link
              href="/saved"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 rounded-lg hover:bg-secondary hover:text-primary-600 transition-colors"
            >
              Saved
            </Link>
            <Link
              href="/post"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 rounded-lg hover:bg-secondary hover:text-primary-600 transition-colors"
            >
              Post Internship
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}