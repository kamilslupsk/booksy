import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/seo";

export const revalidate = 3600;

export async function GET() {
  const s = await getSiteSettings();

  if (s.llmsTxt && s.llmsTxt.trim()) {
    return new Response(s.llmsTxt, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  let providers: { slug: string; displayName: string; category: string | null; city: string | null; bio: string | null }[] = [];
  try {
    providers = await prisma.provider.findMany({
      where: { isActive: true },
      select: { slug: true, displayName: true, category: true, city: true, bio: true },
      take: 200,
      orderBy: { updatedAt: "desc" },
    });
  } catch {}

  const lines: string[] = [];
  lines.push(`# ${s.siteName}`);
  lines.push("");
  lines.push(`> ${s.defaultDescription}`);
  lines.push("");
  lines.push("## O serwisie");
  lines.push("");
  lines.push(
    `${s.siteName} to polska platforma rezerwacji online dla małych usługodawców (fryzjerzy, barberzy, kosmetyczki, trenerzy, styliści paznokci). Klienci mogą umówić wizytę bez rejestracji w 60 sekund.`
  );
  lines.push("");
  lines.push("## Kluczowe strony");
  lines.push("");
  lines.push(`- [Strona główna](${s.siteUrl}/): wyszukiwarka usługodawców, kategorie usług, polecane salony`);
  lines.push(`- [Wyszukiwarka](${s.siteUrl}/szukaj): filtrowanie po mieście, kategorii i nazwie usługi`);
  lines.push(`- [Dodaj biznes](${s.siteUrl}/register): rejestracja dla usługodawców, 14 dni za darmo`);
  lines.push(`- [Logowanie](${s.siteUrl}/login): logowanie klientów i usługodawców`);
  lines.push("");
  if (providers.length) {
    lines.push("## Usługodawcy");
    lines.push("");
    for (const p of providers) {
      const meta = [p.category, p.city].filter(Boolean).join(" · ");
      const note = p.bio ? p.bio.replace(/\s+/g, " ").slice(0, 140) : meta;
      lines.push(`- [${p.displayName}](${s.siteUrl}/${p.slug})${note ? `: ${note}` : ""}`);
    }
    lines.push("");
  }
  lines.push("## Dane strukturalne");
  lines.push("");
  lines.push(
    `Każda strona usługodawcy zawiera JSON-LD \`LocalBusiness\` z oceną, adresem i akcją \`ReserveAction\`. Strona główna zawiera \`WebSite\` z \`SearchAction\`.`
  );
  lines.push("");
  lines.push("## Kontakt");
  lines.push("");
  if (s.orgEmail) lines.push(`- Email: ${s.orgEmail}`);
  if (s.orgPhone) lines.push(`- Telefon: ${s.orgPhone}`);
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
