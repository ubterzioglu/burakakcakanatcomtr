"use client";

import { useRouter } from "next/navigation";

interface FilterSelectOption {
  value: string;
  label: string;
  href: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: FilterSelectOption[];
  className: string;
}

/**
 * Compact dropdown filter. Navigating via `<a>` chips wrapped every filter
 * onto its own row on narrow screens; a `<select>` keeps every filter group
 * to one line and lets them sit side by side in a grid.
 */
export function FilterSelect({ label, value, options, className }: FilterSelectProps) {
  const router = useRouter();

  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => {
          const selected = options.find((option) => option.value === event.target.value);
          if (selected) router.push(selected.href);
        }}
        className={className}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#0b0f0e] text-white">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
