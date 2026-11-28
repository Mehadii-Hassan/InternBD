"use client";

import { subscribeEmail } from "@/lib/actions/internships";
import { useState } from "react";
import { Mail } from "lucide-react";

export function EmailSubscribe() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const result = await subscribeEmail(formData);
      if (result.error) {
        alert("Error: " + result.error);
      } else {
        setSubmitted(true);
      }
    } catch {
      alert("Failed to subscribe. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center">
        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">Subscribed!</h3>
        <p className="text-sm text-muted-foreground">
          You'll receive job alerts for new internships matching your preferences.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-input rounded-xl p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-lg font-bold text-foreground mb-4">
          <Mail className="w-5 h-5 inline-block mr-2 text-primary" />
          Job Alerts
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Get notified about new internships matching your preferences.
        </p>
        <input
          type="email"
          name="email"
          placeholder="you@example.com"
          className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus-ring-primary outline-none"
          required
        />
        <div className="flex flex-wrap gap-2">
          <div className="flex-1">
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Category (optional)
            </label>
            <select
              name="category"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus-ring-primary outline-none"
            >
              <option value="">Any category</option>
              <option value="Software/IT">Software/IT</option>
              <option value="Marketing">Marketing</option>
              <option value="Design">Design</option>
              <option value="Finance">Finance</option>
              <option value="HR">HR</option>
              <option value="Business">Business</option>
              <option value="Data/AI">Data/AI</option>
              <option value="Engineering">Engineering</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Location (optional)
            </label>
            <select
              name="location"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus-ring-primary outline-none"
            >
              <option value="">Any location</option>
              <option value="Dhaka">Dhaka</option>
              <option value="Chattogram">Chattogram</option>
              <option value="Sylhet">Sylhet</option>
              <option value="Khulna">Khulna</option>
              <option value="Barishal">Barishal</option>
              <option value="Rangpur">Rangpur</option>
              <option value="Mymensingh">Mymensingh</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {submitting ? "Subscribing..." : "Subscribe to Job Alerts"}
        </button>
      </form>
    </div>
  );
}
