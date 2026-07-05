"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

type Props = {
  locale: "tr" | "en";
};

export function LocaleSwitcher({ locale }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function hrefFor(nextLocale: "tr" | "en") {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", nextLocale);
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  return (
    <div className="inline-flex rounded-full border border-white/12 bg-white/6 p-1">
      {(["en", "tr"] as const).map((item) => (
        <Link
          key={item}
          href={hrefFor(item)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em]",
            locale === item ? "bg-[#d4b06a] text-[#07111f]" : "text-white/60"
          )}
        >
          {item}
        </Link>
      ))}
    </div>
  );
}
