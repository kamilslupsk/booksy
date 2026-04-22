import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { getSiteSettings, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

const inter = Inter({ subsets: ["latin", "latin-ext"] });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    metadataBase: new URL(s.siteUrl),
    title: { default: s.defaultTitle, template: s.titleTemplate },
    description: s.defaultDescription,
    keywords: s.defaultKeywords,
    applicationName: s.siteName,
    robots: s.allowIndexing
      ? { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 }
      : { index: false, follow: false },
    openGraph: {
      type: "website",
      siteName: s.siteName,
      locale: s.locale,
      images: s.ogImage ? [s.ogImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      site: s.twitterHandle ?? undefined,
    },
    verification: {
      google: s.googleSiteVerification ?? undefined,
      other: s.bingSiteVerification ? { "msvalidate.01": s.bingSiteVerification } : undefined,
    },
    icons: { icon: "/favicon.ico" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSiteSettings();
  const [org, site] = await Promise.all([organizationJsonLd(), websiteJsonLd()]);

  return (
    <html lang="pl" className="h-full scroll-smooth">
      <body className={`${inter.className} min-h-full flex flex-col antialiased bg-gray-50 text-slate-800`}>
        <JsonLd data={org} />
        <JsonLd data={site} />
        {children}
        <Toaster richColors position="top-center" />
        {s.googleAnalyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${s.googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${s.googleAnalyticsId}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
