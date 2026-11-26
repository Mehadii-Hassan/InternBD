import type { Metadata } from "next";
import type { ReactNode } from "react";
import ThemeWrapper from "@/components/ThemeWrapper";
import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://internbd.com"),
  title: "InternBD - Find Your First Internship in Bangladesh",
  description: "Discover the best internships in Bangladesh for students and fresh graduates. Software, Marketing, Design, Finance, HR, Data/AI and more.",
  keywords: ["internship bangladesh", "internship dhaka", "internship chittagong", "student internship", "fresh graduate"],
  openGraph: {
    title: "InternBD - Find Your First Internship in Bangladesh",
    description: "Discover the best internships in Bangladesh for students and fresh graduates.",
    type: "website",
    url: "https://internbd.com",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ThemeWrapper>{children}</ThemeWrapper>
      </body>
    </html>
  );
}