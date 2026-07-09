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
    <form onSubmit={onSubmit} className="adm-card space-y-4 p-6">
      <div className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">Password</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="adm-field"
          placeholder="Enter admin password"
          autoFocus
          required
        />
      </div>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      <button className="adm-btn adm-btn-primary w-full" type="submit" disabled={isLoading}>
        {isLoading ? "Opening..." : "Sign in"}
      </button>
    </form>
  );
}
