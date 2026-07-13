import { createFileRoute } from "@tanstack/react-router";
import { PageLayout, PageHero } from "@/components/site/PageLayout";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/track-order")({
  head: () => ({
    meta: [
      { title: "Track your order — AeroPrior" },
      { name: "description", content: "Look up the status of your reservation by order ID and email." },
      { property: "og:title", content: "Track your order — AeroPrior" },
      { property: "og:description", content: "Look up status and download documents by order ID." },
      { property: "og:url", content: "/track-order" },
    ],
    links: [{ rel: "canonical", href: "/track-order" }],
  }),
  component: TrackPage,
});

function TrackPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<null | { order_number: string; status: string; payment_status: string; service_slug: string; created_at: string; customer_message: string | null; delivered_at: string | null }>(null);
  const [busy, setBusy] = useState(false);

  async function lookup(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setResult(null);
    const { data, error } = await supabase
      .from("orders")
      .select("order_number, status, payment_status, service_slug, created_at, customer_message, delivered_at")
      .eq("order_number", orderId.trim())
      .eq("email", email.trim())
      .maybeSingle();
    setBusy(false);
    if (error) return toast.error(error.message);
    if (!data) return toast.error("No order found with that ID and email.");
    setResult(data);
  }

  return (
    <PageLayout>
      <PageHero
        eyebrow="Status"
        title="Track your order"
        subtitle="Enter your order ID and the email you used at checkout. Status updates appear in real time as your document moves through fulfillment."
      />
      <section className="mx-auto max-w-xl px-6 py-16">
        <form onSubmit={lookup} className="space-y-5 rounded-sm border border-border bg-subtle p-8">
          <div>
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Order ID</label>
            <input value={orderId} onChange={(e) => setOrderId(e.target.value)} required className="w-full rounded-sm border border-border bg-background px-4 py-3 font-mono text-sm focus:border-accent focus:outline-none" placeholder="AP-YYYYMMDD-XXXXXX" />
          </div>
          <div>
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-sm border border-border bg-background px-4 py-3 text-sm focus:border-accent focus:outline-none" placeholder="you@example.com" />
          </div>
          <button disabled={busy} className="w-full rounded-sm bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent/90 disabled:opacity-60">{busy ? "Looking up…" : "Look up status"}</button>
        </form>

        {result && (
          <div className="mt-8 space-y-3 rounded-sm border border-border bg-background p-6 text-sm">
            <Row k="Order" v={result.order_number} />
            <Row k="Service" v={result.service_slug} />
            <Row k="Status" v={result.status} />
            <Row k="Payment" v={result.payment_status} />
            <Row k="Created" v={new Date(result.created_at).toLocaleString()} />
            {result.delivered_at && <Row k="Delivered" v={new Date(result.delivered_at).toLocaleString()} />}
            {result.customer_message && (
              <div className="mt-4 rounded-sm border border-border bg-subtle p-4 text-xs leading-relaxed">
                <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Message from support</div>
                {result.customer_message}
              </div>
            )}
          </div>
        )}
      </section>
    </PageLayout>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{k}</span>
      <span className="text-right">{v}</span>
    </div>
  );
}