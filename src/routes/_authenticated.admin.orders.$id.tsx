import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadOrderDocument, updateOrderAdmin } from "@/lib/admin.functions";
import { generateOrderDocumentSignedUrl } from "@/lib/documents.functions";

export const Route = createFileRoute("/_authenticated/admin/orders/$id")({
  head: ({ params }) => ({ meta: [{ title: `Order ${params.id.slice(0, 8)} — Admin` }] }),
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const update = useServerFn(updateOrderAdmin);
  const upload = useServerFn(uploadOrderDocument);
  const signUrl = useServerFn(generateOrderDocumentSignedUrl);

  const { data: order } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const { data: docs } = useQuery({
    queryKey: ["admin-order-docs", id],
    queryFn: async () => (await supabase.from("order_documents").select("*").eq("order_id", id).order("created_at", { ascending: false })).data ?? [],
  });
  const { data: events } = useQuery({
    queryKey: ["admin-order-events", id],
    queryFn: async () => (await supabase.from("order_events").select("*").eq("order_id", id).order("created_at", { ascending: false }).limit(50)).data ?? [],
  });

  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [busy, setBusy] = useState(false);

  if (!order) return <section className="mx-auto max-w-5xl px-6 py-10 text-sm text-muted-foreground">Loading…</section>;

  async function save() {
    setBusy(true);
    try {
      await update({ data: {
        orderId: id,
        ...(status && { status: status as any }),
        ...(priority && { priority: priority as any }),
        ...(notes && { internal_notes: notes }),
        ...(msg && { customer_message: msg }),
      }});
      toast.success("Order updated");
      qc.invalidateQueries({ queryKey: ["admin-order", id] });
      qc.invalidateQueries({ queryKey: ["admin-order-events", id] });
      setNotes(""); setMsg(""); setStatus(""); setPriority("");
    } catch (e: any) { toast.error(e.message); }
    setBusy(false);
  }

  async function onUpload(file: File) {
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let bin = "";
      for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      const b64 = btoa(bin);
      await upload({ data: { orderId: id, filename: file.name, contentBase64: b64, contentType: file.type || "application/octet-stream" } });
      toast.success("Uploaded");
      qc.invalidateQueries({ queryKey: ["admin-order-docs", id] });
      qc.invalidateQueries({ queryKey: ["admin-order-events", id] });
    } catch (e: any) { toast.error(e.message); }
    setBusy(false);
  }

  async function download(docId: string) {
    try {
      const { url } = await signUrl({ data: { documentId: docId } });
      window.open(url, "_blank");
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <Link to="/admin/orders" className="text-xs text-muted-foreground hover:text-foreground">← All orders</Link>
      <h1 className="mt-2 text-2xl font-bold">{order.order_number}</h1>
      <p className="text-sm text-muted-foreground">{order.email} · {order.service_slug}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Customer form">
            <pre className="overflow-x-auto rounded-sm bg-subtle p-3 text-[11px]">{JSON.stringify(order.form_data, null, 2)}</pre>
            <div className="mt-3 text-xs">
              <div className="font-mono uppercase tracking-widest text-muted-foreground">Passengers</div>
              <pre className="overflow-x-auto rounded-sm bg-subtle p-3 text-[11px]">{JSON.stringify(order.passengers, null, 2)}</pre>
            </div>
          </Card>

          <Card title="Documents">
            <input type="file" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
              disabled={busy}
              className="block w-full text-xs file:mr-3 file:rounded-sm file:border-0 file:bg-accent file:px-3 file:py-2 file:text-accent-foreground" />
            <ul className="mt-4 divide-y divide-border text-sm">
              {(docs ?? []).map((d) => (
                <li key={d.id} className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm">{d.filename}</div>
                    <div className="text-[11px] text-muted-foreground">{new Date(d.created_at).toLocaleString()} · {d.download_count} downloads</div>
                  </div>
                  <button onClick={() => download(d.id)} className="text-xs text-accent hover:underline">Download</button>
                </li>
              ))}
              {!docs?.length && <li className="py-4 text-xs text-muted-foreground">No documents uploaded.</li>}
            </ul>
          </Card>

          <Card title="Activity">
            <ul className="divide-y divide-border text-xs">
              {(events ?? []).map((e: any) => (
                <li key={e.id} className="py-2">
                  <span className="font-mono">{e.type}</span> · <span className="text-muted-foreground">{new Date(e.created_at).toLocaleString()}</span>
                </li>
              ))}
              {!events?.length && <li className="py-2 text-muted-foreground">No events yet.</li>}
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Status & priority">
            <Row k="Status" v={order.status} />
            <Row k="Payment" v={order.payment_status} />
            <Row k="Priority" v={order.priority} />
            <Row k="Amount" v={`${order.currency} ${Number(order.amount).toFixed(2)}`} />
            <Row k="Created" v={new Date(order.created_at).toLocaleString()} />
            {order.paid_at && <Row k="Paid" v={new Date(order.paid_at).toLocaleString()} />}
            {order.delivered_at && <Row k="Delivered" v={new Date(order.delivered_at).toLocaleString()} />}
          </Card>

          <Card title="Update">
            <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">New status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm">
              <option value="">— keep —</option>
              {["pending","awaiting_payment","paid","in_progress","delivered","cancelled","refunded"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <label className="mt-3 block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm">
              <option value="">— keep —</option>
              {["standard","express","urgent"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <label className="mt-3 block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Internal notes (append)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm" />
            <label className="mt-3 block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Customer message</label>
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm" />
            <button onClick={save} disabled={busy} className="mt-4 w-full rounded-sm bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-60">Save</button>
          </Card>

          {order.internal_notes && (
            <Card title="Existing notes">
              <p className="whitespace-pre-wrap text-xs">{order.internal_notes}</p>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-border bg-background p-5">
      <h3 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-3 py-1 text-xs"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>;
}