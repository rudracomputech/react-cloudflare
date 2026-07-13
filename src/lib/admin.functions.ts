import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertStaff(userId: string, roles: string[] = [
  "super_admin","admin","support_agent","fulfillment_agent","content_editor",
]) {
  const { data } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
  const ok = (data ?? []).some((r: any) => roles.includes(r.role));
  if (!ok) throw new Error("Forbidden");
}

export const uploadOrderDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    orderId: z.string().uuid(),
    filename: z.string().min(1).max(255),
    contentBase64: z.string().min(1),
    contentType: z.string().min(1).max(100),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context.userId);
    const bytes = Buffer.from(data.contentBase64, "base64");
    const path = `${data.orderId}/${Date.now()}-${data.filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("order-documents")
      .upload(path, bytes, { contentType: data.contentType, upsert: false });
    if (upErr) throw new Error(upErr.message);
    const { data: doc, error } = await supabaseAdmin.from("order_documents").insert({
      order_id: data.orderId,
      filename: data.filename,
      storage_path: path,
      uploaded_by: context.userId,
    }).select("id").single();
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("order_events").insert({
      order_id: data.orderId, type: "document.uploaded", actor_id: context.userId,
      payload: { document_id: doc.id, filename: data.filename },
    });
    return { id: doc.id };
  });

export const updateOrderAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    orderId: z.string().uuid(),
    status: z.enum(["pending","awaiting_payment","paid","in_progress","delivered","cancelled","refunded"]).optional(),
    priority: z.enum(["standard","express","urgent"]).optional(),
    internal_notes: z.string().max(5000).optional(),
    customer_message: z.string().max(5000).optional(),
    refund_risk_flag: z.boolean().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context.userId);
    const { orderId, ...patch } = data;
    const update: any = { ...patch };
    if (patch.status === "delivered") update.delivered_at = new Date().toISOString();
    const { error } = await supabaseAdmin.from("orders").update(update).eq("id", orderId);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("order_events").insert({
      order_id: orderId, type: "order.updated", actor_id: context.userId, payload: patch,
    });
    return { ok: true };
  });