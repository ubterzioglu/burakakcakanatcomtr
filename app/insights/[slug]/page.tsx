import { notFound } from "next/navigation";

import { MarketingShell } from "@/components/marketing-shell";
import { getInsightBySlug, getLocaleFromParams } from "@/lib/site-data";
import { t } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export default async function InsightDetailPage({ params, searchParams }: PageProps) {
  const locale = getLocaleFromParams((await searchParams).lang);
  const insight = await getInsightBySlug((await params).slug);

  if (!insight) {
    notFound();
  }

  return (
    <MarketingShell locale={locale}>
      <article className="section-shell">
        <p className="kicker">{insight.publishedAt}</p>
        <h1 className="display-title mt-4 max-w-4xl text-5xl text-white md:text-7xl">
          {t(insight.title, locale)}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-white/66">{t(insight.excerpt, locale)}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          {insight.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.23em] text-white/60"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-10 max-w-4xl space-y-6 text-base leading-8 text-white/78">
          {t(insight.body, locale)
            .split("\n\n")
            .map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
        </div>
      </article>
    </MarketingShell>
  );
}
