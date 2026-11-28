"use client";

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CookieNotice } from "@/components/CookieNotice";
import { AdSlot } from "@/components/AdSlot";

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="internbd-theme">
      <Navbar />
      <AdSlot placement="header" />
      <main>{children}</main>
      <Footer />
      <CookieNotice />
      <AdSlot placement="detail" />
    </NextThemesProvider>
  );
}