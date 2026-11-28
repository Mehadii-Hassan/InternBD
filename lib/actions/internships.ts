"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/actions/rateLimit";
import { headers } from "next/headers";
import type { Internship } from "@/lib/types";

export async function getInternships({
  search,
  company,
  category,
  location,
  department,
  paid,
  mode,
  duration,
  deadline,
  posted,
  verified,
  sort,
  page = 1,
  limit = 12,
}: {
  search?: string;
  company?: string;
  category?: string;
  location?: string;
  department?: string;
  paid?: string;
  mode?: string;
  duration?: string;
  deadline?: string;
  posted?: string;
  verified?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const supabase = createServiceClient();

  const showSample = process.env.SHOW_SAMPLE_DATA === "true";

  let query = supabase
    .from("internships")
    .select("*", { count: "exact" })
    .eq("status", "approved");

  if (!showSample) {
    query = query.eq("is_sample", false);
  }

  if (search) {
    query = query.ilike("title", `%${search}%`).or(`title.ilike.%${search}%,company_name.ilike.%${search}%`);
  }
  if (company) {
    query = query.eq("company_name", company);
  }
  if (category) query = query.eq("category", category);
  if (location) query = query.eq("location", location);
  if (department) query = query.eq("department", department);
  if (paid) query = query.eq("is_paid", paid);
  if (mode) query = query.eq("work_mode", mode);
  if (duration) query = query.eq("duration", duration);
  if (verified) query = query.eq("is_verified", true);

  // Deadline filter
  if (deadline && deadline !== "any") {
    const now = new Date();
    let futureDate: Date;
    if (deadline === "week") {
      futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else if (deadline === "month") {
      futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    } else {
      futureDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    }
    query = query.lte("deadline", futureDate.toISOString().split("T")[0]);
  }

  // Posted filter
  if (posted && posted !== "any") {
    const now = new Date();
    let pastDate: Date;
    if (posted === "24h") {
      pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (posted === "7d") {
      pastDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (posted === "30d") {
      pastDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      pastDate = new Date(0);
    }
    query = query.gte("created_at", pastDate.toISOString());
  }

  // Sort
  if (sort === "newest") {
    query = query.order("created_at", { ascending: false });
  } else if (sort === "deadline") {
    query = query.order("deadline", { ascending: true });
  } else if (sort === "stipend") {
    // Can't easily sort by stipend string in SQL, do it in JS
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Supabase error:", error);
    return { internships: [], total: 0, error: error.message };
  }

  let internships = (data || []) as Internship[];

  // Sort by stipend in JS (string parsing)
  if (sort === "stipend") {
    internships.sort((a, b) => {
      const pa = parseInt((a.stipend || "").replace(/[^\d]/g, ""));
      const pb = parseInt((b.stipend || "").replace(/[^\d]/g, ""));
      return (pb || 0) - (pa || 0);
    });
  }

  return { internships, total: count || 0, error: null };
}

export async function getInternshipById(id: string) {
  const supabase = createServiceClient();
  const showSample = process.env.SHOW_SAMPLE_DATA === "true";

  let query = supabase
    .from("internships")
    .select("*")
    .eq("id", id)
    .eq("status", "approved");

  if (!showSample) {
    query = query.eq("is_sample", false);
  }

  const { data, error } = await query.single();

  if (error) {
    return { internship: null, error: error.message };
  }

  return { internship: data as Internship, error: null };
}

export async function getRelatedInternships(id: string, category: string, limit = 3) {
  const supabase = createServiceClient();
  const showSample = process.env.SHOW_SAMPLE_DATA === "true";

  let query = supabase
    .from("internships")
    .select("*")
    .eq("category", category)
    .eq("status", "approved")
    .neq("id", id)
    .limit(limit);

  if (!showSample) {
    query = query.eq("is_sample", false);
  }

  const { data, error } = await query;

  if (error) {
    return { internships: [], error: error.message };
  }

  return { internships: (data || []) as Internship[], error: null };
}

export async function getStats() {
  const supabase = createServiceClient();
  const showSample = process.env.SHOW_SAMPLE_DATA === "true";

  let totalQuery = supabase.from("internships").select("*", { count: "exact", head: true }).eq("status", "approved");
  if (!showSample) {
    totalQuery = totalQuery.eq("is_sample", false);
  }

  const [{ data: total }, { data: companies }, { data: newToday }] = await Promise.all([
    totalQuery,
    supabase.from("companies").select("slug", { count: "exact", head: true }).eq("is_sample", true),
    (async () => {
      let q = supabase
        .from("internships")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved")
        .eq("is_sample", true);
      if (!showSample) {
        q = q.eq("is_sample", false);
      }
      return q;
    })(),
  ]);

  return {
    totalInternships: total?.length ?? 0,
    totalCompanies: companies?.length ?? 0,
    newToday: newToday?.length ?? 0,
  };
}

export async function getFilterCounts() {
  const supabase = createServiceClient();
  const showSample = process.env.SHOW_SAMPLE_DATA === "true";

  let catQuery = supabase.from("internships").select("category").eq("status", "approved");
  let locQuery = supabase.from("internships").select("location").eq("status", "approved");
  let deptQuery = supabase.from("internships").select("department").eq("status", "approved");

  if (!showSample) {
    catQuery = catQuery.eq("is_sample", false);
    locQuery = locQuery.eq("is_sample", false);
    deptQuery = deptQuery.eq("is_sample", false);
  }

  const [catRes, locRes, deptRes] = await Promise.all([catQuery, locQuery, deptQuery]);

  const countBy = (arr: any[], field: string) => {
    const counts: Record<string, number> = {};
    for (const row of arr) {
      const v = row[field];
      if (v) counts[v] = (counts[v] || 0) + 1;
    }
    return counts;
  };

  return {
    categories: countBy(catRes.data || [], "category"),
    locations: countBy(locRes.data || [], "location"),
    departments: countBy(deptRes.data || [], "department"),
  };
}

export async function getCompanies() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("internships")
    .select("company_name")
    .eq("status", "approved");

  if (error) {
    return { companies: [], error: error.message };
  }

  const counts: Record<string, number> = {};
  for (const row of data || []) {
    const name = row.company_name;
    if (name) counts[name] = (counts[name] || 0) + 1;
  }

  const companies = Object.entries(counts).map(([name, count]) => ({
    name,
    count,
  }));

  return { companies, error: null };
}

export async function createInternship(formData: FormData) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || 
             headersList.get("x-real-ip") || 
             "unknown";

  const rateLimitResult = await rateLimit(ip);
  if (!rateLimitResult.allowed) {
    return { success: false, error: "Too many requests. Please try again later." };
  }

  const supabase = createServiceClient();

  const title = formData.get("title") as string;
  const companyName = formData.get("company_name") as string;
  const companyEmail = formData.get("company_email") as string;
  const companyLogoUrl = formData.get("company_logo_url") as string;
  const category = formData.get("category") as string;
  const location = formData.get("location") as string;
  const department = formData.get("department") as string;
  const paidStatus = formData.get("paid_status") as string;
  const workMode = formData.get("work_mode") as string;
  const duration = formData.get("duration") as string;
  const stipend = formData.get("stipend") as string;
  const deadline = formData.get("deadline") as string;
  const description = formData.get("description") as string;
  const requirements = formData.get("requirements") as string;
  const responsibilities = formData.get("responsibilities") as string;
  const applyLink = formData.get("apply_link") as string;
  const applyEmail = formData.get("apply_email") as string;
  const submitterType = formData.get("submitter_type") as string;
  const submitterEmail = formData.get("submitter_email") as string;
  const voterHash = formData.get("voter_hash") as string;
  const honeypot = formData.get("honeypot") as string;

  // Honeypot check - if filled, it's a bot
  if (honeypot && honeypot.trim()) {
    return { success: false, error: "Spam detected" };
  }

  // Basic validation
  if (!title || !companyName || !category || !location || !description || !deadline) {
    return { success: false, error: "Required fields missing" };
  }

  // Deadline not in the past
  const deadlineDate = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (deadlineDate < today) {
    return { success: false, error: "Deadline cannot be in the past" };
  }

  // Minimum description length
  if (description.length < 20) {
    return { success: false, error: "Description must be at least 20 characters" };
  }

  // Block obvious spam words
  const spamWords = ["earn money", "work from home", "get rich", "make money fast", "no experience needed", "part time easy money"];
  const lowerText = `${title} ${description} ${companyName}`.toLowerCase();
  for (const spam of spamWords) {
    if (lowerText.includes(spam)) {
      return { success: false, error: "Content contains blocked terms" };
    }
  }

  // Rate limit by IP hash (max 3 submissions per hour per IP)
  if (voterHash) {
    const { count: recentCount } = await supabase
      .from("internships")
      .select("*", { count: "exact", head: true })
      .eq("source", "hr")
      .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString());
    if (recentCount && recentCount >= 3) {
      return { success: false, error: "Too many submissions. Try again later." };
    }
  }

  // Check for duplicate by same company + title or same apply link
  const existingByTitle = await supabase
    .from("internships")
    .select("id")
    .eq("company_name", companyName)
    .eq("title", title)
    .single();
  if (existingByTitle.data) {
    return { success: false, error: "A post with this company and title already exists" };
  }

  if (applyLink) {
    const existingByLink = await supabase
      .from("internships")
      .select("id")
      .eq("apply_link", applyLink)
      .single();
    if (existingByLink.data) {
      return { success: false, error: "A post with this apply link already exists" };
    }
  }

  // Normalize company name (trim, lowercase) for slug generation and comparison
  const normalizedCompanyName = companyName.trim();
  const companySlug = normalizedCompanyName.toLowerCase().replace(/\s+/g, "-");

  // Ensure company exists (FK constraint on company_slug).
  // INSERT ONLY — never update or touch is_trusted/is_verified/website/logo of an existing company.
  // Public submissions always create companies with is_trusted = false.
  // Ensure company exists (FK constraint on company_slug).
  // SELECT-then-INSERT only — never UPDATE or touch is_trusted/is_verified/website/logo of an existing company.
  // Public submissions always create companies with is_trusted = false.
  const { data: existingCompany } = await supabase
    .from("companies")
    .select("slug")
    .eq("slug", companySlug)
    .single();

  if (!existingCompany) {
    await supabase.from("companies").insert({
      slug: companySlug,
      name: normalizedCompanyName,
      is_trusted: false,
      is_sample: false,
    });
  }

  // Public submissions always start as 'pending'. Never auto-approve, even for trusted companies.
  // Auto-approve is reserved for scraper-inserted rows from trusted sources only.
  const { data, error } = await supabase
    .from("internships")
    .insert([
      {
        title,
        company_name: normalizedCompanyName,
        company_slug: companySlug,
        company_logo_url: companyLogoUrl || null,
        company_email: submitterEmail || companyEmail || null,
        category,
        department: department || null,
        location,
        division: location,
        work_mode: workMode,
        is_paid: paidStatus,
        stipend: stipend || null,
        duration: duration as any,
        deadline,
        description,
        requirements: requirements ? requirements.split(",").map((r) => r.trim()).filter(Boolean) : [],
        responsibilities: responsibilities ? responsibilities.split(",").map((r) => r.trim()).filter(Boolean) : [],
        apply_link: applyLink || null,
        apply_email: applyEmail || null,
        source: submitterType === "company_hr" ? "hr" : "manual",
        source_name: submitterType === "company_hr" ? "HR Submission" : "Community Submission",
        status: "pending",
        is_verified: false,
        is_featured: false,
        is_sample: false,
      },
    ])
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, id: data.id, autoApproved: false };
}

