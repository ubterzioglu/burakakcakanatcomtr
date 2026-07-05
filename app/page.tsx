import Link from "next/link";

import { LeadForm } from "@/components/lead-form";
import { MarketingShell } from "@/components/marketing-shell";
import { getPublicSiteSnapshot, getLocaleFromParams, filterFeaturedVentures, filterPublishedInsights } from "@/lib/site-data";
import { t } from "@/lib/i18n";

type PageProps = {
  searchParams: Promise<{ lang?: string }>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const locale = getLocaleFromParams((await searchParams).lang);
  const snapshot = await getPublicSiteSnapshot();
  const ventures = filterFeaturedVentures(snapshot.ventures);
  const insights = filterPublishedInsights(snapshot.insights).slice(0, 2);

  return (
    <MarketingShell locale={locale}>
      <section className="glass-panel relative overflow-hidden rounded-[2.5rem] px-6 py-12 md:px-10 md:py-14">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(212,176,106,0.16),transparent_56%)] lg:block" />
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.8fr] lg:items-end">
          <div className="space-y-7">
            <p className="kicker">{t(snapshot.settings.heroEyebrow, locale)}</p>
            <div className="space-y-5">
              <p className="text-sm uppercase tracking-[0.28em] text-white/40">
                {t(snapshot.settings.heroRibbon, locale)}
              </p>
              <h1 className="display-title max-w-5xl text-5xl leading-none text-white md:text-7xl">
                {t(snapshot.settings.heroTitle, locale)}
              </h1>
              <p className="max-w-3xl text-base leading-8 text-white/68 md:text-lg">
                {t(snapshot.settings.heroBody, locale)}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={snapshot.settings.primaryCta.href} className="cta-primary">
                {t(snapshot.settings.primaryCta.label, locale)}
              </Link>
              <Link href={snapshot.settings.secondaryCta.href} className="cta-secondary">
                {t(snapshot.settings.secondaryCta.label, locale)}
              </Link>
            </div>
          </div>
          <div className="space-y-5 rounded-[2rem] border border-white/10 bg-[#07111f]/52 p-6">
            <div className="space-y-2">
              <p className="kicker">
                {locale === "tr" ? "Stratejik iz düşümü" : "Strategic footprint"}
              </p>
              <p className="text-lg leading-8 text-white/70">{t(snapshot.settings.baseLocation, locale)}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
              {snapshot.settings.globalStats.map((stat) => (
                <div key={stat.value} className="rounded-[1.5rem] border border-white/8 bg-white/5 p-4">
                  <div className="display-title text-3xl text-[#d4b06a]">{stat.value}</div>
                  <div className="mt-2 text-sm text-white/58">{t(stat.label, locale)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        {snapshot.sections.map((section) => (
          <div key={section.id} className="section-shell">
            <p className="kicker">{t(section.eyebrow, locale)}</p>
            <h2 className="display-title mt-4 text-4xl text-white md:text-5xl">
              {t(section.title, locale)}
            </h2>
            <p className="mt-5 body-muted">{t(section.body, locale)}</p>
            {section.callout ? (
              <p className="mt-5 rounded-[1.5rem] border border-[#8fb8cd]/25 bg-[#123156]/40 p-4 text-sm leading-7 text-[#dcecf3]">
                {t(section.callout, locale)}
              </p>
            ) : null}
            <div className="mt-6 space-y-3">
              {section.bullets.map((bullet) => (
                <div key={bullet.en} className="flex gap-3 text-sm leading-7 text-white/68">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#d4b06a]" />
                  <span>{t(bullet, locale)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section id="ventures" className="section-shell">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="kicker">{locale === "tr" ? "Venture Ekosistemi" : "Venture Ecosystem"}</p>
            <h2 className="display-title mt-3 text-4xl text-white md:text-5xl">
              {locale === "tr"
                ? "Kişisel marka ile kurumsal girişim mimarisinin kesiştiği yer."
                : "Where personal authority meets multi-platform venture architecture."}
            </h2>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {ventures.map((venture) => (
            <Link
              key={venture.id}
              href={`/ventures/${venture.slug}?lang=${locale}`}
              className={`group overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br ${venture.accent} p-[1px]`}
            >
              <div className="h-full rounded-[calc(2rem-1px)] bg-[#07111f]/90 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="kicker">{t(venture.category, locale)}</p>
                    <h3 className="display-title mt-4 text-3xl text-white">{venture.name}</h3>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/44">
                    {venture.metrics[0]?.value ?? "Live"}
                  </span>
                </div>
                <p className="mt-5 text-sm leading-7 text-white/68">{t(venture.summary, locale)}</p>
                <div className="mt-6 space-y-3">
                  {venture.marketFocus.map((item) => (
                    <div key={item.en} className="text-sm text-white/55">
                      {t(item, locale)}
                    </div>
                  ))}
                </div>
                <div className="mt-8 text-sm font-semibold text-[#d4b06a] group-hover:translate-x-1">
                  {locale === "tr" ? "Detayı incele" : "Open detail"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="section-shell">
          <p className="kicker">{locale === "tr" ? "Liderlik Yolculuğu" : "Leadership Journey"}</p>
          <h2 className="display-title mt-3 text-4xl text-white md:text-5xl">
            {locale === "tr"
              ? "Deneyim, yalnızca süre değil; farklı sistemler arasında kurulan karar kalitesidir."
              : "Experience is not just duration. It is decision quality built across different systems."}
          </h2>
        </div>
        <div className="section-shell">
          <div className="space-y-5">
            {snapshot.timeline.map((entry) => (
              <div key={entry.id} className="grid gap-2 border-l border-white/12 pl-5">
                <p className="text-xs uppercase tracking-[0.26em] text-[#8fb8cd]">{t(entry.period, locale)}</p>
                <h3 className="display-title text-2xl text-white">{t(entry.title, locale)}</h3>
                <p className="text-sm font-semibold text-white/55">{entry.org}</p>
                <p className="text-sm leading-7 text-white/62">{t(entry.body, locale)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="section-shell">
          <p className="kicker">{locale === "tr" ? "Yayın ve Fikir" : "Publication and Thought"}</p>
          <h2 className="display-title mt-3 text-4xl text-white md:text-5xl">
            Human Consciousness Decoded
          </h2>
          <p className="mt-5 body-muted">
            {locale === "tr"
              ? "Koçluk, liderlik ve davranış kalıplarını kurucu düzeyde ele alan çerçeve."
              : "The foundational framework translating coaching, leadership, and behavioral patterns at founder level."}
          </p>
          <div className="mt-6 space-y-4">
            {snapshot.publications.map((publication) => (
              <a
                key={publication.id}
                href={publication.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-[1.5rem] border border-white/10 bg-white/4 p-4"
              >
                <div className="text-xs uppercase tracking-[0.25em] text-[#8fb8cd]">
                  {t(publication.kind, locale)}
                </div>
                <div className="display-title mt-3 text-2xl text-white">{t(publication.title, locale)}</div>
                <div className="mt-2 text-sm text-white/58">{t(publication.subtitle, locale)}</div>
              </a>
            ))}
          </div>
        </div>
        <div className="section-shell">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="kicker">{locale === "tr" ? "İçgörüler" : "Insights"}</p>
              <h2 className="display-title mt-3 text-4xl text-white md:text-5xl">
                {locale === "tr" ? "Güven, sermaye ve liderlik üzerine notlar." : "Notes on trust, capital, and leadership."}
              </h2>
            </div>
            <Link href={`/insights?lang=${locale}`} className="text-sm font-semibold text-[#d4b06a]">
              {locale === "tr" ? "Tüm yazılar" : "All essays"}
            </Link>
          </div>
          <div className="grid gap-5">
            {insights.map((insight) => (
              <Link
                key={insight.id}
                href={`/insights/${insight.slug}?lang=${locale}`}
                className="rounded-[1.75rem] border border-white/10 bg-white/4 p-5"
              >
                <div className="text-xs uppercase tracking-[0.25em] text-[#8fb8cd]">{insight.publishedAt}</div>
                <div className="display-title mt-3 text-3xl text-white">{t(insight.title, locale)}</div>
                <p className="mt-3 text-sm leading-7 text-white/62">{t(insight.excerpt, locale)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <LeadForm locale={locale} />
    </MarketingShell>
  );
}
