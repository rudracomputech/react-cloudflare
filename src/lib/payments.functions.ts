import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createStripeClient, type StripeEnv } from "@/lib/stripe.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const InputSchema = z.object({
  orderId: z.string().uuid(),
  priceId: z.string().regex(/^[a-zA-Z0-9_-]+$/),
  returnUrl: z.string().url(),
  environment: z.enum(["sandbox", "live"]),
});

export const createOrderCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((data) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, email, user_id, service_slug, amount, currency, stripe_session_id")
      .eq("id", data.orderId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) throw new Error("Order not found");

    const stripe = createStripeClient(data.environment as StripeEnv);

    const prices = await stripe.prices.list({ lookup_keys: [data.priceId] });
    if (!prices.data.length) throw new Error(`Price not found: ${data.priceId}`);
    const stripePrice = prices.data[0];

    // Resolve / create a Stripe customer keyed off userId or email
    let customerId: string | undefined;
    if (order.user_id) {
      const found = await stripe.customers.search({
        query: `metadata['userId']:'${order.user_id}'`,
        limit: 1,
      });
      if (found.data.length) customerId = found.data[0].id;
    }
    if (!customerId && order.email) {
      const existing = await stripe.customers.list({ email: order.email, limit: 1 });
      if (existing.data.length) {
        customerId = existing.data[0].id;
        if (order.user_id && existing.data[0].metadata?.userId !== order.user_id) {
          await stripe.customers.update(customerId, {
            metadata: { ...existing.data[0].metadata, userId: order.user_id },
          });
        }
      }
    }
    if (!customerId) {
      const created = await stripe.customers.create({
        email: order.email ?? undefined,
        ...(order.user_id && { metadata: { userId: order.user_id } }),
      });
      customerId = created.id;
    }

    const productId = typeof stripePrice.product === "string"
      ? stripePrice.product
      : (stripePrice.product as any).id;
    const product = await stripe.products.retrieve(productId);

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: stripePrice.id, quantity: 1 }],
      mode: "payment",
      ui_mode: "embedded_page",
      return_url: data.returnUrl,
      customer: customerId,
      payment_intent_data: { description: `${product.name} — ${order.order_number}` },
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        ...(order.user_id && { userId: order.user_id }),
      },
    });

    await supabaseAdmin
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return session.client_secret;
  });

export const verifyCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({
      sessionId: z.string().min(8),
      environment: z.enum(["sandbox", "live"]),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const stripe = createStripeClient(data.environment as StripeEnv);
    const session = await stripe.checkout.sessions.retrieve(data.sessionId);
    return {
      paid: session.payment_status === "paid",
      orderNumber: session.metadata?.order_number ?? null,
      amount_total: session.amount_total,
      currency: session.currency,
    };
  });