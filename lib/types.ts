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

export type Location = "Dhaka" | "Chittagong" | "Rajshahi" | "Sylhet" | "Khulna" | "Barishal" | "Rangpur" | "Mymensingh" | "Remote";

export type PaidStatus = "Paid" | "Unpaid";
export type WorkMode = "On-site" | "Remote" | "Hybrid";
export type Duration = "1 month" | "2 months" | "3 months" | "6 months" | "12 months";

export interface Internship {
  id: string;
  title: string;
  company: string;
  logo?: string;
  location: Location;
  category: Category;
  paidStatus: PaidStatus;
  workMode: WorkMode;
  duration: Duration;
  stipend: string;
  deadline: string;
  isNew: boolean;
  isVerified: boolean;
  description: string;
  requirements: string[];
  responsibilities: string[];
  applyLink?: string;
  applyEmail?: string;
  postedAt: string;
  benefits?: string[];
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
  "Chittagong",
  "Rajshahi",
  "Sylhet",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh",
  "Remote",
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