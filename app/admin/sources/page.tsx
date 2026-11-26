"use client";

import { useState } from "react";
import { toggleCompanyTrust } from "@/lib/actions/admin";
import { Shield, Plus } from "lucide-react";

interface ScrapeSource {
  id: string;
  name: string;
  url: string;
  type: string;
  is_active: boolean;
  is_trusted: boolean;
  created_at: string;
}

const MOCK_SOURCES: ScrapeSource[] = [
  { id: "1", name: "Commure Bangladesh", url: "https://jobs.ashbyhq.com/commure", type: "ashby_html", is_active: true, is_trusted: true, created_at: "2026-11-20" },
  { id: "2", name: "Field Nation (Lever)", url: "https://jobs.lever.co/fieldnation", type: "ats_json", is_active: true, is_trusted: true, created_at: "2026-11-20" },
  { id: "3", name: "RWS TrainAI (Lever)", url: "https://jobs.lever.co/rws", type: "ats_json", is_active: true, is_trusted: true, created_at: "2026-11-20" },
  { id: "4", name: "Bangladesh Software Solution", url: "https://bssoln.com/careers", type: "html", is_active: true, is_trusted: true, created_at: "2026-11-20" },
];

export default function SourcesPage() {
  const [sources, setSources] = useState<ScrapeSource[]>(MOCK_SOURCES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSource, setNewSource] = useState({ name: "", url: "", type: "html", is_trusted: false });

  async function handleToggleTrust(slug: string, current: boolean) {
    const formData = new FormData();
    formData.append("company_slug", slug);
    formData.append("is_trusted", String(!current));

    try {
      const result = await toggleCompanyTrust(formData);
      if (result.error) {
        alert(result.error);
      } else {
        setSources(sources.map((s) => (s.name.toLowerCase().replace(/\s+/g, "-") === slug ? { ...s, is_trusted: !current } : s)));
      }
    } catch {
      alert("Failed to update trust status");
    }
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground text-bangla">Scrape Sources</h1>
            <p className="text-muted-foreground text-sm">Manage automatic internship collection sources.</p>
          </div>
          <button
            onClick={() => setEditingId("new")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Source
          </button>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-3 font-medium">Source</th>
                <th className="pb-3 font-medium hidden sm:table-cell">Type</th>
                <th className="pb-3 font-medium hidden sm:table-cell">Status</th>
                <th className="pb-3 font-medium hidden sm:table-cell">Trusted</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {editingId === "new" ? (
                <tr className="border-b border-border bg-secondary/50">
                  <td className="py-3">
                    <input
                      className="w-full px-2 py-1 rounded border border-border bg-background text-sm outline-none focus:ring-1 focus-ring-primary"
                      placeholder="Source name"
                      value={newSource.name}
                      onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                    />
                  </td>
                  <td className="py-3 hidden sm:table-cell">
                    <select
                      className="w-full px-2 py-1 rounded border border-border bg-background text-sm outline-none focus:ring-1 focus-ring-primary"
                      value={newSource.type}
                      onChange={(e) => setNewSource({ ...newSource, type: e.target.value as any })}
                    >
                      <option value="html">HTML Page</option>
                      <option value="ats_json">Lever JSON API</option>
                      <option value="ashby_html">Ashby Careers</option>
                    </select>
                  </td>
                  <td className="py-3 hidden sm:table-cell">
                    <span className="text-xs font-medium text-green-600">Active</span>
                  </td>
                  <td className="py-3 hidden sm:table-cell">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newSource.is_trusted}
                        onChange={(e) => setNewSource({ ...newSource, is_trusted: e.target.checked })}
                        className="w-4 h-4 rounded border-border text-primary accent-primary"
                      />
                      Trusted
                    </label>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => {
                        setEditingId(null);
                      }}
                      className="px-2 py-1 rounded bg-green-50 text-green-600 text-xs font-medium hover:bg-green-100 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2 py-1 rounded bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors ml-1"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ) : (
                sources.map((source) => (
                  <tr key={source.id} className="border-b border-border/50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3 text-muted-foreground" />
                        <span className="text-foreground">{source.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-xs text-muted-foreground hidden sm:table-cell">
                      {source.type}
                    </td>
                    <td className="py-3 text-xs text-muted-foreground hidden sm:table-cell">
                      <span className="text-xs font-medium text-green-600">Active</span>
                    </td>
                    <td className="py-3 hidden sm:table-cell">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={source.is_trusted}
                          onChange={() => handleToggleTrust(source.name.toLowerCase().replace(/\s+/g, "-"), source.is_trusted)}
                          className="w-4 h-4 rounded border-border text-primary accent-primary"
                        />
                        {source.is_trusted ? "Trusted" : "Not Trusted"}
                      </label>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => alert("Edit source functionality coming soon")}
                        className="px-2 py-1 rounded bg-secondary text-foreground/60 text-xs font-medium hover:bg-secondary/80 transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-xs text-muted-foreground">
          <p>Sources are scraped automatically every day at 06:00 Bangladesh time via GitHub Actions. Trusted sources have their submissions auto-approved.</p>
        </div>
      </div>
    </div>
  );
}
