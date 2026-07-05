import Link from "next/link";
import type { ReactNode } from "react";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { type Locale } from "@/lib/site-types";

type Props = {
  children: ReactNode;
  locale: Locale;
};

const labels = {
  en: {
    home: "Home",
    insights: "Insights",
    contact: "Contact",
    admin: "Admin"
  },
  tr: {
    home: "Ana Sayfa",
    insights: "İçgörüler",
    contact: "İletişim",
    admin: "Panel"
  }
} as const;

export function MarketingShell({ children, locale }: Props) {
  const copy = labels[locale];

  return (
    <div className="site-frame">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 pb-8 pt-6 md:px-10">
        <Link href={`/?lang=${locale}`} className="space-y-1">
          <div className="kicker">Burak Akçakanat</div>
          <div className="display-title text-xl text-white md:text-2xl">
            burakakcakanat.com.tr
          </div>
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          <nav className="flex items-center gap-5 text-sm text-white/70">
            <Link href={`/?lang=${locale}`} className="hover:text-white">
              {copy.home}
            </Link>
            <Link href={`/insights?lang=${locale}`} className="hover:text-white">
              {copy.insights}
            </Link>
            <Link href={`/contact?lang=${locale}`} className="hover:text-white">
              {copy.contact}
            </Link>
            <Link href="/admin" className="hover:text-white">
              {copy.admin}
            </Link>
          </nav>
          <LocaleSwitcher locale={locale} />
        </div>
        <div className="md:hidden">
          <LocaleSwitcher locale={locale} />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-16 md:px-10">
        {children}
      </main>
      <footer className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 pb-10 pt-4 text-sm text-white/48 md:flex-row md:items-center md:justify-between md:px-10">
        <p>Burak Akçakanat · Doha · Dubai · Istanbul</p>
        <p>Luxury editorial portfolio powered by Next.js and Supabase.</p>
      </footer>
    </div>
  );
}