export async function createRemovalRequest(formData: FormData) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || 
             headersList.get("x-real-ip") || 
             "unknown";

  const rateLimitResult = await rateLimit(ip);
  if (!rateLimitResult.allowed) {
    return { success: false, error: "Too many requests. Please try again later." };
  }

  const supabase = createServiceClient();

  const internshipId = formData.get("internship_id") as string;
  const postUrl = formData.get("post_url") as string;
  const reason = formData.get("reason") as string;
  const requesterEmail = formData.get("requester_email") as string;

  if (!internshipId || !postUrl || !reason) {
    return { success: false, error: "Required fields missing" };
  }

  const { error } = await supabase
    .from("removal_requests")
    .insert([
      {
        internship_id: internshipId,
        post_url: postUrl,
        reason,
        requester_email: requesterEmail || null,
        status: "pending",
      },
    ]);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function voteOnInternship(formData: FormData) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || 
             headersList.get("x-real-ip") || 
             "unknown";

  const rateLimitResult = await rateLimit(ip);
  if (!rateLimitResult.allowed) {
    return { success: false, error: "Too many requests. Please try again later." };
  }

  const supabase = createServiceClient();

  const internshipId = formData.get("internship_id") as string;
  const vote = formData.get("vote") as string;
  const reason = formData.get("reason") as string || null;
  const voterHash = formData.get("voter_hash") as string;

  if (!internshipId || !vote || !voterHash) {
    return { success: false, error: "Missing required fields" };
  }

  if (vote !== "real" && vote !== "fake") {
    return { success: false, error: "Invalid vote" };
  }

  // Rate limit: max 5 votes per hour per IP
  const { count: recentVotes } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("voter_hash", voterHash)
    .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString());
  if (recentVotes && recentVotes >= 5) {
    return { success: false, error: "Too many votes. Try again later." };
  }

  // Upsert vote (allow changing vote)
  const { error } = await supabase
    .from("votes")
    .upsert(
      {
        internship_id: internshipId,
        vote,
        reason,
        voter_hash: voterHash,
      },
      { onConflict: "internship_id, voter_hash" }
    );

  if (error) {
    return { success: false, error: error.message };
  }

  // Recalculate vote counts and trust score
  const { data: voteRows } = await supabase
    .from("votes")
    .select("vote")
    .eq("internship_id", internshipId);

  const realVotes = voteRows?.filter((v) => v.vote === "real").length || 0;
  const fakeVotes = voteRows?.filter((v) => v.vote === "fake").length || 0;
  const total = realVotes + fakeVotes;
  const fakeShare = total > 0 ? fakeVotes / total : 0;

  let trustScore = 0;
  if (total >= 5 && fakeShare >= 0.6) {
    trustScore = -50; // likely fake
  } else if (total >= 5 && fakeShare <= 0.2) {
    trustScore = 50; // community trusted
  } else {
    trustScore = 0; // disputed / no clear signal
  }

  await supabase
    .from("internships")
    .update({ real_votes: realVotes, fake_votes: fakeVotes, trust_score: trustScore })
    .eq("id", internshipId);

  return { success: true, real_votes: realVotes, fake_votes: fakeVotes, trust_score: trustScore };
}

