import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout, PageHero } from "@/components/site/PageLayout";
import { generateOrderDocumentSignedUrl } from "@/lib/documents.functions";

export const Route = createFileRoute("/_authenticated/account/orders/$id")({
  head: () => ({ meta: [{ title: "Your order — AeroPrior" }] }),
  component: CustomerOrder,
});

function CustomerOrder() {
  const { id } = Route.useParams();
  const signUrl = useServerFn(generateOrderDocumentSignedUrl);

  const { data: order } = useQuery({
    queryKey: ["my-order", id],
    queryFn: async () => (await supabase.from("orders").select("*").eq("id", id).maybeSingle()).data,
  });
  const { data: docs } = useQuery({
    queryKey: ["my-order-docs", id],
    queryFn: async () => (await supabase.from("order_documents").select("id, filename, created_at").eq("order_id", id).order("created_at", { ascending: false })).data ?? [],
  });

  async function download(docId: string) {
    try {
      const { url } = await signUrl({ data: { documentId: docId } });
      window.open(url, "_blank");
    } catch (e: any) { toast.error(e.message); }
  }

  if (!order) return <PageLayout><div className="mx-auto max-w-3xl px-6 py-20 text-sm text-muted-foreground">Loading…</div></PageLayout>;

  return (
    <PageLayout>
      <PageHero eyebrow={`Order ${order.order_number}`} title={order.service_slug} subtitle={`${order.currency} ${Number(order.amount).toFixed(2)} · ${order.status}`} />
      <section className="mx-auto max-w-4xl px-6 py-10 space-y-6">
        <Link to="/account" className="text-xs text-muted-foreground hover:text-foreground">← All orders</Link>

        {order.customer_message && (
          <div className="rounded-sm border border-accent/40 bg-accent/5 p-5 text-sm">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-accent">Message from our team</div>
            <p className="whitespace-pre-wrap">{order.customer_message}</p>
          </div>
        )}

        <div className="rounded-sm border border-border bg-background p-5">
          <h3 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Documents</h3>
          {!docs?.length ? (
            <p className="text-sm text-muted-foreground">No documents yet. You'll receive an email when your reservation is ready.</p>
          ) : (
            <ul className="divide-y divide-border">
              {docs.map((d) => (
                <li key={d.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium">{d.filename}</div>
                    <div className="text-[11px] text-muted-foreground">{new Date(d.created_at).toLocaleString()}</div>
                  </div>
                  <button onClick={() => download(d.id)} className="rounded-sm bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground">Download</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-sm border border-border bg-subtle p-5 text-xs">
          <div className="font-mono uppercase tracking-widest text-muted-foreground">Status</div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Row k="Payment" v={order.payment_status} />
            <Row k="Priority" v={order.priority} />
            <Row k="Created" v={new Date(order.created_at).toLocaleString()} />
            {order.delivered_at && <Row k="Delivered" v={new Date(order.delivered_at).toLocaleString()} />}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-3"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>;
}