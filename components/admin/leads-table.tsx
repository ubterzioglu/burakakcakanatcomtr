"use client";

import { useState } from "react";

import type { LeadRecord } from "@/lib/site-types";
import { formatDateLabel } from "@/lib/utils";

type Props = {
  leads: LeadRecord[];
};

const statuses = ["new", "reviewing", "contacted", "qualified", "closed"] as const;

export function AdminLeadsTable({ leads }: Props) {
  const [rows, setRows] = useState(leads);

  async function updateStatus(id: string, status: LeadRecord["status"]) {
    const response = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      return;
    }

    setRows((current) => current.map((row) => (row.id === id ? { ...row, status } : row)));
  }

  return (
    <section className="adm-card space-y-5 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Lead submissions</h3>
          <p className="text-[0.8rem] text-zinc-500">Partnership, investor, consulting, and community interest flows.</p>
        </div>
        <div className="adm-badge">{rows.length} records</div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-[0.7rem] uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-3 py-3 font-medium">Name</th>
              <th className="px-3 py-3 font-medium">Intent</th>
              <th className="px-3 py-3 font-medium">Locale</th>
              <th className="px-3 py-3 font-medium">Date</th>
              <th className="px-3 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((lead) => (
              <tr key={lead.id} className="border-t border-white/8">
                <td className="px-3 py-4 align-top">
                  <div className="font-medium text-zinc-100">{lead.name}</div>
                  <div className="text-zinc-500">{lead.email}</div>
                  {lead.company ? <div className="text-zinc-600">{lead.company}</div> : null}
                </td>
                <td className="px-3 py-4 align-top capitalize text-zinc-300">{lead.leadType}</td>
                <td className="px-3 py-4 align-top uppercase text-zinc-300">{lead.locale}</td>
                <td className="px-3 py-4 align-top text-zinc-300">
                  {formatDateLabel(lead.createdAt, lead.locale)}
                </td>
                <td className="px-3 py-4 align-top">
                  <select
                    value={lead.status}
                    onChange={(event) => void updateStatus(lead.id, event.target.value as LeadRecord["status"])}
                    className="adm-field min-w-36 py-2"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-zinc-500" colSpan={5}>
                  No leads yet. Once the public form is submitted, records will appear here.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
