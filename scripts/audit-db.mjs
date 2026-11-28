import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^"|"$/g, "");
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = createClient(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

let failures = 0;

function check(label, fn) {
  const res = fn();
  if (res.error) {
    console.log(`${label}: BLOCKED (${res.error.message})`);
  } else if (res.data === null || res.data === undefined) {
    console.log(`${label}: BLOCKED (no data returned)`);
  } else if (Array.isArray(res.data) && res.data.length === 0 && !res.count) {
    console.log(`${label}: OK - 0 rows (blocked)`);
  } else {
    console.log(`${label}: EXPOSED (${res.count ?? res.data.length} rows)`);
    failures++;
  }
}

async function main() {
  console.log("=== anon SELECT private tables (should be blocked) ===");
  for (const t of ["votes", "reports", "removal_requests", "admin_actions", "scrape_runs", "scrape_sources"]) {
    const r = await anon.from(t).select("*", { count: "exact", head: true });
    const blocked = r.error || r.count === 0 || r.count === null;
    console.log(`ANON SELECT ${t}: ${blocked ? "BLOCKED (ok)" : "EXPOSED"}`);
    if (!blocked) failures++;
  }

  console.log("\n=== anon INSERT internships (should be blocked) ===");
  const ins = await anon.from("internships").insert([{
    title: "audit test",
    company_name: "audit co",
    category: "Software/IT",
    location: "Dhaka",
    work_mode: "On-site",
    is_paid: "Paid",
    duration: "3 months",
    deadline: "2026-12-31",
    description: "audit",
    source: "manual",
    source_name: "audit",
    status: "pending",
  }]);
  console.log(`ANON INSERT internships: ${ins.error ? "BLOCKED (ok): " + ins.error.message : "EXPOSED - INSERT SUCCEEDED"}`);
  if (!ins.error) failures++;

  console.log("\n=== anon UPDATE internships (should be blocked) ===");
  const upd = await anon.from("internships").update({ title: "audit updated" }).eq("title", "audit test");
  console.log(`ANON UPDATE internships: ${upd.error ? "BLOCKED (ok): " + upd.error.message : "EXPOSED - UPDATE SUCCEEDED"}`);
  if (!upd.error) failures++;

  console.log("\n=== anon DELETE internships (should be blocked) ===");
  const del = await anon.from("internships").delete().eq("title", "audit test");
  console.log(`ANON DELETE internships: ${del.error ? "BLOCKED (ok): " + del.error.message : "EXPOSED - DELETE SUCCEEDED"}`);
  if (!del.error) failures++;

  console.log("\n=== anon SELECT votes.voter_hash (should be blocked) ===");
  const vh = await anon.from("votes").select("voter_hash");
  console.log(`ANON SELECT votes.voter_hash: ${vh.error ? "BLOCKED (ok): " + vh.error.message : "EXPOSED - " + (vh.data?.length ?? 0) + " rows"}`);
  if (!vh.error) failures++;

  console.log("\n=== anon SELECT internships aggregated (should succeed) ===");
  const agg = await anon.from("internships").select("id, title, real_votes, fake_votes, trust_score").limit(3);
  console.log(`ANON SELECT internships aggregated: ${agg.error ? "BLOCKED (bad): " + agg.error.message : "OK - " + (agg.data?.length ?? 0) + " rows"}`);

  console.log("\n=== RESULT ===", failures === 0 ? "ALL CHECKS PASSED" : `${failures} FAILURES`);
}

main();
