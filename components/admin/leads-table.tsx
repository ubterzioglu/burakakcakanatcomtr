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
    <section className="admin-card space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="display-title text-2xl text-white">Lead submissions</h3>
          <p className="text-sm text-white/55">Partnership, investor, consulting, and community interest flows.</p>
        </div>
        <div className="rounded-full border border-white/12 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/58">
          {rows.length} records
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-white/50">
            <tr>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Intent</th>
              <th className="px-3 py-3">Locale</th>
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((lead) => (
              <tr key={lead.id} className="border-t border-white/8">
                <td className="px-3 py-4 align-top">
                  <div className="font-medium text-white">{lead.name}</div>
                  <div className="text-white/45">{lead.email}</div>
                  {lead.company ? <div className="text-white/35">{lead.company}</div> : null}
                </td>
                <td className="px-3 py-4 align-top capitalize text-white/72">{lead.leadType}</td>
                <td className="px-3 py-4 align-top uppercase text-white/72">{lead.locale}</td>
                <td className="px-3 py-4 align-top text-white/72">
                  {formatDateLabel(lead.createdAt, lead.locale)}
                </td>
                <td className="px-3 py-4 align-top">
                  <select
                    value={lead.status}
                    onChange={(event) => void updateStatus(lead.id, event.target.value as LeadRecord["status"])}
                    className="field min-w-36 py-2"
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
                <td className="px-3 py-4 text-white/42" colSpan={5}>
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
