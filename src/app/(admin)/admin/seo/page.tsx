import { getSiteSettings } from "@/lib/seo";
import { saveSiteSettings } from "./actions";
import Link from "next/link";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

function Field({
  label, name, value, type = "text", placeholder, hint, textarea, rows,
}: {
  label: string; name: string; value?: string | null; type?: string;
  placeholder?: string; hint?: string; textarea?: boolean; rows?: number;
}) {
  return (
    <div className="grid gap-1.5">
      <label className="text-xs font-medium text-slate-700">{label}</label>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={value ?? ""}
          rows={rows ?? 4}
          placeholder={placeholder}
          className="text-sm rounded-lg border border-gray-200 px-3 py-2 font-mono"
        />
      ) : (
        <input
          name={name}
          type={type}
          defaultValue={value ?? ""}
          placeholder={placeholder}
          className="text-sm rounded-lg border border-gray-200 px-3 py-2"
        />
      )}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function Toggle({ label, name, defaultChecked, hint }: { label: string; name: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-slate-50">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5" />
      <div>
        <div className="text-sm font-medium text-slate-800">{label}</div>
        {hint && <div className="text-xs text-slate-500 mt-0.5">{hint}</div>}
      </div>
    </label>
  );
}

export default async function SeoAdminPage() {
  const s = await getSiteSettings();

  return (
    <div className="max-w-4xl p-6 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">SEO — ustawienia globalne</h1>
          <p className="text-sm text-slate-500 mt-1">
            Te wartości wpływają na każdą stronę serwisu. Szablony dla poszczególnych podstron znajdziesz w
            {" "}
            <Link href="/admin/seo/templates" className="text-indigo-600 underline inline-flex items-center gap-1">
              <FileText className="w-3 h-3" /> Szablony SEO
            </Link>.
          </p>
        </div>
      </div>

      <form action={saveSiteSettings} className="space-y-8">
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Podstawowe</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Nazwa serwisu" name="siteName" value={s.siteName} />
            <Field label="URL serwisu (canonical)" name="siteUrl" value={s.siteUrl} placeholder="https://rezerwuj.pl" />
            <Field label="Domyślny tytuł" name="defaultTitle" value={s.defaultTitle} />
            <Field label="Szablon tytułu" name="titleTemplate" value={s.titleTemplate} hint="np. %s | Rezerwuj" />
            <Field label="Locale" name="locale" value={s.locale} placeholder="pl_PL" />
            <Field label="OG image (URL)" name="ogImage" value={s.ogImage} placeholder="https://..." />
            <div className="md:col-span-2">
              <Field label="Domyślny opis" name="defaultDescription" value={s.defaultDescription} textarea rows={3} />
            </div>
            <div className="md:col-span-2">
              <Field label="Słowa kluczowe" name="defaultKeywords" value={s.defaultKeywords} />
            </div>
            <Field label="Twitter handle" name="twitterHandle" value={s.twitterHandle} placeholder="@rezerwuj" />
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Organization (JSON-LD)</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Nazwa" name="orgName" value={s.orgName} />
            <Field label="Nazwa prawna" name="orgLegalName" value={s.orgLegalName} />
            <Field label="Logo (URL)" name="orgLogo" value={s.orgLogo} />
            <Field label="Email" name="orgEmail" value={s.orgEmail} type="email" />
            <Field label="Telefon" name="orgPhone" value={s.orgPhone} />
            <Field label="Ulica" name="orgStreet" value={s.orgStreet} />
            <Field label="Miasto" name="orgCity" value={s.orgCity} />
            <Field label="Kod pocztowy" name="orgPostalCode" value={s.orgPostalCode} />
            <Field label="Kraj (ISO)" name="orgCountry" value={s.orgCountry} />
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Analityka i weryfikacja</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Google Analytics ID" name="googleAnalyticsId" value={s.googleAnalyticsId} placeholder="G-XXXXXXX" />
            <Field label="Google Search Console (meta)" name="googleSiteVerification" value={s.googleSiteVerification} />
            <Field label="Bing weryfikacja" name="bingSiteVerification" value={s.bingSiteVerification} />
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Indeksowanie i AI</h2>
          <div className="grid md:grid-cols-2 gap-3 mb-4">
            <Toggle
              label="Pozwól wyszukiwarkom indeksować"
              name="allowIndexing"
              defaultChecked={s.allowIndexing}
              hint="Wyłącz, żeby ustawić noindex globalnie (np. staging)."
            />
            <Toggle
              label="Pozwól crawlerom AI (ChatGPT, Claude, Perplexity, Gemini...)"
              name="allowAiCrawlers"
              defaultChecked={s.allowAiCrawlers}
              hint="Kontroluje GPTBot, ClaudeBot, PerplexityBot, Google-Extended i inne w robots.txt."
            />
          </div>
          <Field
            label="Własny robots.txt (opcjonalnie — nadpisuje auto-generowany)"
            name="robotsTxt"
            value={s.robotsTxt}
            textarea rows={6}
            hint="Zostaw puste, żeby użyć automatycznego z regułami AI."
          />
          <div className="h-4" />
          <Field
            label="llms.txt (dla AI Search — ChatGPT, Claude, Perplexity)"
            name="llmsTxt"
            value={s.llmsTxt}
            textarea rows={10}
            hint="Zostaw puste, żeby generować automatycznie z listy usługodawców. Format: https://llmstxt.org/"
          />
        </section>

        <div className="flex items-center gap-3 sticky bottom-4">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 shadow-lg"
          >
            Zapisz ustawienia
          </button>
          <Link href="/sitemap.xml" target="_blank" className="text-sm text-slate-500 hover:text-slate-800">
            sitemap.xml ↗
          </Link>
          <Link href="/robots.txt" target="_blank" className="text-sm text-slate-500 hover:text-slate-800">
            robots.txt ↗
          </Link>
          <Link href="/llms.txt" target="_blank" className="text-sm text-slate-500 hover:text-slate-800">
            llms.txt ↗
          </Link>
        </div>
      </form>
    </div>
  );
}
