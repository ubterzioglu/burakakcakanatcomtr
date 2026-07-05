import Link from "next/link";
import { notFound } from "next/navigation";

import { MarketingShell } from "@/components/marketing-shell";
import { getLocaleFromParams, getVentureBySlug } from "@/lib/site-data";
import { t } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export default async function VentureDetailPage({ params, searchParams }: PageProps) {
  const locale = getLocaleFromParams((await searchParams).lang);
  const venture = await getVentureBySlug((await params).slug);

  if (!venture) {
    notFound();
  }

  return (
    <MarketingShell locale={locale}>
      <section className={`section-shell bg-gradient-to-br ${venture.accent}`}>
        <div className="rounded-[1.75rem] bg-[#07111f]/82 p-6 md:p-8">
          <p className="kicker">{t(venture.category, locale)}</p>
          <h1 className="display-title mt-4 text-5xl text-white md:text-7xl">{venture.name}</h1>
          <p className="mt-6 max-w-4xl text-lg leading-8 text-white/72">{t(venture.summary, locale)}</p>
          <p className="mt-5 max-w-4xl text-base leading-8 text-white/66">{t(venture.description, locale)}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {venture.url ? (
              <a className="cta-primary" href={venture.url} target="_blank" rel="noreferrer">
                {locale === "tr" ? "Resmi bağlantıyı aç" : "Open official link"}
              </a>
            ) : null}
            <Link href={`/mvp?lang=${locale}#connect`} className="cta-secondary">
              {locale === "tr" ? "İş birliği başlat" : "Start collaboration"}
            </Link>
          </div>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="section-shell">
          <p className="kicker">{locale === "tr" ? "Odak Alanları" : "Focus Areas"}</p>
          <div className="mt-6 space-y-4">
            {venture.marketFocus.map((item) => (
              <div key={item.en} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/72">
                {t(item, locale)}
              </div>
            ))}
          </div>
        </div>
        <div className="section-shell">
          <p className="kicker">{locale === "tr" ? "Ölçüler" : "Signals"}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {venture.metrics.map((metric) => (
              <div key={metric.value} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <div className="display-title text-3xl text-[#d4b06a]">{metric.value}</div>
                <div className="mt-3 text-sm text-white/58">{t(metric.label, locale)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
