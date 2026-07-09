"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AdminJsonPanel } from "@/components/admin/json-panel";
import { AdminLeadsTable } from "@/components/admin/leads-table";
import { adminProjects, type AdminProject } from "@/lib/admin-projects";
import type { getAdminSnapshot } from "@/lib/site-data";
import { cn } from "@/lib/utils";

type Snapshot = Awaited<ReturnType<typeof getAdminSnapshot>>;

type Props = {
  snapshot: Snapshot;
};

export function AdminDashboard({ snapshot }: Props) {
  const router = useRouter();
  const [active, setActive] = useState<string>("bakcakanat");

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const navGroups = [
    {
      title: "Bu site",
      items: [
        { id: "bakcakanat", label: "Bakçakanat — İçerik" },
        { id: "updates", label: "Güncellemeler" }
      ]
    },
    {
      title: "Projeler",
      items: adminProjects.map((project) => ({ id: project.id, label: project.name }))
    }
  ];

  const activeProject = adminProjects.find((project) => project.id === active);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="lg:w-72 lg:flex-shrink-0">
        <div className="glass-panel space-y-6 rounded-[1.75rem] p-4 lg:sticky lg:top-8">
          <div className="space-y-1 px-2 pt-2">
            <p className="kicker">Private studio</p>
            <h2 className="display-title text-xl text-white">Admin</h2>
          </div>

          <nav className="space-y-5">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-2">
                <p className="px-3 text-[0.65rem] uppercase tracking-[0.3em] text-white/40">{group.title}</p>
                <ul className="space-y-1">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setActive(item.id)}
                        className={cn(
                          "w-full rounded-2xl border px-3 py-2.5 text-left text-sm transition",
                          active === item.id
                            ? "border-white/15 bg-white/10 text-white"
                            : "border-transparent text-white/60 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="px-2">
            <button className="cta-secondary w-full" type="button" onClick={() => void logout()}>
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 space-y-6">
        {active === "bakcakanat" ? <ContentSection snapshot={snapshot} /> : null}
        {active === "updates" ? <UpdatesSection /> : null}
        {activeProject ? <ProjectSection project={activeProject} /> : null}
      </main>
    </div>
  );
}

function ContentSection({ snapshot }: { snapshot: Snapshot }) {
  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[2rem] p-6 md:p-8">
        <div className="space-y-3">
          <p className="kicker">Bakçakanat</p>
          <h1 className="display-title max-w-3xl text-3xl text-white md:text-5xl">İçerik yönetimi</h1>
          <p className="body-muted max-w-2xl">
            Bu site için hero, ventures, insights, publications ve gelen leadleri düzenleyin. Alanlar
            Supabase&apos;te typed JSON olarak saklanır.
          </p>
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

function ProjectSection({ project }: { project: AdminProject }) {
  return (
    <section className="glass-panel space-y-6 rounded-[2rem] p-6 md:p-8">
      <div className="space-y-3">
        <p className="kicker">Proje kısayolu</p>
        <h1 className="display-title text-3xl text-white md:text-5xl">{project.name}</h1>
        <p className="body-muted max-w-2xl">{project.description}</p>
      </div>

      <div className="admin-card flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.28em] text-white/45">Admin paneli</p>
          <p className="break-all font-mono text-sm text-white/80">{project.domain}</p>
        </div>
        <a href={project.adminUrl} target="_blank" rel="noopener noreferrer" className="cta-primary">
          Admin panelini aç ↗
        </a>
      </div>

      <p className="text-xs leading-6 text-white/40">
        Bağlantı yeni sekmede açılır ve ilgili sitenin kendi admin şifresini sorar.
      </p>
    </section>
  );
}

function UpdatesSection() {
  return (
    <section className="glass-panel space-y-6 rounded-[2rem] p-6 md:p-8">
      <div className="space-y-3">
        <p className="kicker">Güncellemeler</p>
        <h1 className="display-title text-3xl text-white md:text-5xl">Güncellemeler</h1>
        <p className="body-muted max-w-2xl">
          Projeler arası notlar ve değişiklik kayıtları burada tutulacak.
        </p>
      </div>

      <div className="admin-card text-sm leading-7 text-white/55">
        Henüz güncelleme kaydı yok. Bu bölüm ileride değişiklik geçmişi ve notlar için kullanılacak.
      </div>
    </section>
  );
}
