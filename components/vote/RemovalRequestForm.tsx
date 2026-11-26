"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { Flag, Mail } from "lucide-react";
import { createRemovalRequest } from "@/lib/actions/internships";

interface RemovalRequestFormProps {
  internshipId: string;
  postUrl: string;
  className?: string;
}

export function RemovalRequestForm({ internshipId, postUrl, className }: RemovalRequestFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (submitted) {
    return (
      <div className={cn("rounded-lg border border-border bg-card p-4", className)}>
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium text-foreground">Removal request submitted</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          We will review your request and contact you if needed.
        </p>
      </div>
    );
  }

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
      setSubmitted(true);
    } catch {
      setError("Failed to submit. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className={cn("rounded-lg border border-border bg-card p-4", className)}>
      {!submitted && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <Flag className="w-4 h-4 text-destructive" />
            <h3 className="text-sm font-bold text-foreground">Report or Request Removal</h3>
          </div>
          {error && (
            <div className="mb-3 p-2 rounded text-sm bg-destructive/10 border border-destructive/20 text-destructive">
              {error}
            </div>
          )}
          <form action={handleSubmit} className="space-y-3">
            <input type="hidden" name="internship_id" value={internshipId} />
            <input type="hidden" name="post_url" value={postUrl} />
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground/70">Reason</label>
              <select
                name="reason"
                required
                className="w-full px-2 py-1.5 rounded border border-border bg-background text-sm outline-none focus:ring-1 focus-ring-primary"
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
              <label className="text-xs font-medium text-foreground/70">Your Email (optional)</label>
              <input
                name="requester_email"
                type="email"
                placeholder="you@example.com"
                className="w-full px-2 py-1.5 rounded border border-border bg-background text-sm outline-none focus:ring-1 focus-ring-primary"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 rounded-lg border border-destructive text-destructive text-sm font-medium hover:bg-destructive/50 transition-colors"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
