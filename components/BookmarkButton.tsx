"use client";

import { useState } from "react";
import { toggleSaved, isSaved } from "@/lib/storage";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  internshipId: string;
  className?: string;
}

export function BookmarkButton({ internshipId, className }: BookmarkButtonProps) {
  const [saved, setSaved] = useState<boolean>(isSaved(internshipId));

  function handleClick() {
    const nowSaved = toggleSaved(internshipId);
    setSaved(nowSaved);
  }

  return (
    <button
      onClick={handleClick}
      className={cn("p-2 rounded-md hover:bg-muted transition-colors", className)}
      aria-label={saved ? "Remove bookmark" : "Bookmark"}
    >
      {saved ? (
        <BookmarkCheck className="w-4 h-4 text-amber-500" />
      ) : (
        <Bookmark className="w-4 h-4 text-foreground/50" />
      )}
    </button>
  );
}
