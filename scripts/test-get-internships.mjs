import { getInternships } from "./lib/actions/internships";

getInternships({ limit: 12, sort: "newest" })
  .then((r) => {
    console.log("Result:", r.internships?.length, "internships, total:", r.total, "error:", r.error);
  })
  .catch((e) => console.error("Error:", e.message));
