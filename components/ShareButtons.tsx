"use client";

import { Share2, Mail, Link as LinkIcon, Copy } from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  function copyLink() {
    navigator.clipboard.writeText(url);
  }

  return (
    <div className="flex gap-2">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors"
      >
        <Share2 className="w-4 h-4" /> WhatsApp
      </a>
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        <Share2 className="w-4 h-4" /> Facebook
      </a>
      <button
        onClick={copyLink}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
      >
        <LinkIcon className="w-4 h-4" /> Copy
      </button>
      <a
        href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
      >
        <Mail className="w-4 h-4" /> Email
      </a>
    </div>
  );
}