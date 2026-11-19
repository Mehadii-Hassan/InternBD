"use client";

import { useState } from "react";
import { toggleSaved, isSaved } from "@/lib/storage";
import { Bookmark, BookmarkCheck } from "lucide-react";

interface BookmarkButtonProps {
  internshipId: string;
}

export function BookmarkButton({ internshipId }: BookmarkButtonProps) {
  const [saved, setSaved] = useState<boolean>(isSaved(internshipId));

  function handleClick() {
    const nowSaved = toggleSaved(internshipId);
    setSaved(nowSaved);
  }

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-md hover:bg-muted transition-colors"
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