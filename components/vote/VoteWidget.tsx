"use client";

import { useState, useEffect, useCallback } from "react";
import { ThumbsUp, ThumbsDown, ShieldCheck, AlertCircle } from "lucide-react";
import { voteOnInternship } from "@/lib/actions/internships";
import { cn } from "@/lib/utils";

interface VoteWidgetProps {
  internshipId: string;
  currentRealVotes?: number;
  currentFakeVotes?: number;
  className?: string;
  compact?: boolean;
}

export function VoteWidget({
  internshipId,
  currentRealVotes = 0,
  currentFakeVotes = 0,
  className,
  compact = false,
}: VoteWidgetProps) {
  const [voterHash, setVoterHash] = useState<string>("");
  const [myVote, setMyVote] = useState<"real" | "fake" | null>(null);
  const [realVotes, setRealVotes] = useState(currentRealVotes);
  const [fakeVotes, setFakeVotes] = useState(currentFakeVotes);
  const [submitting, setSubmitting] = useState(false);
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState("");
  const [voteMessage, setVoteMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let hash = localStorage.getItem("internbd_voter_hash");
    if (!hash) {
      hash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("internbd_voter_hash", hash);
    }
    setVoterHash(hash);
  }, []);

  useEffect(() => {
    setRealVotes(currentRealVotes);
    setFakeVotes(currentFakeVotes);
  }, [currentRealVotes, currentFakeVotes]);

  const total = realVotes + fakeVotes;
  const realPct = total > 0 ? Math.round((realVotes / total) * 100) : 0;
  const fakePct = total > 0 ? Math.round((fakeVotes / total) * 100) : 0;

  let trustBadge: "community-trusted" | "no-votes" | "disputed" | "likely-fake" = "no-votes";
  if (total > 0) {
    const fakeShare = fakeVotes / total;
    if (total >= 5 && fakeShare >= 0.6) trustBadge = "likely-fake";
    else if (total >= 5 && fakeShare <= 0.2) trustBadge = "community-trusted";
    else trustBadge = "disputed";
  }

  const handleVote = useCallback(
    async (vote: "real" | "fake") => {
      if (!voterHash) return;
      setSubmitting(true);
      setVoteMessage(null);

      const formData = new FormData();
      formData.append("internship_id", internshipId);
      formData.append("vote", vote);
      formData.append("reason", vote === "fake" && showReason ? reason : "");
      formData.append("voter_hash", voterHash);

      try {
        const result = await voteOnInternship(formData);
        if (result.error) {
          setVoteMessage({ type: "error", text: result.error });
        } else {
          setMyVote(vote);
          setRealVotes(result.real_votes ?? 0);
          setFakeVotes(result.fake_votes ?? 0);
          setVoteMessage({ type: "success", text: `Voted ${vote}!` });
          if (showReason) setShowReason(false);
          if (reason) setReason("");
        }
      } catch {
        setVoteMessage({ type: "error", text: "Failed to vote. Try again." });
      } finally {
        setSubmitting(false);
      }
    },
    [internshipId, voterHash, showReason, reason]
  );

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", compact ? "p-3" : "p-4", className)}>
      {voteMessage && (
        <div
          className={cn(
            "mb-3 px-3 py-2 rounded text-sm",
            voteMessage.type === "success"
              ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300"
              : "bg-destructive/10 dark:bg-destructive/30 text-destructive dark:text-destructive/40"
          )}
        >
          {voteMessage.text}
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-4 h-4" />
        <span
          className={cn(
            "text-xs font-bold uppercase tracking-wider",
            trustBadge === "community-trusted"
              ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
              : trustBadge === "no-votes"
              ? "bg-muted dark:bg-muted/30 text-muted-foreground"
              : trustBadge === "disputed"
              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
              : "bg-destructive/10 dark:bg-destructive/30 text-destructive dark:text-destructive/40"
          )}
        >
          {trustBadge === "community-trusted"
            ? "Community Trusted"
            : trustBadge === "no-votes"
            ? "No Votes Yet"
            : trustBadge === "disputed"
            ? "Disputed"
            : "Likely Fake"}
        </span>
      </div>

      {trustBadge === "likely-fake" && (
        <div className="mb-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
            <p className="text-sm text-destructive dark:text-destructive/40">
              This listing has been flagged as potentially fake by the community. Verify before applying.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleVote("real")}
              disabled={submitting || myVote === "real"}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                myVote === "real"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 shadow-sm"
                  : "bg-secondary text-foreground/60 hover:bg-green-50/50 hover:text-green-600 dark:hover:text-green-400"
              )}
            >
              <ThumbsUp className="w-3 h-3" />
              <span>Looks Real</span>
            </button>
            <span className="text-xs font-medium text-foreground">{realVotes}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setShowReason(true);
                handleVote("fake");
              }}
              disabled={submitting || myVote === "fake"}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                myVote === "fake"
                  ? "bg-destructive/10 dark:bg-destructive/30 text-destructive dark:text-destructive/40 shadow-sm"
                  : "bg-secondary text-foreground/60 hover:bg-destructive/50 hover:text-destructive dark:hover:text-destructive/40"
              )}
            >
              <ThumbsDown className="w-3 h-3" />
              <span>Looks Fake</span>
            </button>
            <span className="text-xs font-medium text-foreground">{fakeVotes}</span>
          </div>
        </div>

        {total > 0 && (
          <>
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  realPct > fakePct ? "bg-green-500" : "bg-destructive"
                )}
                style={{ width: `${Math.max(realPct, fakePct)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Real {realPct}%</span>
              <span>Fake {fakePct}%</span>
            </div>
          </>
        )}

        {showReason && myVote === "fake" && (
          <div className="mt-2">
            <label className="text-xs font-medium text-foreground/70 block mb-1">
              Why do you think it's fake?
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-2 py-1.5 rounded border border-border bg-background text-sm outline-none focus:ring-1 focus-ring-primary"
            >
              <option value="">Select a reason</option>
              <option value="asked_money">Asked for money or payment</option>
              <option value="no_company_info">No company information</option>
              <option value="suspicious_contact">Suspicious contact details</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}

        {total === 0 && (
          <p className="text-xs text-muted-foreground text-center">No votes yet. Be the first to vote!</p>
        )}
      </div>

      {compact && total > 0 && (
        <div className="mt-2 text-[10px] text-muted-foreground flex justify-between">
          <span>{realVotes} Real</span>
          <span>{fakeVotes} Fake</span>
        </div>
      )}
    </div>
  );
}
