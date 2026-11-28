"use client";

import { FramerMotion } from "@/components/FramerMotion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const FAQS = [
  {
    q: "Is InternBD free to use?",
    a: "Yes. Browsing internships, posting listings, and applying are completely free. There are no application fees or hidden charges.",
  },
  {
    q: "How do I know if a listing is real?",
    a: "Every listing is reviewed before publication. You can also see community trust badges based on votes from other students — listings flagged as fake multiple times show a warning.",
  },
  {
    q: "Do I need to create an account to apply?",
    a: "No. You can browse and apply without an account. Applications go directly to the company website or email listed on the posting.",
  },
  {
    q: "Can employers post for free?",
    a: "Yes. Any company can post internship listings at no cost. There are no paid tiers or featured placement fees.",
  },
  {
    q: "How do I report a suspicious listing?",
    a: "Click the \"Report Fake\" button on any internship detail page, explain why you think it's suspicious, and our team will review it.",
  },
  {
    q: "What should I do if an employer asks for money?",
    a: "Never pay application, processing, or security fees for an internship. Report the listing immediately and apply elsewhere.",
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <a href="#content" className="skip-link">Skip to content</a>

      <section className="py-16 lg:py-24 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground text-bangla mb-4" id="content">
                Frequently Asked Questions
              </h1>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about finding and applying for internships in Bangladesh.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {FAQS.map((faq, i) => {
              const isOpen = open === i;
              return (
                <FramerMotion
                  key={i}
                  className="group bg-card border border-input rounded-xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-secondary transition-colors"
                  >
                    <h3 className="font-semibold text-foreground text-bangla">
                      {faq.q}
                    </h3>
                    <ArrowRight
                      className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                        isOpen ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 border-t border-border/50">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </FramerMotion>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Still have questions? <span>Contact us →</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
