"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("password", password);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();

      if (result.success) {
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        setError(result.error || "Invalid password");
      }
    } catch {
      setError("Failed to connect. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground text-bangla mb-2">Admin Login</h1>
          <p className="text-muted-foreground">
            Enter the admin password to access the moderation dashboard.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
            <Mail className="w-4 h-4" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-xl p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus-ring-primary outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold text-lg hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-xs text-muted-foreground text-center">
          Don't have the admin password? Contact the site administrator.
        </p>
      </div>
    </div>
  );
}
