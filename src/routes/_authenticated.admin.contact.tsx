import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/contact")({
  head: () => ({ meta: [{ title: "Admin — Inbox" }] }),
  component: Contact,
});

function Contact() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-contact"],
    queryFn: async () => (await supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(200)).data ?? [],
  });
  async function toggle(id: string, h: boolean) { await supabase.from("contact_messages").update({ handled: !h }).eq("id", id); qc.invalidateQueries({ queryKey: ["admin-contact"] }); }

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold">Inbox</h1>
      <ul className="space-y-3">
        {(data ?? []).map((m) => (
          <li key={m.id} className={`rounded-sm border p-4 ${m.handled ? "border-border bg-subtle" : "border-accent/40 bg-background"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">{m.name} <span className="font-normal text-muted-foreground">· {m.email}</span></div>
                {m.subject && <div className="text-xs text-muted-foreground">{m.subject}</div>}
                <div className="text-[11px] text-muted-foreground">{new Date(m.created_at).toLocaleString()}</div>
              </div>
              <button onClick={() => toggle(m.id, m.handled)} className="text-xs underline">{m.handled ? "Reopen" : "Mark handled"}</button>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm">{m.message}</p>
          </li>
        ))}
        {!data?.length && <li className="rounded-sm border border-border bg-subtle p-12 text-center text-sm text-muted-foreground">No messages yet.</li>}
      </ul>
    </section>
  );
}