export async function getVotesForInternship(internshipId: string) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("votes")
    .select("vote, reason, created_at")
    .eq("internship_id", internshipId)
    .order("created_at", { ascending: false });

  if (error) {
    return { votes: [], real_votes: 0, fake_votes: 0, error: error.message };
  }

  const realVotes = data?.filter((v: any) => v.vote === "real").length || 0;
  const fakeVotes = data?.filter((v: any) => v.vote === "fake").length || 0;

  return { votes: data || [], real_votes: realVotes, fake_votes: fakeVotes, error: null };
}

export async function getAdminStats() {
  const supabase = createServiceClient();

  const [
    { count: total },
    { count: pending },
    { count: approved },
    { count: rejected },
    { count: expired },
    { count: newToday },
    { count: removalRequests },
    { data: scrapeRuns },
  ] = await Promise.all([
    supabase.from("internships").select("*", { count: "exact", head: true }),
    supabase.from("internships").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("internships").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("internships").select("*", { count: "exact", head: true }).eq("status", "rejected"),
    supabase.from("internships").select("*", { count: "exact", head: true }).eq("status", "expired"),
    supabase
      .from("internships")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    supabase.from("removal_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("scrape_runs").select("*").order("created_at", { ascending: false }).limit(10),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const { count: newThisWeek } = await supabase
    .from("internships")
    .select("*", { count: "exact", head: true })
    .gte("created_at", weekAgo.toISOString());

  return {
    total: total || 0,
    pending: pending || 0,
    approved: approved || 0,
    rejected: rejected || 0,
    expired: expired || 0,
    newToday: newToday || 0,
    newThisWeek: newThisWeek || 0,
    removalRequests: removalRequests || 0,
    scrapeRuns: scrapeRuns || [],
  };
}

export async function getPendingInternships() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("internships")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    return { internships: [], error: error.message };
  }

  return { internships: (data || []) as any[], error: null };
}

export async function moderateInternship(formData: FormData) {
  const supabase = createServiceClient();

  const internshipId = formData.get("internship_id") as string;
  const action = formData.get("action") as string; // approve, reject, delete, verify, unverify, feature, unfeature, trust_company, untrust_company

  const { data: internship } = await supabase
    .from("internships")
    .select("company_name")
    .eq("id", internshipId)
    .single();

  if (!internship) {
    return { success: false, error: "Internship not found" };
  }

  const updates: any = {};
  let adminAction = "";

  if (action === "approve") {
    updates.status = "approved";
    adminAction = "approve";
  } else if (action === "reject") {
    updates.status = "rejected";
    adminAction = "reject";
  } else if (action === "delete") {
    await supabase.from("internships").delete().eq("id", internshipId);
    await supabase.from("admin_actions").insert([
      {
        admin_ip_hash: "admin",
        action: "delete_internship",
        target_type: "internship",
        target_id: internshipId,
        details: `Deleted internship ${internshipId}`,
      },
    ]);
    return { success: true };
  } else if (action === "verify") {
    updates.is_verified = true;
    adminAction = "verify_internship";
  } else if (action === "unverify") {
    updates.is_verified = false;
    adminAction = "unverify_internship";
  } else if (action === "feature") {
    updates.is_featured = true;
    adminAction = "feature_internship";
  } else if (action === "unfeature") {
    updates.is_featured = false;
    adminAction = "unfeature_internship";
  }

  if (Object.keys(updates).length > 0) {
    await supabase.from("internships").update(updates).eq("id", internshipId);
  }

  await supabase.from("admin_actions").insert([
    {
      admin_ip_hash: "admin",
      action: adminAction,
      target_type: "internship",
      target_id: internshipId,
      details: `${adminAction} internship ${internshipId}`,
    },
  ]);

  return { success: true };
}

export async function toggleCompanyTrust(formData: FormData) {
  const supabase = createServiceClient();

  const companySlug = formData.get("company_slug") as string;
  const isTrusted = formData.get("is_trusted") === "true";

  const { error } = await supabase
    .from("companies")
    .update({ is_trusted: isTrusted })
    .eq("slug", companySlug);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function removeAllSampleData() {
  const supabase = createServiceClient();

  const { error } = await supabase.from("internships").delete().eq("is_sample", true);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
