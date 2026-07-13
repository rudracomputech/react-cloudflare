import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHero } from "@/components/site/PageLayout";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  head: () => ({ meta: [{ title: "Admin — Orders — AeroPrior" }] }),
  component: AdminOrders,
});

function AdminOrders() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");
  const { data: orders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, email, service_slug, status, payment_status, amount, currency, priority, created_at")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
  });
  const filtered = (orders ?? []).filter((o) => {
    if (status && o.status !== status) return false;
    if (q && !`${o.order_number} ${o.email} ${o.service_slug}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <PageHero eyebrow="Admin" title="Orders" subtitle="Operational queue across all customers." />
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-4 flex flex-wrap gap-3">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order #, email, service…"
            className="flex-1 min-w-[240px] rounded-sm border border-border bg-background px-3 py-2 text-sm" />
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="rounded-sm border border-border bg-background px-3 py-2 text-sm">
            <option value="">All statuses</option>
            {["pending","awaiting_payment","paid","in_progress","delivered","cancelled","refunded"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {!filtered.length ? (
          <div className="rounded-sm border border-border bg-subtle p-12 text-center text-sm text-muted-foreground">
            No orders match.
          </div>
        ) : (
          <div className="overflow-hidden rounded-sm border border-border">
            <table className="w-full text-sm">
              <thead className="bg-subtle font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Order</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Service</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Payment</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-t border-border hover:bg-subtle">
                    <td className="px-4 py-3 font-mono text-xs">
                      <Link to="/admin/orders/$id" params={{ id: o.id }} className="text-accent hover:underline">{o.order_number}</Link>
                    </td>
                    <td className="px-4 py-3 text-xs">{o.email}</td>
                    <td className="px-4 py-3">{o.service_slug}</td>
                    <td className="px-4 py-3 text-xs">{o.status}</td>
                    <td className="px-4 py-3 text-xs">{o.payment_status}</td>
                    <td className="px-4 py-3 text-right font-mono">{o.currency} {Number(o.amount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}