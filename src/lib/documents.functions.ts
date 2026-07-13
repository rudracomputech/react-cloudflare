import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const generateOrderDocumentSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ documentId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { data: doc, error } = await supabaseAdmin
      .from("order_documents")
      .select("id, storage_path, filename, order_id, orders!inner(user_id)")
      .eq("id", data.documentId)
      .maybeSingle();
    if (error || !doc) throw new Error("Document not found");

    const owner = (doc as any).orders?.user_id as string | null;

    // Check role from DB (admin client bypasses RLS)
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const isStaff = (roles ?? []).some((r: any) =>
      ["super_admin", "admin", "support_agent", "fulfillment_agent"].includes(r.role),
    );
    if (!isStaff && owner !== userId) throw new Error("Forbidden");

    const { data: signed, error: sErr } = await supabaseAdmin.storage
      .from("order-documents")
      .createSignedUrl(doc.storage_path, 60 * 10, { download: doc.filename });
    if (sErr || !signed) throw new Error(sErr?.message ?? "Failed to sign URL");

    // Audit
    await supabaseAdmin.from("order_document_downloads").insert({
      document_id: doc.id,
      ip: null,
      user_agent: null,
    });
    await supabaseAdmin
      .from("order_documents")
      .update({
        download_count: ((doc as any).download_count ?? 0) + 1,
        last_downloaded_at: new Date().toISOString(),
      })
      .eq("id", doc.id);
    await supabaseAdmin.from("order_events").insert({
      order_id: doc.order_id,
      type: "document.downloaded",
      actor_id: userId,
      payload: { document_id: doc.id, filename: doc.filename },
    });

    return { url: signed.signedUrl, filename: doc.filename };
  });

export const markOrderDelivered = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ orderId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: roles } = await supabaseAdmin
      .from("user_roles").select("role").eq("user_id", userId);
    const isStaff = (roles ?? []).some((r: any) =>
      ["super_admin","admin","fulfillment_agent"].includes(r.role));
    if (!isStaff) throw new Error("Forbidden");

    await supabaseAdmin
      .from("orders")
      .update({ status: "delivered", delivered_at: new Date().toISOString() })
      .eq("id", data.orderId);
    await supabaseAdmin.from("order_events").insert({
      order_id: data.orderId,
      type: "order.delivered",
      actor_id: userId,
      payload: {},
    });
    return { ok: true };
  });