import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export type TemplateKey =
  | "home"
  | "search"
  | "provider"
  | "provider_confirm"
  | "client_panel"
  | "login"
  | "register";

export const TEMPLATE_LABELS: Record<TemplateKey, string> = {
  home: "Strona główna",
  search: "Wyszukiwarka",
  provider: "Profil usługodawcy (/[slug])",
  provider_confirm: "Potwierdzenie rezerwacji",
  client_panel: "Panel klienta",
  login: "Logowanie",
  register: "Rejestracja",
};

export const DEFAULT_TEMPLATES: Record<
  TemplateKey,
  { title: string; description: string; keywords?: string }
> = {
  home: {
    title: "{siteName} — rezerwuj wizyty online w 60 sekund",
    description:
      "Umów wizytę u fryzjera, barbera, kosmetyczki czy trenera w kilka sekund. Bez rejestracji, bez dzwonienia. Tysiące usługodawców w Polsce.",
    keywords: "rezerwacja online, fryzjer, manicure, barber, kosmetyczka, wizyta online",
  },
  search: {
    title: "{q} {city} — rezerwacja online | {siteName}",
    description:
      "Znajdź i zarezerwuj {q} w {city}. Porównaj ceny, zobacz opinie klientów i wybierz dogodny termin online.",
    keywords: "{q}, {city}, rezerwacja, salon",
  },
  provider: {
    title: "{displayName} — {category} {city} | Rezerwuj online",
    description:
      "Zarezerwuj wizytę u {displayName} ({city}). {category}. Zobacz cennik, opinie klientów i dostępne terminy. Rezerwacja online 24/7.",
    keywords: "{displayName}, {category}, {city}, rezerwacja, salon",
  },
  provider_confirm: {
    title: "Rezerwacja potwierdzona | {siteName}",
    description: "Twoja wizyta została potwierdzona. Szczegóły znajdziesz w wiadomości SMS i e-mail.",
  },
  client_panel: {
    title: "Moje wizyty | {siteName}",
    description: "Zarządzaj swoimi rezerwacjami, zobacz historię wizyt i umów kolejne terminy.",
  },
  login: {
    title: "Zaloguj się | {siteName}",
    description: "Zaloguj się do swojego konta w {siteName}, aby zarządzać rezerwacjami.",
  },
  register: {
    title: "Dodaj swój biznes | {siteName}",
    description:
      "Dołącz do {siteName} i zacznij przyjmować rezerwacje online. 14 dni za darmo, bez karty.",
  },
};

const DEFAULT_SETTINGS = {
  id: "singleton",
  siteName: "Rezerwuj",
  siteUrl: "https://rezerwuj.pl",
  defaultTitle: "Rezerwuj — umów wizytę online",
  titleTemplate: "%s | Rezerwuj",
  defaultDescription:
    "Prosta platforma do umawiania wizyt u fryzjerów, stylistów paznokci, trenerów i innych usługodawców.",
  defaultKeywords: "rezerwacja online, fryzjer, manicure, barber, wizyta online",
  ogImage: null as string | null,
  twitterHandle: null as string | null,
  locale: "pl_PL",
  orgName: "Rezerwuj",
  orgLegalName: null as string | null,
  orgLogo: null as string | null,
  orgStreet: null as string | null,
  orgCity: null as string | null,
  orgPostalCode: null as string | null,
  orgCountry: "PL",
  orgPhone: null as string | null,
  orgEmail: null as string | null,
  googleAnalyticsId: null as string | null,
  googleSiteVerification: null as string | null,
  bingSiteVerification: null as string | null,
  robotsTxt: null as string | null,
  llmsTxt: null as string | null,
  allowIndexing: true,
  allowAiCrawlers: true,
};

export type SiteSettings = typeof DEFAULT_SETTINGS;

export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    try {
      const s = await prisma.siteSetting.findUnique({ where: { id: "singleton" } });
      if (!s) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...s } as SiteSettings;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },
  ["site-settings"],
  { tags: ["site-settings"], revalidate: 300 }
);

export const getSeoTemplate = unstable_cache(
  async (key: TemplateKey) => {
    try {
      const t = await prisma.seoTemplate.findUnique({ where: { key } });
      if (t) return t;
    } catch {}
    const d = DEFAULT_TEMPLATES[key];
    return {
      key,
      label: TEMPLATE_LABELS[key],
      title: d.title,
      description: d.description,
      keywords: d.keywords ?? null,
      ogImage: null,
      noindex: false,
      jsonLd: null,
    };
  },
  ["seo-template"],
  { tags: ["seo-templates"], revalidate: 300 }
);

