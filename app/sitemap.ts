import { MetadataRoute } from "next";

const baseUrl = "https://internbd.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/privacy",
    "/terms",
    "/contact",
    "/post",
    "/saved",
    "/companies",
    "/categories",
    "/locations",
    "/safety-tips",
    "/for-employers",
    "/report",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Add dynamic internship routes
  const internshipRoutes = [
    { id: "1", title: "frontend-developer-intern" },
    { id: "2", title: "digital-marketing-intern" },
    { id: "3", title: "ui-ux-design-intern" },
    { id: "4", title: "finance-analyst-intern" },
    { id: "5", title: "hr-operations-intern" },
    { id: "6", title: "business-development-intern" },
    { id: "7", title: "data-analyst-intern" },
    { id: "8", title: "content-writing-intern" },
    { id: "9", title: "civil-engineering-intern" },
    { id: "10", title: "backend-developer-intern" },
    { id: "11", title: "graphic-design-intern" },
    { id: "12", title: "ai-ml-intern" },
    { id: "13", title: "social-media-intern" },
    { id: "14", title: "accounting-intern" },
    { id: "15", title: "recruitment-intern" },
    { id: "16", title: "project-management-intern" },
    { id: "17", title: "copywriter-intern" },
    { id: "18", title: "electrical-engineering-intern" },
    { id: "19", title: "full-stack-developer-intern" },
    { id: "20", title: "brand-strategy-intern" },
    { id: "21", title: "mobile-app-developer-intern" },
    { id: "22", title: "financial-planning-intern" },
    { id: "23", title: "technical-writer-intern" },
    { id: "24", title: "mechanical-engineering-intern" },
    { id: "25", title: "product-management-intern" },
    { id: "26", title: "devops-intern" },
    { id: "27", title: "seo-intern" },
    { id: "28", title: "video-editor-intern" },
    { id: "29", title: "supply-chain-intern" },
    { id: "30", title: "cybersecurity-intern" },
  ].map((internship) => ({
    url: `${baseUrl}/internship/${internship.id}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.9 as const,
  }));

  // Add dynamic category routes
  const categoryRoutes = [
    "software-it",
    "marketing",
    "design",
    "finance",
    "hr",
    "business",
    "data-ai",
    "content-writing",
    "engineering",
    "others",
  ].map((category) => ({
    url: `${baseUrl}/categories/${category}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.7 as const,
  }));

  // Add dynamic location routes
  const locationRoutes = [
    "dhaka",
    "chattogram",
    "rajshahi",
    "sylhet",
    "khulna",
    "barishal",
    "rangpur",
    "mymensingh",
    "remote",
  ].map((location) => ({
    url: `${baseUrl}/locations/${location}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.7 as const,
  }));

  return [...staticRoutes, ...internshipRoutes, ...categoryRoutes, ...locationRoutes];
}
