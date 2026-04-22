import { prisma } from "@/lib/prisma";
import { DEFAULT_TEMPLATES, TEMPLATE_LABELS, type TemplateKey } from "@/lib/seo";
import { saveSeoTemplate, resetTemplate } from "../actions";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

export const dynamic = "force-dynamic";

const TOKEN_HINTS: Record<TemplateKey, string> = {
  home: "{siteName}",
  search: "{q}, {city}, {category}, {siteName}",
  provider: "{displayName}, {city}, {category}, {siteName}",
  provider_confirm: "{siteName}",
  client_panel: "{siteName}",
  login: "{siteName}",
  register: "{siteName}",
};

export default async function TemplatesPage() {
  const saved = await prisma.seoTemplate.findMany();
  const byKey = new Map(saved.map((t) => [t.key, t]));

  const keys = Object.keys(TEMPLATE_LABELS) as TemplateKey[];

  return (
    <div className="max-w-5xl p-6 md:p-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Szablony SEO podstron</h1>
        <p className="text-sm text-slate-500 mt-1">
          Szablony tytułu, opisu i słów kluczowych dla każdego typu podstrony. Używaj zmiennych w nawiasach
          klamrowych — zostaną podstawione na podstawie danych strony.
        </p>
        <p className="text-sm text-slate-500 mt-2">
          <Link href="/admin/seo" className="text-indigo-600 underline">← Ustawienia globalne</Link>
        </p>
      </div>

      <div className="space-y-6">
        {keys.map((key) => {
          const t = byKey.get(key);
          const d = DEFAULT_TEMPLATES[key];
          const title = t?.title ?? d.title;
          const description = t?.description ?? d.description;
          const keywords = t?.keywords ?? d.keywords ?? "";

          return (
            <details
              key={key}
              open={key === "home" || key === "provider"}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden group"
            >
              <summary className="px-6 py-4 cursor-pointer select-none flex items-center justify-between hover:bg-slate-50">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">{TEMPLATE_LABELS[key]}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dostępne zmienne: <code className="font-mono">{TOKEN_HINTS[key]}</code>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {t && <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700">własne</span>}
                  {!t && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">domyślne</span>}
                </div>
              </summary>

              <div className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-5">
                <form action={saveSeoTemplate} className="space-y-4">
                  <input type="hidden" name="key" value={key} />

                  <div className="grid gap-1.5">
                    <label className="text-xs font-medium text-slate-700">Tytuł (&lt;title&gt;)</label>
                    <input
                      name="title"
                      defaultValue={title}
                      className="text-sm rounded-lg border border-gray-200 px-3 py-2"
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <label className="text-xs font-medium text-slate-700">Opis (meta description)</label>
                    <textarea
                      name="description"
                      defaultValue={description}
                      rows={3}
                      className="text-sm rounded-lg border border-gray-200 px-3 py-2"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                      <label className="text-xs font-medium text-slate-700">Słowa kluczowe</label>
                      <input
                        name="keywords"
                        defaultValue={keywords}
                        className="text-sm rounded-lg border border-gray-200 px-3 py-2"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-xs font-medium text-slate-700">OG image (URL)</label>
                      <input
                        name="ogImage"
                        defaultValue={t?.ogImage ?? ""}
                        className="text-sm rounded-lg border border-gray-200 px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="grid gap-1.5">
                    <label className="text-xs font-medium text-slate-700">Dodatkowe JSON-LD (opcjonalnie)</label>
                    <textarea
                      name="jsonLd"
                      defaultValue={t?.jsonLd ?? ""}
                      rows={4}
                      placeholder='{"@context":"https://schema.org","@type":"..."}'
                      className="text-sm rounded-lg border border-gray-200 px-3 py-2 font-mono"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" name="noindex" defaultChecked={t?.noindex ?? false} />
                    Nie indeksuj tej podstrony (noindex)
                  </label>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                    >
                      Zapisz szablon
                    </button>
                  </div>
                </form>

                <form action={resetTemplate.bind(null, key)}>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"
                  >
                    <RotateCcw className="w-3 h-3" /> Przywróć domyślny
                  </button>
                </form>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