export function renderTemplate(
  tpl: string | null | undefined,
  vars: Record<string, string | undefined | null>
): string {
  if (!tpl) return "";
  return tpl
    .replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? "").trim())
    .replace(/\s+—\s+(?=\||$)/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+\|/g, " |")
    .replace(/\|\s*$/, "")
    .trim();
}

export async function buildMetadata(
  key: TemplateKey,
  vars: Record<string, string | undefined | null> = {},
  overrides: Partial<Metadata> = {}
): Promise<Metadata> {
  const [settings, tpl] = await Promise.all([getSiteSettings(), getSeoTemplate(key)]);
  const allVars = { siteName: settings.siteName, ...vars };

  const title = renderTemplate(tpl.title, allVars) || settings.defaultTitle;
  const description =
    renderTemplate(tpl.description, allVars) || settings.defaultDescription;
  const keywords = renderTemplate(tpl.keywords ?? "", allVars) || settings.defaultKeywords;
  const ogImage = tpl.ogImage || settings.ogImage || undefined;
  const noindex = tpl.noindex || !settings.allowIndexing;

  return {
    metadataBase: new URL(settings.siteUrl),
    title,
    description,
    keywords,
    applicationName: settings.siteName,
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    alternates: { canonical: overrides.alternates?.canonical },
    openGraph: {
      title,
      description,
      siteName: settings.siteName,
      locale: settings.locale,
      type: "website",
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: settings.twitterHandle ?? undefined,
      images: ogImage ? [ogImage] : undefined,
    },
    verification: {
      google: settings.googleSiteVerification ?? undefined,
      other: settings.bingSiteVerification
        ? { "msvalidate.01": settings.bingSiteVerification }
        : undefined,
    },
    ...overrides,
  };
}

// --- JSON-LD helpers ---

export async function organizationJsonLd() {
  const s = await getSiteSettings();
  const org: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: s.orgName,
    url: s.siteUrl,
    logo: s.orgLogo ?? undefined,
    legalName: s.orgLegalName ?? undefined,
    email: s.orgEmail ?? undefined,
    telephone: s.orgPhone ?? undefined,
  };
  if (s.orgStreet || s.orgCity) {
    org.address = {
      "@type": "PostalAddress",
      streetAddress: s.orgStreet ?? undefined,
      addressLocality: s.orgCity ?? undefined,
      postalCode: s.orgPostalCode ?? undefined,
      addressCountry: s.orgCountry,
    };
  }
  return org;
}

export async function websiteJsonLd() {
  const s = await getSiteSettings();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: s.siteName,
    url: s.siteUrl,
    inLanguage: "pl-PL",
    potentialAction: {
      "@type": "SearchAction",
      target: `${s.siteUrl}/szukaj?q={query}`,
      "query-input": "required name=query",
    },
  };
}

export function localBusinessJsonLd(provider: {
  displayName: string;
  slug: string;
  bio?: string | null;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  coverImage?: string | null;
  category?: string | null;
  galleryImages?: string[];
  reviews?: { rating: number }[];
}, siteUrl: string) {
  const url = `${siteUrl}/${provider.slug}`;
  const reviews = provider.reviews ?? [];
  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null;

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: provider.displayName,
    url,
    description: provider.bio ?? undefined,
    image: provider.coverImage ?? undefined,
    photo: provider.galleryImages ?? undefined,
    telephone: provider.phone ?? undefined,
    address: provider.address
      ? {
          "@type": "PostalAddress",
          streetAddress: provider.address,
          addressLocality: provider.city ?? undefined,
          addressCountry: "PL",
        }
      : undefined,
    aggregateRating: avg
      ? {
          "@type": "AggregateRating",
          ratingValue: avg.toFixed(1),
          reviewCount: reviews.length,
        }
      : undefined,
    potentialAction: {
      "@type": "ReserveAction",
      target: url,
      name: "Zarezerwuj wizytę",
    },
  };
}

export async function revalidateSeo() {
  const { updateTag } = await import("next/cache");
  updateTag("site-settings");
  updateTag("seo-templates");
}
