import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/seo";

const AI_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "Amazonbot",
  "cohere-ai",
  "Meta-ExternalAgent",
  "Meta-ExternalFetcher",
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const s = await getSiteSettings();

  if (!s.allowIndexing) {
    return { rules: [{ userAgent: "*", disallow: "/" }], host: s.siteUrl };
  }

  const rules: MetadataRoute.Robots["rules"] = [
    {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/klient/", "/dashboard/", "/admin/", "/login", "/register", "/verify", "/me"],
    },
  ];

  for (const bot of AI_BOTS) {
    rules.push({
      userAgent: bot,
      ...(s.allowAiCrawlers
        ? { allow: "/", disallow: ["/api/", "/klient/", "/dashboard/", "/admin/"] }
        : { disallow: "/" }),
    });
  }

  return {
    rules,
    sitemap: `${s.siteUrl}/sitemap.xml`,
    host: s.siteUrl,
  };
}
