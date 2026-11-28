"use client";

import { useState, useEffect } from "react";
import { getPendingInternships, moderateInternship } from "@/lib/actions/admin";
import { Shield, X, Trash2, Check, ChevronRight } from "lucide-react";
import Link from "next/link";

interface PendingInternship {
  id: string;
  title: string;
  company_name: string;
  location: string;
  category: string;
  department: string | null;
  work_mode: string;
  is_paid: string;
  stipend: string | null;
  deadline: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  apply_link: string | null;
  apply_email: string | null;
  source: string;
  source_name: string;
  created_at: string;
}

export default function ModerationPage() {
  const [internships, setInternships] = useState<PendingInternship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPending();
  }, []);

  async function loadPending() {
    setLoading(true);
    try {
      const result = await getPendingInternships();
      if (result.error) {
        setError(result.error);
      } else {
        setInternships(result.internships);
      }
    } catch {
      setError("Failed to load pending internships");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id: string, action: string) {
    const formData = new FormData();
    formData.append("internship_id", id);
    formData.append("action", action);

    try {
      const result = await moderateInternship(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setInternships(internships.filter((i) => i.id !== id));
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    } catch {
      setError("Action failed. Try again.");
    }
  }

  async function bulkAction(action: string) {
    const selectedArray = Array.from(selected);
    for (const id of selectedArray) {
      await handleAction(id, action);
    }
    setSelected(new Set());
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isSelected = (id: string) => selected.has(id);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (internships.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">All Caught Up</h2>
          <p className="text-muted-foreground">No pending internships to review.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground text-bangla">Moderation Queue</h1>
            <p className="text-muted-foreground text-sm">
              {internships.length} pending internship{internships.length !== 1 ? "s" : ""} awaiting review
            </p>
          </div>
          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{selected.size} selected</span>
              <button
                onClick={() => bulkAction("approve")}
                className="px-3 py-1.5 rounded-md bg-green-50 text-green-600 text-sm font-medium hover:bg-green-100 transition-colors"
              >
                Approve Selected
              </button>
              <button
                onClick={() => bulkAction("reject")}
                className="px-3 py-1.5 rounded-md bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
              >
                Reject Selected
              </button>
              <button
                onClick={() => setSelected(new Set())}
                className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-secondary transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="w-8 px-3 py-3">
                  <input
                    type="checkbox"
                    className="rounded border-input"
                    onChange={() => {
                      if (selected.size === internships.length) {
                        setSelected(new Set());
                      } else {
                        setSelected(new Set(internships.map((i) => i.id)));
                      }
                    }}
                    checked={selected.size === internships.length && internships.length > 0}
                  />
                </th>
                <th className="pb-3 font-medium">Title</th>
                <th className="pb-3 font-medium text-muted-foreground hidden sm:table-cell">Company</th>
                <th className="pb-3 font-medium text-muted-foreground hidden sm:table-cell">Location</th>
                <th className="pb-3 font-medium text-muted-foreground hidden sm:table-cell">Category</th>
                <th className="pb-3 font-medium text-muted-foreground hidden sm:table-cell">Paid</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {internships.map((job) => (
                <tr key={job.id} className="border-b border-border/50 hover:bg-secondary/50">
                  <td className="py-3">
                    <input
                      type="checkbox"
                      className="rounded border-input"
                      checked={isSelected(job.id)}
                      onChange={() => toggleSelect(job.id)}
                    />
                  </td>
                  <td className="py-3">
                    <div className="font-medium text-foreground">{job.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {job.description.slice(0, 80)}...
                    </div>
                  </td>
                  <td className="py-3 text-foreground/80">{job.company_name}</td>
                  <td className="py-3 text-xs text-muted-foreground hidden sm:table-cell">
                    {job.location}
                  </td>
                  <td className="py-3 text-xs text-muted-foreground hidden sm:table-cell">
                    {job.category}
                  </td>
                  <td className="py-3 text-xs text-muted-foreground hidden sm:table-cell">
                    {job.is_paid}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleAction(job.id, "approve")}
                        className="px-2 py-1 rounded bg-green-50 text-green-600 text-xs font-medium hover:bg-green-100 transition-colors"
                        title="Approve"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleAction(job.id, "reject")}
                        className="px-2 py-1 rounded bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors"
                        title="Reject"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleAction(job.id, "delete")}
                        className="px-2 py-1 rounded bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <Link
                        href={`/internship/${job.id}`}
                        className="px-2 py-1 rounded bg-secondary text-foreground/60 text-xs font-medium hover:bg-secondary/80 transition-colors"
                        title="Preview"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
