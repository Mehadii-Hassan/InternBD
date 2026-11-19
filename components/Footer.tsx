"use client";

import Link from "next/link";

const LINKS = [
  { label: "About", href: "/about" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Contact", href: "/contact" },
  { label: "Post an Internship", href: "/post" },
];

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="px-4 py-12 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-bangla font-bold text-lg tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
              IB
            </div>
            <span className="text-inter">Intern<span className="text-primary-600">BD</span></span>
          </div>

          <div className="flex gap-8 text-sm">
            {LINKS.map((link) => (
              <Link key={link.label} href={link.href} className="text-foreground/60 hover:text-foreground transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex gap-3 text-foreground/40">
            <a href="#" className="hover:text-foreground transition-colors">
              Facebook
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Twitter
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