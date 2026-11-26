"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, Search, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Internships", href: "/internships" },
  { label: "Categories", href: "/categories" },
  { label: "Locations", href: "/locations" },
  { label: "Companies", href: "/companies" },
  { label: "Post Free", href: "/post" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { setTheme, theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <nav className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-3 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-bangla font-bold text-lg tracking-tight"
        >
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            IB
          </div>
          <span className="text-inter">Intern<span className="text-primary">BD</span></span>
        </Link>

        <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-foreground/70">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
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

      {open && (
        <div className="lg:hidden border-b bg-border/50 border-b absolute top-full left-0 right-0 z-40">
          <div className="px-4 py-4 space-y-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 rounded-md hover:bg-secondary hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
