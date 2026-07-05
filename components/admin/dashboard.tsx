"use client";

import { useRouter } from "next/navigation";

import { AdminJsonPanel } from "@/components/admin/json-panel";
import { AdminLeadsTable } from "@/components/admin/leads-table";
import type { getAdminSnapshot } from "@/lib/site-data";

type Snapshot = Awaited<ReturnType<typeof getAdminSnapshot>>;

type Props = {
  snapshot: Snapshot;
};

export function AdminDashboard({ snapshot }: Props) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[2rem] p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="kicker">Private studio</p>
            <h1 className="display-title max-w-4xl text-4xl text-white md:text-6xl">
              Manage the premium narrative, ventures, and inbound strategic flow.
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-white/62">
              The dashboard uses typed JSON payloads so the site can stay highly expressive while still being fully editable.
            </p>
          </div>
          <button className="cta-secondary" type="button" onClick={() => void logout()}>
            Sign out
          </button>
        </div>
      </section>
      <div className="grid gap-6 xl:grid-cols-2">
        <AdminJsonPanel
          title="Site settings"
          resource="site_settings"
          description="Global SEO, hero content, contact details, CTA labels, and trust badges."
          initialValue={snapshot.settings}
        />
        <AdminJsonPanel
          title="Homepage sections"
          resource="homepage_sections"
          description="Manifesto, domain expertise, and regional positioning blocks."
          initialValue={snapshot.sections}
        />
        <AdminJsonPanel
          title="Ventures"
          resource="ventures"
          description="Qualtron Sinclair, CorteQS, PayAL, HCD, and future venture cards."
          initialValue={snapshot.ventures}
        />
        <AdminJsonPanel
          title="Timeline entries"
          resource="timeline_entries"
          description="Career highlights and leadership journey."
          initialValue={snapshot.timeline}
        />
        <AdminJsonPanel
          title="Publications"
          resource="publications"
          description="Books, reports, or flagship intellectual property references."
          initialValue={snapshot.publications}
        />
        <AdminJsonPanel
          title="Insights"
          resource="insights"
          description="Editorial thought pieces and long-form insight pages."
          initialValue={snapshot.insights}
        />
        <AdminJsonPanel
          title="Media assets"
          resource="media_assets"
          description="External media links, references, and future asset metadata."
          initialValue={snapshot.mediaAssets}
        />
      </div>
      <AdminLeadsTable leads={snapshot.leads} />
    </div>
  );
}
