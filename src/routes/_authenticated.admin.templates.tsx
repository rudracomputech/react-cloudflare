import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/templates")({
  head: () => ({ meta: [{ title: "Admin — Reply Templates" }] }),
  component: TemplatesAdmin,
});

function TemplatesAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-templates"],
    queryFn: async () => (await supabase.from("reply_templates").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const [channel, setChannel] = useState("email"); const [title, setTitle] = useState(""); const [body, setBody] = useState("");
  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("reply_templates").insert({ channel, title, body_md: body });
    if (error) return toast.error(error.message);
    setTitle(""); setBody(""); qc.invalidateQueries({ queryKey: ["admin-templates"] });
  }
  async function del(id: string) { if (!confirm("Delete?")) return; await supabase.from("reply_templates").delete().eq("id", id); qc.invalidateQueries({ queryKey: ["admin-templates"] }); }
  async function copy(text: string) { await navigator.clipboard.writeText(text); toast.success("Copied"); }
  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold">Quick-Reply Templates</h1>
      <form onSubmit={add} className="mb-6 space-y-3 rounded-sm border border-border bg-background p-4">
        <div className="flex gap-3">
          <select value={channel} onChange={(e) => setChannel(e.target.value)} className="rounded-sm border border-border bg-background px-3 py-2 text-sm">
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Template title" className="flex-1 rounded-sm border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <textarea required value={body} onChange={(e) => setBody(e.target.value)} rows={5} placeholder="Body — use {{order_number}}, {{name}} as placeholders" className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm" />
        <button className="rounded-sm bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">Add template</button>
      </form>
      <ul className="space-y-2">
        {(data ?? []).map((t: any) => (
          <li key={t.id} className="rounded-sm border border-border bg-background p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">{t.title}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t.channel}</div>
              </div>
              <div className="flex gap-3 text-xs">
                <button onClick={() => copy(t.body_md)} className="underline">Copy</button>
                <button onClick={() => del(t.id)} className="text-destructive underline">Delete</button>
              </div>
            </div>
            <pre className="mt-3 whitespace-pre-wrap rounded-sm bg-subtle p-3 font-mono text-xs">{t.body_md}</pre>
          </li>
        ))}
      </ul>
    </section>
  );
}