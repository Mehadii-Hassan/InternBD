"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  MapPin,
  Clock,
  Percentage,
  Mail,
  Link as LinkIcon,
  Building2,
  CheckCircle,
} from "lucide-react";
import { CATEGORIES, LOCATIONS, PAID_STATUSES, WORK_MODES, DURATIONS } from "@/lib/types";

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
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Internship Posted!</h2>
          <p className="text-muted-foreground mb-6">
            Thank you for posting. This is a UI-only demo. In Phase 2, this will be connected to a backend.
          </p>
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
            Browse internships
          </Link>
        </div>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1500);
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
            Help students and fresh graduates find opportunities. This form is UI-only for Phase 1.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-xl p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Company Name</label>
              <input
                type="text"
                placeholder="e.g. DevSoft Bangladesh"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary-500 outline-none"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Company Email (HR)</label>
              <input
                type="email"
                placeholder="hr@company.com"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary-500 outline-none"
                value={form.companyEmail}
                onChange={(e) => setForm({ ...form, companyEmail: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Internship Title</label>
            <input
              type="text"
              placeholder="e.g. Frontend Developer Intern"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary-500 outline-none"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary-500 outline-none"
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
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary-500 outline-none"
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
                value={form.paidStatus}
                onChange={(e) => setForm({ ...form, paidStatus: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary-500 outline-none"
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
                value={form.workMode}
                onChange={(e) => setForm({ ...form, workMode: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary-500 outline-none"
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
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary-500 outline-none"
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
              type="text"
              placeholder="e.g. ৳8,000 - ৳12,000"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary-500 outline-none"
              value={form.stipend}
              onChange={(e) => setForm({ ...form, stipend: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Application Deadline</label>
            <input
              type="date"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary-500 outline-none"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              rows={4}
              placeholder="Describe the internship role..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary-500 outline-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Requirements</label>
              <textarea
                rows={3}
                placeholder="Comma-separated requirements..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary-500 outline-none"
                value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Responsibilities</label>
              <textarea
                rows={3}
                placeholder="Comma-separated responsibilities..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary-500 outline-none"
                value={form.responsibilities}
                onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Apply Link / Email</label>
            <input
              type="url"
              placeholder="https://company.com/apply or hr@company.com"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary-500 outline-none"
              value={form.applyLink}
              onChange={(e) => setForm({ ...form, applyLink: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-primary-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? "Posting..." : "Post Internship (Demo)"}
          </button>
        </form>
      </div>
    </div>
  );
}