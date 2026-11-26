"use server";

import { createServiceClient } from "@/lib/supabase/server";
import type { Internship, Category, Location, Department, PaidStatus, WorkMode, Duration } from "@/lib/types";

export async function getInternships({
  search,
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

  let query = supabase
    .from("internships")
    .select("*", { count: "exact" })
    .eq("status", "approved");

  if (search) {
    query = query.ilike("title", `%${search}%`).or(`title.ilike.%${search}%,company_name.ilike.%${search}%`);
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

  const { data, error } = await supabase
    .from("internships")
    .select("*")
    .eq("id", id)
    .eq("status", "approved")
    .single();

  if (error) {
    return { internship: null, error: error.message };
  }

  return { internship: data as Internship, error: null };
}

export async function getRelatedInternships(id: string, category: string, limit = 3) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("internships")
    .select("*")
    .eq("category", category)
    .eq("status", "approved")
    .neq("id", id)
    .limit(limit);

  if (error) {
    return { internships: [], error: error.message };
  }

  return { internships: (data || []) as Internship[], error: null };
}

export async function getStats() {
  const supabase = createServiceClient();

  const [{ data: total }, { data: companies }, { data: newToday }] = await Promise.all([
    supabase.from("internships").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("companies").select("slug", { count: "exact", head: true }).eq("is_sample", true),
    supabase
      .from("internships")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")
      .eq("is_sample", true),
  ]);

  return {
    totalInternships: total?.length ?? 0,
    totalCompanies: companies?.length ?? 0,
    newToday: newToday?.length ?? 0,
  };
}

export async function getFilterCounts() {
  const supabase = createServiceClient();

  const [catRes, locRes, deptRes] = await Promise.all([
    supabase
      .from("internships")
      .select("category")
      .eq("status", "approved"),
    supabase
      .from("internships")
      .select("location")
      .eq("status", "approved"),
    supabase
      .from("internships")
      .select("department")
      .eq("status", "approved"),
  ]);

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

export async function createInternship(formData: FormData) {
  const supabase = createServiceClient();

  const title = formData.get("title") as string;
  const companyName = formData.get("company_name") as string;
  const companyEmail = formData.get("company_email") as string;
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
  const hrEmail = formData.get("hr_email") as string;

  const { data, error } = await supabase
    .from("internships")
    .insert([
      {
        title,
        company_name: companyName,
        company_email: hrEmail || companyEmail,
        category,
        department: department || null,
        location,
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
        source: "hr",
        source_name: "HR Submission",
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

  return { success: true, id: data.id };
}
