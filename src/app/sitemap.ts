import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const s = await getSiteSettings();
  const base = s.siteUrl.replace(/\/$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, priority: 1.0, changeFrequency: "daily" },
    { url: `${base}/szukaj`, priority: 0.8, changeFrequency: "daily" },
    { url: `${base}/login`, priority: 0.3, changeFrequency: "yearly" },
    { url: `${base}/register`, priority: 0.6, changeFrequency: "monthly" },
  ];

  let providers: { slug: string; updatedAt: Date }[] = [];
  try {
    providers = await prisma.provider.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });
  } catch {}

  const providerRoutes: MetadataRoute.Sitemap = providers.map((p) => ({
    url: `${base}/${p.slug}`,
    lastModified: p.updatedAt,
    priority: 0.9,
    changeFrequency: "weekly",
  }));

  return [...staticRoutes, ...providerRoutes];
}
