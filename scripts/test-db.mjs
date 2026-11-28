import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^"|"$/g, "");
}

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

sb.from("internships")
  .select("*", { count: "exact", head: true })
  .eq("status", "approved")
  .then((r) => {
    console.log("count:", r.count, "error:", r.error?.message);
  })
  .catch((e) => console.error("ERR:", e.message));
