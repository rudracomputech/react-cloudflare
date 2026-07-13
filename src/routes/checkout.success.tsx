import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout, PageHero } from "@/components/site/PageLayout";
import { verifyCheckoutSession } from "@/lib/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";

const search = z.object({ order: z.string().optional(), session_id: z.string().optional() });

export const Route = createFileRoute("/checkout/success")({
  head: () => ({ meta: [{ title: "Order received — AeroPrior" }] }),
  validateSearch: (s) => search.parse(s),
  component: SuccessPage,
});

function SuccessPage() {
  const { order, session_id } = Route.useSearch();

  const { data: verified } = useQuery({
    queryKey: ["verify-session", session_id],
    enabled: !!session_id,
    queryFn: async () =>
      verifyCheckoutSession({ data: { sessionId: session_id!, environment: getStripeEnvironment() } }),
  });

  const { data, refetch } = useQuery({
    queryKey: ["order", order],
    enabled: !!order,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("order_number, service_slug, status, payment_status, amount, currency, created_at")
        .eq("order_number", order!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!data || data.status !== "awaiting_payment") return;
    const t = setInterval(() => { refetch(); }, 2000);
    const stop = setTimeout(() => clearInterval(t), 30_000);
    return () => { clearInterval(t); clearTimeout(stop); };
  }, [data, refetch]);

  return (
    <PageLayout>
      <PageHero
        eyebrow="Confirmation"
        title={verified?.paid || data?.payment_status === "paid" ? "Payment confirmed" : "Order received"}
        subtitle="Your request is in our queue. We'll email and WhatsApp you the document as soon as it's ready."
      />
      <section className="mx-auto max-w-2xl px-6 py-12">
        <div className="rounded-sm border border-border bg-subtle p-8">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Order ID</div>
          <div className="font-mono text-xl">{data?.order_number ?? order ?? "—"}</div>
          {data && (
            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              <div>Service: <span className="text-foreground">{data.service_slug}</span></div>
              <div>Status: <span className="text-foreground">{data.status}</span></div>
              <div>Payment: <span className="text-foreground">{data.payment_status}</span></div>
              <div>Total: <span className="text-foreground">{data.currency} {Number(data.amount).toFixed(2)}</span></div>
            </div>
          )}
          <div className="mt-8 flex gap-3">
            <Link to="/account" className="rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground">View in account</Link>
            <Link to="/track-order" className="rounded-sm border border-border px-5 py-2.5 text-sm">Track order</Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}