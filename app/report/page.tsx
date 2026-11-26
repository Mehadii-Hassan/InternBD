"use client";

import Link from "next/link";
import { createRemovalRequest } from "@/lib/actions/internships";
import { Mail } from "lucide-react";
import { useState } from "react";

export default function ReportPage({ params }: { params: { id: string } }) {

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    try {
      const result = await createRemovalRequest(formData);
      if (result.error) {
        setError(result.error);
        setSubmitting(false);
        return;
      }
    } catch {
      setError("Failed to submit. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-foreground text-bangla mb-6">Report Fake Listing</h1>
        
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-5 bg-card border border-input rounded-xl p-6">
          <input type="hidden" name="internship_id" value={params.id} />
          <input type="hidden" name="post_url" value={typeof window !== "undefined" ? window.location.href : ""} />
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Reason</label>
            <select
              name="reason"
              required
              className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus-ring-primary outline-none"
            >
              <option value="">Select a reason</option>
              <option value="asked_money">Asked for money or payment</option>
              <option value="no_company_info">No company information</option>
              <option value="suspicious_contact">Suspicious contact details</option>
              <option value="expired_or_filled">Position expired or filled</option>
              <option value="duplicate">Duplicate listing</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Your Email (optional)</label>
            <input
              name="requester_email"
              type="email"
              placeholder="you@example.com"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus-ring-primary outline-none"
            />
          </div>
          
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-destructive text-destructive-foreground px-6 py-3 rounded-lg font-semibold hover:bg-destructive/90 disabled:opacity-60 transition-colors"
          >
            {submitting ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
}
