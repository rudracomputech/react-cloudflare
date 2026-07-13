import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin Dashboard — AeroPrior" }] }),
  component: Dash,
});

function Dash() {
  const { data } = useQuery({
    queryKey: ["admin-dash"],
    queryFn: async () => {
      const [orders, paid, pending, contact] = await Promise.all([
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("payment_status", "paid"),
        supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["paid","in_progress"]),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("handled", false),
      ]);
      return {
        total: orders.count ?? 0,
        paid: paid.count ?? 0,
        pending: pending.count ?? 0,
        contact: contact.count ?? 0,
      };
    },
  });
  const cards = [
    { label: "Total orders", value: data?.total ?? "—", to: "/admin/orders" },
    { label: "Paid orders", value: data?.paid ?? "—", to: "/admin/orders" },
    { label: "In queue", value: data?.pending ?? "—", to: "/admin/orders" },
    { label: "Inbox (open)", value: data?.contact ?? "—", to: "/admin/contact" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="rounded-sm border border-border bg-background p-5 hover:border-accent">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{c.label}</div>
            <div className="mt-2 text-3xl font-bold">{c.value}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}