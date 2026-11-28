"use client";

import React from "react";
import { removeAllSampleData } from "@/lib/actions/internships";
import { Trash2 } from "lucide-react";

export function RemoveSampleButton({ total }: { total: number }) {
  const [removing, setRemoving] = React.useState(false);
  const [confirmRemove, setConfirmRemove] = React.useState(false);

  async function handleRemoveSample() {
    setRemoving(true);
    try {
      const result = await removeAllSampleData();
      if (result.error) {
        alert("Error: " + result.error);
      } else {
        setConfirmRemove(false);
        window.location.reload();
      }
    } catch {
      alert("Failed to remove sample data");
    } finally {
      setRemoving(false);
    }
  }

  if (total === 0) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-900/30 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <Trash2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        <span className="font-medium text-amber-900 dark:text-amber-100">Remove Sample Data</span>
      </div>
      <p className="text-sm text-amber-700 dark:text-amber-200 mb-4">
        Permanently delete all sample internships (is_sample = true). This cannot be undone.
      </p>
      {!confirmRemove ? (
        <button
          onClick={() => setConfirmRemove(true)}
          className="px-4 py-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-medium hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
        >
          Yes, remove all sample data
        </button>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={handleRemoveSample}
            disabled={removing}
            className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 transition-colors disabled:opacity-60"
          >
            {removing ? "Removing..." : "Confirm Delete"}
          </button>
          <button
            onClick={() => setConfirmRemove(false)}
            className="px-4 py-2 rounded-lg border border-input bg-background text-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
