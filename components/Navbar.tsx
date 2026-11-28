"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";

const NAV_LINKS = [
  { label: "Internships", href: "/internships" },
  { label: "Companies", href: "/companies" },
  { label: "Categories", href: "/categories" },
  { label: "Locations", href: "/locations" },
  { label: "Post Free", href: "/post" },
  { label: "About", href: "/about" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { setTheme, theme } = useTheme();
  const isDark = theme === "dark";

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 10);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <>
      <nav
        className={cn(
          "sticky top-0 z-40 border-b border-border/50 backdrop-blur-md transition-all duration-300",
          scrolled ? "shadow-sm" : "shadow-none"
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-bangla font-bold text-lg tracking-tight"
          >
            <Logo className="h-6 w-6" wordmark />
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
          <div className="lg:hidden bg-card border-b border-border absolute top-full left-0 right-0 z-40 animate-slide-up">
            <div className="px-4 py-4 space-y-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2 rounded-lg hover:bg-secondary hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
