"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  MapPin,
  Clock,
  Mail,
  Building2,
  CheckCircle,
} from "lucide-react";
import {
  CATEGORIES,
  LOCATIONS,
  PAID_STATUSES,
  WORK_MODES,
  DURATIONS,
} from "@/lib/types";
import { createInternship } from "@/lib/actions/internships";

const INITIAL_FORM = {
  companyName: "",
  companyEmail: "",
  title: "",
  category: "Software/IT",
  location: "Dhaka",
  paidStatus: "Paid",
  workMode: "On-site",
  duration: "3 months",
  stipend: "",
  deadline: "",
  description: "",
  requirements: "",
  responsibilities: "",
  applyLink: "",
  applyEmail: "",
  hrEmail: "",
};

export default function PostPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Internship Posted!</h2>
          <p className="text-muted-foreground mb-6">
            Thank you for posting. Your internship has been submitted for review and will go live after approval.
          </p>
          <Link href="/" className="text-primary hover:text-primary/90 font-medium">
            Browse internships
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    try {
      const result = await createInternship(formData);
      if (result.error) {
        setError(result.error);
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch (err) {
      setError("Failed to submit. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary-600">
            ← Back to home
          </Link>
          <h1 className="text-2xl font-bold text-foreground text-bangla mb-2">Post an Internship</h1>
          <p className="text-muted-foreground">
            Help students and fresh graduates find opportunities. Your posting will be reviewed before going live.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-6 bg-card border border-border rounded-xl p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Company Name</label>
              <input
                name="company_name"
                type="text"
                placeholder="e.g. DevSoft Bangladesh"
                required
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus-ring-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Company Email (HR)</label>
              <input
                name="company_email"
                type="email"
                placeholder="hr@company.com"
                required
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus-ring-primary outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Internship Title</label>
            <input
              name="title"
              type="text"
              placeholder="e.g. Frontend Developer Intern"
              required
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus-ring-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Category</label>
              <select
                name="category"
                defaultValue="Software/IT"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus-ring-primary outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Location</label>
              <select
                name="location"
                defaultValue="Dhaka"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus-ring-primary outline-none"
              >
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Paid/Unpaid</label>
              <select
                name="paid_status"
                defaultValue="Paid"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus-ring-primary outline-none"
              >
                {PAID_STATUSES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Work Mode</label>
              <select
                name="work_mode"
                defaultValue="On-site"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus-ring-primary outline-none"
              >
                {WORK_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Duration</label>
              <select
                name="duration"
                defaultValue="3 months"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus-ring-primary outline-none"
              >
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Stipend (per month)</label>
            <input
              name="stipend"
              type="text"
              placeholder="e.g. ৳8,000 - ৳12,000"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus-ring-primary outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Application Deadline</label>
            <input
              name="deadline"
              type="date"
              required
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus-ring-primary outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              name="description"
              rows={4}
              placeholder="Describe the internship role..."
              required
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus-ring-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Requirements</label>
              <textarea
                name="requirements"
                rows={3}
                placeholder="Comma-separated requirements..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus-ring-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Responsibilities</label>
              <textarea
                name="responsibilities"
                rows={3}
                placeholder="Comma-separated responsibilities..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus-ring-primary outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Apply Link / Email</label>
            <input
              name="apply_link"
              type="url"
              placeholder="https://company.com/apply or hr@company.com"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus-ring-primary outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">HR Email</label>
            <input
              name="hr_email"
              type="email"
              placeholder="hr@company.com"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus-ring-primary outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold text-lg hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {submitting ? "Posting..." : "Post Internship (Pending Review)"}
          </button>
        </form>
      </div>
    </div>
  );
}
