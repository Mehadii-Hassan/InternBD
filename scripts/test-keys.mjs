import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

// read .env.local without printing any key
const env = {};
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^"|"$/g, "");
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = createClient(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const admin = createClient(url, env.SUPABASE_SERVICE_ROLE_KEY);

// 1. how many internships can each key see?
const a = await anon.from("internships").select("id", { count: "exact", head: true });
console.log("ANON internships:", a.count, a.error ? a.error.message : "ok");

const s = await admin.from("internships").select("id", { count: "exact", head: true });
console.log("SERVICE internships:", s.count, s.error ? s.error.message : "ok");

// 2. what can anon see in the private tables?
const tables = ["votes", "reports", "removal_requests", "admin_actions", "scrape_runs", "scrape_sources"];
for (const t of tables) {
  const r = await anon.from(t).select("*", { count: "exact", head: true });
  console.log("ANON", t, "-> rows visible:", r.count, "| error:", r.error ? r.error.message : "none");
}