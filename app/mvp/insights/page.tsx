import Link from "next/link";

import { MarketingShell } from "@/components/marketing-shell";
import { getLocaleFromParams, getPublicSiteSnapshot, filterPublishedInsights } from "@/lib/site-data";
import { t } from "@/lib/i18n";

type PageProps = {
  searchParams: Promise<{ lang?: string }>;
};

export default async function InsightsPage({ searchParams }: PageProps) {
  const locale = getLocaleFromParams((await searchParams).lang);
  const snapshot = await getPublicSiteSnapshot();
  const insights = filterPublishedInsights(snapshot.insights);

  return (
    <MarketingShell locale={locale}>
      <section className="section-shell">
        <p className="kicker">{locale === "tr" ? "İçgörü Arşivi" : "Insight Archive"}</p>
        <h1 className="display-title mt-4 max-w-4xl text-5xl text-white md:text-7xl">
          {locale === "tr"
            ? "Yatırım ilişkileri, diaspora ağları ve liderlik mimarisi üzerine editoryal notlar."
            : "Editorial notes on investment relationships, diaspora ecosystems, and leadership architecture."}
        </h1>
      </section>
      <section className="grid gap-6">
        {insights.map((insight) => (
          <Link
            key={insight.id}
            href={`/mvp/insights/${insight.slug}?lang=${locale}`}
            className="section-shell block hover:border-[#8fb8cd]/35"
          >
            <div className="text-xs uppercase tracking-[0.24em] text-[#8fb8cd]">{insight.publishedAt}</div>
            <h2 className="display-title mt-4 text-4xl text-white md:text-5xl">{t(insight.title, locale)}</h2>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-white/62">{t(insight.excerpt, locale)}</p>
          </Link>
        ))}
      </section>
    </MarketingShell>
  );
}
