"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidateSeo, DEFAULT_TEMPLATES, TEMPLATE_LABELS, type TemplateKey } from "@/lib/seo";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const s = await auth();
  if (!s?.user || s.user.role !== "ADMIN") throw new Error("Forbidden");
}

function str(fd: FormData, k: string): string | null {
  const v = fd.get(k);
  if (v === null || v === undefined) return null;
  const t = String(v).trim();
  return t === "" ? null : t;
}

function bool(fd: FormData, k: string): boolean {
  return fd.get(k) === "on" || fd.get(k) === "true";
}

export async function saveSiteSettings(fd: FormData) {
  await requireAdmin();

  const data = {
    siteName: str(fd, "siteName") ?? "Rezerwuj",
    siteUrl: (str(fd, "siteUrl") ?? "https://rezerwuj.pl").replace(/\/$/, ""),
    defaultTitle: str(fd, "defaultTitle") ?? "Rezerwuj",
    titleTemplate: str(fd, "titleTemplate") ?? "%s | Rezerwuj",
    defaultDescription: str(fd, "defaultDescription") ?? "",
    defaultKeywords: str(fd, "defaultKeywords") ?? "",
    ogImage: str(fd, "ogImage"),
    twitterHandle: str(fd, "twitterHandle"),
    locale: str(fd, "locale") ?? "pl_PL",
    orgName: str(fd, "orgName") ?? "Rezerwuj",
    orgLegalName: str(fd, "orgLegalName"),
    orgLogo: str(fd, "orgLogo"),
    orgStreet: str(fd, "orgStreet"),
    orgCity: str(fd, "orgCity"),
    orgPostalCode: str(fd, "orgPostalCode"),
    orgCountry: str(fd, "orgCountry") ?? "PL",
    orgPhone: str(fd, "orgPhone"),
    orgEmail: str(fd, "orgEmail"),
    googleAnalyticsId: str(fd, "googleAnalyticsId"),
    googleSiteVerification: str(fd, "googleSiteVerification"),
    bingSiteVerification: str(fd, "bingSiteVerification"),
    robotsTxt: str(fd, "robotsTxt"),
    llmsTxt: str(fd, "llmsTxt"),
    allowIndexing: bool(fd, "allowIndexing"),
    allowAiCrawlers: bool(fd, "allowAiCrawlers"),
  };

  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });

  await revalidateSeo();
  revalidatePath("/", "layout");
}

export async function saveSeoTemplate(fd: FormData) {
  await requireAdmin();
  const key = String(fd.get("key") ?? "") as TemplateKey;
  if (!(key in TEMPLATE_LABELS)) throw new Error("Unknown template");

  const data = {
    label: TEMPLATE_LABELS[key],
    title: str(fd, "title") ?? "",
    description: str(fd, "description") ?? "",
    keywords: str(fd, "keywords"),
    ogImage: str(fd, "ogImage"),
    noindex: bool(fd, "noindex"),
    jsonLd: str(fd, "jsonLd"),
  };

  await prisma.seoTemplate.upsert({
    where: { key },
    create: { key, ...data },
    update: data,
  });

  await revalidateSeo();
  revalidatePath("/", "layout");
}

export async function resetTemplate(key: TemplateKey) {
  await requireAdmin();
  const d = DEFAULT_TEMPLATES[key];
  if (!d) return;
  await prisma.seoTemplate.upsert({
    where: { key },
    create: {
      key,
      label: TEMPLATE_LABELS[key],
      title: d.title,
      description: d.description,
      keywords: d.keywords ?? null,
    },
    update: {
      title: d.title,
      description: d.description,
      keywords: d.keywords ?? null,
      ogImage: null,
      noindex: false,
      jsonLd: null,
    },
  });
  await revalidateSeo();
  revalidatePath("/", "layout");
}
