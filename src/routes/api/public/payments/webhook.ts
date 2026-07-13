import { createFileRoute } from "@tanstack/react-router";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";

let _supabase: SupabaseClient<Database> | null = null;
function getSupabase(): SupabaseClient<Database> {
  if (!_supabase) {
    _supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _supabase;
}

async function handleCheckoutCompleted(session: any, env: StripeEnv) {
  const sb = getSupabase();
  const orderId = session.metadata?.order_id as string | undefined;
  const paymentIntentId = (session.payment_intent as string | null) ?? null;

  const update = {
    payment_status: "paid" as const,
    status: "in_progress" as const,
    paid_at: new Date().toISOString(),
    stripe_payment_intent_id: paymentIntentId,
    updated_at: new Date().toISOString(),
  };

  const query = orderId
    ? sb.from("orders").update(update).eq("id", orderId)
    : sb.from("orders").update(update).eq("stripe_session_id", session.id);

  const { data, error } = await query.select("id, order_number").maybeSingle();
  if (error) console.error("Failed to mark order paid", error);

  if (data) {
    await sb.from("order_events").insert({
      order_id: (data as any).id,
      type: "payment.completed",
      payload: { session_id: session.id, env, payment_intent: paymentIntentId },
    });
    await sb.from("payment_logs").insert({
      order_id: (data as any).id,
      provider: "stripe",
      event_type: "checkout.session.completed",
      payload: { session_id: session.id, env, amount_total: session.amount_total },
    });
  }
}

async function handlePaymentFailed(intent: any, env: StripeEnv) {
  const sb = getSupabase();
  await sb.from("payment_logs").insert({
    provider: "stripe",
    event_type: "payment_intent.payment_failed",
    payload: { intent_id: intent.id, env, error: intent.last_payment_error?.message ?? null },
  });
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          return Response.json({ received: true, ignored: "invalid env" });
        }
        const env: StripeEnv = rawEnv;
        try {
          const event = await verifyWebhook(request, env);
          switch (event.type) {
            case "checkout.session.completed":
            case "transaction.completed":
              await handleCheckoutCompleted(event.data.object, env);
              break;
            case "payment_intent.payment_failed":
            case "transaction.payment_failed":
              await handlePaymentFailed(event.data.object, env);
              break;
            default:
              // ignore
              break;
          }
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});