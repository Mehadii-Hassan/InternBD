"use client";

import Link from "next/link";

const FOOTER_LINKS = [
  { label: "About", href: "/about" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Contact", href: "/contact" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Post an Internship", href: "/post" },
];

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="px-4 py-12 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 text-bangla font-bold text-lg tracking-tight">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              IB
            </div>
            <span className="text-inter">Intern<span className="text-primary">BD</span></span>
          </div>

          <div className="flex gap-8 text-sm text-foreground/60">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex gap-4 text-foreground/40">
            <a href="#" className="hover:text-foreground transition-colors">
              Facebook
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              LinkedIn
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-xs text-foreground/50">
          InternBD &copy; {new Date().getFullYear()}. Free internship discovery for Bangladeshi students.
        </div>
      </div>
    </footer>
  );
}
