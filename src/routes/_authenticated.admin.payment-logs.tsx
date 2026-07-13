import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/payment-logs")({
  head: () => ({ meta: [{ title: "Admin — Payment Logs" }] }),
  component: PaymentLogs,
});

function PaymentLogs() {
  const { data } = useQuery({
    queryKey: ["admin-payment-logs"],
    queryFn: async () => (await supabase.from("payment_logs").select("*").order("created_at", { ascending: false }).limit(200)).data ?? [],
  });
  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold">Payment Logs</h1>
      <div className="overflow-x-auto rounded-sm border border-border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-subtle text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr><th className="px-4 py-2">When</th><th className="px-4 py-2">Provider</th><th className="px-4 py-2">Event</th><th className="px-4 py-2">Order</th><th className="px-4 py-2">Payload</th></tr>
          </thead>
          <tbody>
            {(data ?? []).map((r: any) => (
              <tr key={r.id} className="border-t border-border align-top">
                <td className="px-4 py-2 font-mono text-xs">{new Date(r.created_at).toLocaleString()}</td>
                <td className="px-4 py-2">{r.provider}</td>
                <td className="px-4 py-2 font-mono text-xs">{r.event_type}</td>
                <td className="px-4 py-2 font-mono text-xs">{r.order_id ?? "—"}</td>
                <td className="px-4 py-2"><pre className="max-w-md overflow-x-auto whitespace-pre-wrap font-mono text-[11px] text-muted-foreground">{JSON.stringify(r.payload, null, 2)}</pre></td>
              </tr>
            ))}
            {(data ?? []).length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">No payment events yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}