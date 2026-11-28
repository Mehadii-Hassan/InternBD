"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Flag } from "lucide-react";

interface FakeReportWidgetProps {
  currentRealVotes: number;
  currentFakeVotes: number;
}

export function FakeReportWidget({ currentRealVotes, currentFakeVotes }: FakeReportWidgetProps) {
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  const total = currentRealVotes + currentFakeVotes;
  const fakeShare = total > 0 ? (currentFakeVotes / total) * 100 : 0;

  return (
    <div className="bg-muted/50 border border-border rounded-xl p-6 mt-8">
      <div className="flex items-start gap-3">
        <Flag className="w-5 h-5 text-foreground/50 mt-0.5" />
        <div>
          <h3 className="font-medium text-foreground mb-2 text-sm">Community Trust</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {total} community vote{total !== 1 ? "s" : ""} — {fakeShare.toFixed(0)}% flagged as fake
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setVote("up")}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                vote === "up"
                  ? "bg-green-500 text-white"
                  : "bg-white border border-border hover:bg-green-50/50 hover:text-green-600"
              }`}
            >
              <ThumbsUp className="w-4 h-4" /> Real
            </button>
            <button
              onClick={() => setVote("down")}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                vote === "down"
                  ? "bg-red-500 text-white"
                  : "bg-white border border-border hover:bg-red-50/50 hover:text-red-600"
              }`}
            >
              <ThumbsDown className="w-4 h-4" /> Fake
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
