"use client";

import Link from "next/link";

const FOOTER_LINKS = [
  { label: "About", href: "/about" },
  { label: "How it works", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "For Employers", href: "/for-employers" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Disclaimer", href: "/disclaimer" },
  { label: "Safety Tips", href: "/safety-tips" },
  { label: "Contact", href: "/contact" },
  { label: "Post an Internship", href: "/post" },
];

const COMPANY_LINKS = [
  { label: "Companies", href: "/companies" },
  { label: "Categories", href: "/categories" },
  { label: "Locations", href: "/locations" },
  { label: "Report Fake", href: "/report" },
];

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto bg-background">
      <div className="px-4 py-12 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2 md:col-span-3">
            <div className="flex items-center gap-2 text-bangla font-bold text-lg tracking-tight mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                IB
              </div>
              <span className="text-inter">Intern<span className="text-primary">BD</span></span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Bangladesh's trusted platform for discovering internships. Built for students and fresh graduates.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/60 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.slice(4, 8).map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/60 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">
              Connect
            </h4>
            <div className="flex gap-3 text-foreground/40">
              <a href="#" className="hover:text-foreground transition-colors">
                Facebook
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                LinkedIn
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Twitter
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-xs text-foreground/50">
          InternBD &copy; {new Date().getFullYear()}. Free internship discovery for Bangladeshi students.
        </div>
      </div>
    </footer>
  );
}
