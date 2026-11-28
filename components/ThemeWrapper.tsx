"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CookieNotice } from "@/components/CookieNotice";
import { AdSlot } from "@/components/AdSlot";
import { CommandPalette } from "@/components/CommandPalette";

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Only trigger if not in an input
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA" && !(target as HTMLElement).isContentEditable) {
          e.preventDefault();
          setCommandPaletteOpen(true);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="internbd-theme">
      <Navbar />
      <AdSlot />
      <main>{children}</main>
      <Footer />
      <CookieNotice />
      <AdSlot />
      {commandPaletteOpen && (
        <CommandPalette onClose={() => setCommandPaletteOpen(false)} />
      )}
    </NextThemesProvider>
  );
}
