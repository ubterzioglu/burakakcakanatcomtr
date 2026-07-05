import { LeadForm } from "@/components/lead-form";
import { MarketingShell } from "@/components/marketing-shell";
import { getLocaleFromParams, getPublicSiteSnapshot } from "@/lib/site-data";

type PageProps = {
  searchParams: Promise<{ lang?: string }>;
};

export default async function ContactPage({ searchParams }: PageProps) {
  const locale = getLocaleFromParams((await searchParams).lang);
  const snapshot = await getPublicSiteSnapshot();

  return (
    <MarketingShell locale={locale}>
      <section className="section-shell">
        <p className="kicker">{locale === "tr" ? "Temas Noktası" : "Contact Surface"}</p>
        <h1 className="display-title mt-4 max-w-4xl text-5xl text-white md:text-7xl">
          {locale === "tr"
            ? "Yatırım, ortaklık veya danışmanlık gündeminizi doğrudan paylaşın."
            : "Share your investment, partnership, or advisory agenda directly."}
        </h1>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <div className="kicker">Email</div>
            <div className="mt-3 text-base text-white">{snapshot.settings.contactEmail}</div>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <div className="kicker">Phone</div>
            <div className="mt-3 text-base text-white">{snapshot.settings.contactPhone}</div>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <div className="kicker">{locale === "tr" ? "Temel bölge" : "Base region"}</div>
            <div className="mt-3 text-base text-white">{snapshot.settings.baseLocation[locale]}</div>
          </div>
        </div>
      </section>
      <LeadForm locale={locale} />
    </MarketingShell>
  );
}
