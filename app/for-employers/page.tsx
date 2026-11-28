"use client";

import Link from "next/link";
import { createBoostRequest } from "@/lib/actions/internships";
import { useState } from "react";

export default function ForEmployersPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormData) {
    setSubmitting(true);
    try {
      const result = await createBoostRequest(e);
      if (result.error) {
        alert("Error: " + result.error);
      } else {
        setSubmitted(true);
      }
    } catch {
      alert("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <span className="w-6 h-6 text-white">✓</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Boost Request Submitted</h1>
            <p className="text-muted-foreground">
              Your boost request has been submitted. Our team will review it and activate your featured listing after payment confirmation.
            </p>
            <Link
              href="/for-employers"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Back to For Employers →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground text-bangla mb-6">For Employers</h1>
        </div>

        <div className="space-y-8">
          <section className="bg-card border border-input rounded-xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Post Free Internships</h2>
            <p className="text-muted-foreground mb-4">
              Post your internship opportunities for free and reach thousands of students and fresh graduates across Bangladesh.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Free posting for all companies</li>
              <li>Reach students across all divisions</li>
              <li>Track applications and manage listings</li>
              <li>Verified company badge for trusted employers</li>
            </ul>
            <Link
              href="/post"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Post an Internship →
            </Link>
          </section>

          <section className="bg-card border border-input rounded-xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Boost Your Internship</h2>
            <p className="text-muted-foreground mb-4">
              Give your internship more visibility with a featured listing. Featured listings appear at the top with a "Featured" badge.
            </p>
            <div className="bg-card border border-input rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">Featured Internship</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Your listing appears at the top of search results with a "Featured" badge for increased visibility.
              </p>
              <p className="text-sm font-medium text-foreground mb-4">Price: ৳500 per listing</p>
              <p className="text-xs text-muted-foreground mb-4">
                Payment via bKash or Nagad. Admin will activate your featured listing after payment confirmation.
              </p>
              <form action={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Internship ID</label>
                  <input
                    type="text"
                    name="internship_id"
                    placeholder="Internship ID (from your listing URL)"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus-ring-primary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Company Name</label>
                  <input
                    type="text"
                    name="company_name"
                    placeholder="Your company name"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus-ring-primary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Company Email</label>
                  <input
                    type="email"
                    name="company_email"
                    placeholder="your@company.com"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus-ring-primary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value="500"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus-ring-primary outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
                >
                  {submitting ? "Submitting..." : "Request Boost"}
                </button>
                <p className="text-xs text-muted-foreground text-center">
                  Payment via bKash or Nagad. Admin will activate your featured listing after payment confirmation.
                </p>
              </form>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Link href="/" className="text-primary hover:text-primary/90 font-medium">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
