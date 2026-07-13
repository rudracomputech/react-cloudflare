import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageLayout, PageHero } from "@/components/site/PageLayout";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Your account — AeroPrior" }] }),
  component: AccountPage,
});

function AccountPage() {
  const { user, signOut, isAdmin } = useAuth();
  const { data: orders } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, service_slug, status, payment_status, amount, currency, created_at, customer_message")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <PageLayout>
      <PageHero eyebrow="Account" title="Your orders" subtitle={user?.email ?? undefined} />
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-3">
            <Link to="/services/flight-reservation" className="rounded-sm bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">New order</Link>
            {isAdmin && <Link to="/admin/orders" className="rounded-sm border border-border px-4 py-2 text-sm font-semibold">Admin</Link>}
          </div>
          <button onClick={() => signOut()} className="text-xs text-muted-foreground hover:text-foreground">Sign out</button>
        </div>

        {!orders?.length ? (
          <div className="rounded-sm border border-border bg-subtle p-12 text-center text-sm text-muted-foreground">
            No orders yet. <Link to="/services/flight-reservation" className="text-foreground underline">Start your first reservation</Link>.
          </div>
        ) : (
          <div className="overflow-hidden rounded-sm border border-border">
            <table className="w-full text-sm">
              <thead className="bg-subtle font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Order</th>
                  <th className="px-4 py-3 text-left">Service</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Payment</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-border hover:bg-subtle">
                    <td className="px-4 py-3 font-mono text-xs">
                      <Link to="/account/orders/$id" params={{ id: o.id }} className="text-accent hover:underline">{o.order_number}</Link>
                    </td>
                    <td className="px-4 py-3">{o.service_slug}</td>
                    <td className="px-4 py-3"><Status v={o.status} /></td>
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
    </PageLayout>
  );
}

function Status({ v }: { v: string }) {
  const color =
    v === "delivered" ? "bg-emerald-500/15 text-emerald-400" :
    v === "in_progress" ? "bg-blue-500/15 text-blue-400" :
    v === "cancelled" || v === "refunded" ? "bg-destructive/15 text-destructive" :
    "bg-muted text-muted-foreground";
  return <span className={`rounded-sm px-2 py-0.5 text-[11px] font-medium ${color}`}>{v}</span>;
}