import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://internbd.com";

  const staticRoutes = [
    "",
    "/about",
    "/privacy",
    "/contact",
    "/post",
    "/saved",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));

  return [
    ...staticRoutes,
    {
      url: `${baseUrl}/internship/[id]`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];
}