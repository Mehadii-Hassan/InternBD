"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Flag } from "lucide-react";

export function FakeReportWidget() {
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  return (
    <div className="bg-muted/50 border border-border rounded-xl p-6 mt-8">
      <div className="flex items-start gap-3">
        <Flag className="w-5 h-5 text-foreground/50 mt-0.5" />
        <div>
          <h3 className="font-medium text-foreground mb-2 text-sm">Looks fake? Report it</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Help us keep InternBD trustworthy. Vote if this listing seems suspicious.
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
              <ThumbsUp className="w-4 h-4" /> Helpful
            </button>
            <button
              onClick={() => setVote("down")}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                vote === "down"
                  ? "bg-red-500 text-white"
                  : "bg-white border border-border hover:bg-red-50/50 hover:text-red-600"
              }`}
            >
              <ThumbsDown className="w-4 h-4" /> Not helpful
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}