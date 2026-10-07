import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const routes = [
  { path: "", priority: 1, changeFrequency: "weekly" as const },
  { path: "/menus", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/menus/main-menu", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/menus/lunch-drinks", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/booking", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/gift-cards", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/reviews", priority: 0.6, changeFrequency: "monthly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
