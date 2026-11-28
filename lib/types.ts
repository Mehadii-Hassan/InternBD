export type Category =
  | "Software/IT"
  | "Marketing"
  | "Design"
  | "Finance"
  | "HR"
  | "Business"
  | "Data/AI"
  | "Content Writing"
  | "Engineering"
  | "Others";

export type Location =
  | "Dhaka"
  | "Chattogram"
  | "Rajshahi"
  | "Sylhet"
  | "Khulna"
  | "Barishal"
  | "Rangpur"
  | "Mymensingh"
  | "Remote";

export type Department =
  | "CSE"
  | "EEE"
  | "BBA"
  | "Marketing"
  | "Finance"
  | "Accounting"
  | "English"
  | "Law"
  | "Pharmacy"
  | "Civil"
  | "Mechanical"
  | "Textile"
  | "Architecture"
  | "Design"
  | "Media"
  | "Others";

export type PaidStatus = "Paid" | "Unpaid";
export type WorkMode = "On-site" | "Remote" | "Hybrid";
export type Duration = "1 month" | "2 months" | "3 months" | "6 months" | "12 months";
export type InternshipStatus = "pending" | "approved" | "rejected" | "expired";
export type InternshipSource = "scraped" | "hr" | "manual";

export interface Internship {
  id: string;
  title: string;
  company_name: string;
  company_slug: string | null;
  company_logo_url: string | null;
  company_email: string | null;
  category: Category;
  department: Department | null;
  location: Location;
  division: string | null;
  work_mode: WorkMode;
  is_paid: PaidStatus;
  stipend: string | null;
  duration: Duration;
  deadline: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  apply_link: string | null;
  apply_email: string | null;
  how_to_apply: string | null;
  source: InternshipSource;
  source_name: string | null;
  source_url: string | null;
  status: InternshipStatus;
  is_verified: boolean;
  is_featured: boolean;
  is_sample: boolean;
  report_count: number;
  trust_score: number;
  real_votes: number;
  fake_votes: number;
  scraped_at: string | null;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  career_url: string | null;
  logo_url: string | null;
  is_trusted: boolean;
  is_sample: boolean;
  created_at: string;
}

export interface ScrapeRun {
  id: string;
  started_at: string;
  finished_at: string | null;
  source_name: string;
  found: number;
  inserted: number;
  skipped_duplicates: number;
  errors: number;
  status: string;
  created_at: string;
}

export interface Report {
  id: string;
  internship_id: string;
  reason: string;
  ip_hash: string;
  created_at: string;
}

export const CATEGORIES: Category[] = [
  "Software/IT",
  "Marketing",
  "Design",
  "Finance",
  "HR",
  "Business",
  "Data/AI",
  "Content Writing",
  "Engineering",
  "Others",
];

export const LOCATIONS: Location[] = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Sylhet",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh",
  "Remote",
];

export const DEPARTMENTS: Department[] = [
  "CSE",
  "EEE",
  "BBA",
  "Marketing",
  "Finance",
  "Accounting",
  "English",
  "Law",
  "Pharmacy",
  "Civil",
  "Mechanical",
  "Textile",
  "Architecture",
  "Design",
  "Media",
  "Others",
];

export const DURATIONS: Duration[] = [
  "1 month",
  "2 months",
  "3 months",
  "6 months",
  "12 months",
];

export const PAID_STATUSES: PaidStatus[] = ["Paid", "Unpaid"];
export const WORK_MODES: WorkMode[] = ["On-site", "Remote", "Hybrid"];
export const INTERNSHIP_STATUSES: InternshipStatus[] = [
  "pending",
  "approved",
  "rejected",
  "expired",
];

export interface Vote {
  id: string;
  internship_id: string;
  vote: "real" | "fake";
  reason: string | null;
  voter_hash: string;
  created_at: string;
}

export interface RemovalRequest {
  id: string;
  internship_id: string;
  post_url: string;
  reason: string;
  requester_email: string | null;
  status: string;
  created_at: string;
}

export interface AdminAction {
  id: string;
  admin_ip_hash: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: string | null;
  created_at: string;
}

export type TrustBadge = "verified" | "community-trusted" | "no-votes" | "disputed" | "likely-fake";

export const TRUST_BADGE_THRESHOLDS = {
  min_votes_for_community: 5,
  fake_share_for_likely_fake: 0.6,
};

export const LOCATION_LABELS: Record<Location, string> = {
  Dhaka: "Dhaka",
  Chattogram: "Chattogram",
  Rajshahi: "Rajshahi",
  Sylhet: "Sylhet",
  Khulna: "Khulna",
  Barishal: "Barishal",
  Rangpur: "Rangpur",
  Mymensingh: "Mymensingh",
  Remote: "Remote",
};
