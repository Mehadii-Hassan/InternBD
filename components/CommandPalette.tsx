"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: "internship" | "company" | "category" | "location" | "page";
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: React.ReactNode;
}

const SEARCH_RESULTS: SearchResult[] = [
  {
    type: "page",
    id: "post",
    title: "Post an Internship",
    subtitle: "Submit a new internship listing",
    href: "/post",
    icon: <Clock className="w-4 h-4" />,
  },
  {
    type: "page",
    id: "internships",
    title: "All Internships",
    subtitle: "Browse all available internships",
    href: "/internships",
    icon: <Search className="w-4 h-4" />,
  },
  {
    type: "page",
    id: "companies",
    title: "Companies",
    subtitle: "Browse companies offering internships",
    href: "/companies",
    icon: <Search className="w-4 h-4" />,
  },
  {
    type: "page",
    id: "categories",
    title: "Categories",
    subtitle: "Browse internships by category",
    href: "/categories",
    icon: <Search className="w-4 h-4" />,
  },
  {
    type: "page",
    id: "locations",
    title: "Locations",
    subtitle: "Browse internships by location",
    href: "/locations",
    icon: <Search className="w-4 h-4" />,
  },
];

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, SEARCH_RESULTS.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const result = SEARCH_RESULTS[selectedIndex];
        if (result) {
          window.location.href = result.href;
        }
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, onClose]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const filteredResults = SEARCH_RESULTS.filter((r) =>
    r.title.toLowerCase().includes(query.toLowerCase()) ||
    r.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      ref={ref}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="w-full max-w-md mx-auto p-4">
        <div className="bg-card border border-input rounded-xl shadow-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-input">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search internships, companies, categories..."
                className="flex-1 bg-transparent text-foreground text-sm outline-none focus:ring-0"
                autoFocus
              />
              <button
                onClick={() => setQuery("")}
                className="text-muted-foreground hover:text-foreground/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filteredResults.length === 0 ? (
              <div className="px-4 py-4 text-center text-sm text-muted-foreground">
                No results found
              </div>
            ) : (
              filteredResults.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => {
                    window.location.href = result.href;
                    onClose();
                  }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                    selectedIndex === index
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-secondary/50"
                  )}
                >
                  <div className="w-8 h-8 rounded bg-secondary/50 flex items-center justify-center text-muted-foreground">
                    {result.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{result.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{result.type}</div>
                </button>
              ))
            )}
          </div>
          <div className="px-4 py-2 border-t border-input bg-secondary/50">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">⌘K</span> Search • <span className="font-medium">Esc</span> Close
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
