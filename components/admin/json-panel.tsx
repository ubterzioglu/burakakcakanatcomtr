"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type Props = {
  title: string;
  resource: string;
  description: string;
  initialValue: unknown;
};

export function AdminJsonPanel({ title, resource, description, initialValue }: Props) {
  const [value, setValue] = useState(JSON.stringify(initialValue, null, 2));
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function save() {
    setStatus("saving");

    let parsed: unknown;
    try {
      parsed = JSON.parse(value);
    } catch {
      setStatus("error");
      setMessage("JSON format is invalid.");
      return;
    }

    const response = await fetch(`/api/admin/content/${resource}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ payload: parsed })
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus("error");
      setMessage(data?.error ?? "Save failed.");
      return;
    }

    setStatus("success");
    setMessage("Saved to Supabase.");
  }

  return (
    <section className="admin-card space-y-4">
      <div className="space-y-2">
        <h3 className="display-title text-2xl text-white">{title}</h3>
        <p className="text-sm leading-6 text-white/58">{description}</p>
      </div>
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="field min-h-80 font-mono text-xs leading-6"
      />
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p
          className={cn(
            "text-sm",
            status === "success"
              ? "text-emerald-300"
              : status === "error"
                ? "text-rose-300"
                : "text-white/44"
          )}
        >
          {message || "Edit JSON directly, then sync the resource."}
        </p>
        <button className="cta-secondary" type="button" onClick={() => void save()}>
          {status === "saving" ? "Saving..." : "Sync resource"}
        </button>
      </div>
    </section>
  );
}
