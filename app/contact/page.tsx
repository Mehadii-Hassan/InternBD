"use client";

import Link from "next/link";
import { Mail, MapPin, Phone, MessageSquare } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => setSubmitting(false), 1500);
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground text-bangla mb-2">Contact Us</h1>
          <p className="text-muted-foreground">
            Have questions, feedback, or want to partner with us? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card border border-input rounded-xl p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus-ring-primary outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus-ring-primary outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Subject</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus-ring-primary outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Message</label>
                <textarea
                  rows={5}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus-ring-primary outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
              >
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-input rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Get in Touch</h2>
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-foreground">Email</h3>
                    <p className="text-muted-foreground">hello@internbd.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-foreground">Location</h3>
                    <p className="text-muted-foreground">Dhaka, Bangladesh</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-foreground">Phone</h3>
                    <p className="text-muted-foreground">+880 1XXX-XXXXXX</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
