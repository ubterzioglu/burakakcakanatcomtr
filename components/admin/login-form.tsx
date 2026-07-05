"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ password })
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Authentication failed.");
      setIsLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="admin-card space-y-5">
      <div className="space-y-2">
        <label className="text-sm uppercase tracking-[0.28em] text-white/55">Password</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="field"
          placeholder="Enter admin password"
          required
        />
      </div>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      <button className="cta-primary w-full" type="submit" disabled={isLoading}>
        {isLoading ? "Opening..." : "Open private studio"}
      </button>
    </form>
  );
}
