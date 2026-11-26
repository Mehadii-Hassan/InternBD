"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_PASSWORD_HASH_KEY = "internbd_admin_hash";

export async function verifyAdminPassword(formData: FormData) {
  const password = formData.get("password") as string;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword) {
    return { success: false, error: "Admin password not configured" };
  }

  if (password !== expectedPassword) {
    return { success: false, error: "Invalid password" };
  }

  const cookieStore = await cookies();
  cookieStore.set("internbd_admin", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return { success: true };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.set("internbd_admin", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  redirect("/");
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const admin = cookieStore.get("internbd_admin");
  return admin?.value === "1";
}

export async function requireAdmin() {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    redirect("/admin/login");
  }
}

export async function logAdminAction(action: string, targetType: string, targetId: string | null, details: string | null) {
  const supabase = createServiceClient();
  const cookieStore = await cookies();
  const ipHash = cookieStore.get("internbd_admin_ip")?.value || "unknown";

  await supabase.from("admin_actions").insert([
    {
      admin_ip_hash: ipHash,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
    },
  ]);
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

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const { count: newThisWeek } = await supabase
    .from("internships")
    .select("*", { count: "exact", head: true })
    .gte("created_at", weekAgo.toISOString());

  // Posts by source
  const { data: bySource } = await supabase
    .from("internships")
    .select("source")
    .eq("status", "approved");

  // Posts by category
  const { data: byCategory } = await supabase
    .from("internships")
    .select("category")
    .eq("status", "approved");

  // Posts by location
  const { data: byLocation } = await supabase
    .from("internships")
    .select("location")
    .eq("status", "approved");

  // Top companies
  const { data: byCompany } = await supabase
    .from("internships")
    .select("company_name")
    .eq("status", "approved");

  const countBy = (arr: any[], field: string) => {
    const counts: Record<string, number> = {};
    for (const row of arr) {
      const v = row[field];
      if (v) counts[v] = (counts[v] || 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  };

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
    bySource: countBy(bySource || [], "source"),
    byCategory: countBy(byCategory || [], "category"),
    byLocation: countBy(byLocation || [], "location"),
    topCompanies: countBy(byCompany || [], "company_name"),
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

export async function getRemovalRequests() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("removal_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    return { requests: [], error: error.message };
  }

  return { requests: (data || []) as any[], error: null };
}

export async function moderateInternship(formData: FormData) {
  const supabase = createServiceClient();

  const internshipId = formData.get("internship_id") as string;
  const action = formData.get("action") as string;

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
    await logAdminAction("delete_internship", "internship", internshipId, `Deleted ${internshipId}`);
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

  await logAdminAction(adminAction, "internship", internshipId, `${adminAction} ${internshipId}`);

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

  await logAdminAction(
    isTrusted ? "trust_company" : "untrust_company",
    "company",
    null,
    `${isTrusted ? "Trusted" : "Untrusted"} company ${companySlug}`
  );

  return { success: true };
}

export async function removeAllSampleData() {
  const supabase = createServiceClient();

  const { error } = await supabase.from("internships").delete().eq("is_sample", true);
  const { error: error2 } = await supabase.from("companies").delete().eq("is_sample", true);

  if (error || error2) {
    return { success: false, error: error?.message || error2?.message };
  }

  await logAdminAction("remove_all_sample_data", "system", null, "Removed all sample data");

  return { success: true };
}

export async function getAdminActions() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("admin_actions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return { actions: [], error: error.message };
  }

  return { actions: (data || []) as any[], error: null };
}
