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

function countOf(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

export function AdminDashboard({ snapshot }: Props) {
  const router = useRouter();
  const [active, setActive] = useState<string>("updates");

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const navGroups = [
    {
      title: "Çalışma alanı",
      items: [
        { id: "updates", label: "Güncellemeler" },
        { id: "content", label: "İçerik" }
      ]
    },
    {
      title: "Projeler",
      items: adminProjects.map((project) => ({ id: project.id, label: project.name }))
    }
  ];

  const activeProject = adminProjects.find((project) => project.id === active);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1440px]">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/8 px-4 py-6 lg:flex">
        <SidebarBody
          navGroups={navGroups}
          active={active}
          onSelect={setActive}
          onLogout={() => void logout()}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav navGroups={navGroups} active={active} onSelect={setActive} onLogout={() => void logout()} />
        <main className="min-w-0 flex-1 px-5 py-8 md:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-6xl">
            {active === "updates" ? <OverviewSection snapshot={snapshot} onSelect={setActive} /> : null}
            {active === "content" ? <ContentSection snapshot={snapshot} /> : null}
            {activeProject ? <ProjectSection project={activeProject} /> : null}
          </div>
        </main>
      </div>
    </div>
  );
}

type NavGroup = { title: string; items: { id: string; label: string }[] };

function SidebarBody({
  navGroups,
  active,
  onSelect,
  onLogout
}: {
  navGroups: NavGroup[];
  active: string;
  onSelect: (id: string) => void;
  onLogout: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/90 text-sm font-bold text-white shadow-[0_8px_20px_rgba(79,70,229,0.35)]">
          BA
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">Admin</p>
          <p className="text-xs text-zinc-500">Burak Akçakanat</p>
        </div>
      </div>

      <nav className="mt-8 flex-1 space-y-6 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1.5">
            <p className="px-3 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-zinc-600">
              {group.title}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className={cn("adm-nav", active === item.id && "adm-nav-active")}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <button type="button" onClick={onLogout} className="adm-btn adm-btn-ghost mt-4 w-full">
        Sign out
      </button>
    </>
  );
}

function MobileNav({
  navGroups,
  active,
  onSelect,
  onLogout
}: {
  navGroups: NavGroup[];
  active: string;
  onSelect: (id: string) => void;
  onLogout: () => void;
}) {
  const items = navGroups.flatMap((group) => group.items);
  return (
    <div className="border-b border-white/8 px-5 py-4 lg:hidden">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/90 text-xs font-bold text-white">
            BA
          </div>
          <span className="text-sm font-semibold text-white">Admin</span>
        </div>
        <button type="button" onClick={onLogout} className="text-xs font-medium text-zinc-400 hover:text-white">
          Sign out
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition",
              active === item.id ? "bg-white/[0.08] text-white" : "text-zinc-400 hover:text-white"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ kicker, title, description }: { kicker: string; title: string; description: string }) {
  return (
    <div className="space-y-2">
      <p className="adm-kicker">{kicker}</p>
      <h1 className="adm-title text-3xl md:text-4xl">{title}</h1>
      <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">{description}</p>
    </div>
  );
}

function OverviewSection({ snapshot, onSelect }: { snapshot: Snapshot; onSelect: (id: string) => void }) {
  const stats = [
    { label: "Ventures", value: countOf(snapshot.ventures) },
    { label: "Insights", value: countOf(snapshot.insights) },
    { label: "Publications", value: countOf(snapshot.publications) },
    { label: "Leadler", value: countOf(snapshot.leads) }
  ];

  const firstProjectId = adminProjects[0]?.id;

  const actions = [
    {
      title: "İçeriği güncelle",
      description: "Hero, ventures, insights ve publications içeriğini JSON olarak düzenle.",
      cta: "İçeriğe git",
      onClick: () => onSelect("content")
    },
    {
      title: "Leadleri incele",
      description: "Gelen partnership, investor ve consulting taleplerini görüntüle ve durum ata.",
      cta: "Leadlere git",
      onClick: () => onSelect("content")
    },
    {
      title: "Projelere geç",
      description: "Shaman Life, Qualtron Sinclair, HCD ve PayAL admin panellerine hızlı erişim.",
      cta: "Projeleri aç",
      onClick: () => firstProjectId && onSelect(firstProjectId)
    }
  ];

  return (
    <div className="space-y-9">
      <SectionHeader
        kicker="Bakçakanat"
        title="Güncellemeler"
        description="Yönetim paneline hoş geldin. Buradan sitenin içeriğini düzenleyebilir, gelen leadleri inceleyebilir ve diğer projelerin admin panellerine geçebilirsin."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="adm-card p-4">
            <p className="text-2xl font-semibold tracking-tight text-white">{stat.value}</p>
            <p className="mt-1 text-xs text-zinc-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <p className="adm-kicker">Ne yapabilirsin?</p>
        <div className="grid gap-4 md:grid-cols-3">
          {actions.map((action) => (
            <button
              key={action.title}
              type="button"
              onClick={action.onClick}
              className="adm-card group flex flex-col p-5 text-left transition hover:border-white/20 hover:bg-white/[0.04]"
            >
              <p className="text-base font-semibold text-white">{action.title}</p>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-zinc-500">{action.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-300 transition group-hover:text-indigo-200">
                {action.cta}
                <span aria-hidden>→</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContentSection({ snapshot }: { snapshot: Snapshot }) {
  return (
    <div className="space-y-8">
      <SectionHeader
        kicker="Bakçakanat"
        title="İçerik"
        description="Sitenin hero, ventures, insights, publications içeriğini ve gelen leadleri buradan güncelleyin. Alanlar Supabase'te typed JSON olarak saklanır."
      />

      <div className="grid gap-5 xl:grid-cols-2">
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
    <div className="space-y-8">
      <SectionHeader kicker="Proje kısayolu" title={project.name} description={project.description} />

      <div className="adm-card flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">Admin paneli</p>
          <p className="break-all font-mono text-sm text-zinc-200">{project.domain}</p>
        </div>
        <a href={project.adminUrl} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-primary">
          Admin panelini aç
          <span aria-hidden>↗</span>
        </a>
      </div>

      <p className="text-xs leading-6 text-zinc-500">
        Bağlantı yeni sekmede açılır ve ilgili sitenin kendi admin şifresini sorar. Burada hiçbir şifre saklanmaz.
      </p>
    </div>
  );
}
