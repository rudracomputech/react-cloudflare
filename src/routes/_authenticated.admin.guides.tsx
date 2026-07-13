import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/guides")({
  head: () => ({ meta: [{ title: "Admin — Guides" }] }),
  component: GuidesAdmin,
});

function GuidesAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-guides"],
    queryFn: async () => (await supabase.from("guides").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const [slug, setSlug] = useState(""); const [title, setTitle] = useState(""); const [body, setBody] = useState("");
  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("guides").insert({ slug, title, body_md: body });
    if (error) return toast.error(error.message);
    setSlug(""); setTitle(""); setBody(""); qc.invalidateQueries({ queryKey: ["admin-guides"] });
  }
  async function toggle(id: string, p: boolean) { await supabase.from("guides").update({ published: !p }).eq("id", id); qc.invalidateQueries({ queryKey: ["admin-guides"] }); }
  async function del(id: string) { if (!confirm("Delete?")) return; await supabase.from("guides").delete().eq("id", id); qc.invalidateQueries({ queryKey: ["admin-guides"] }); }
  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold">Guides</h1>
      <form onSubmit={add} className="mb-6 space-y-3 rounded-sm border border-border bg-background p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <input required value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug" className="rounded-sm border border-border bg-background px-3 py-2 text-sm" />
          <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="rounded-sm border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <textarea required value={body} onChange={(e) => setBody(e.target.value)} rows={8} placeholder="Markdown body" className="w-full rounded-sm border border-border bg-background px-3 py-2 font-mono text-sm" />
        <button className="rounded-sm bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">Add guide</button>
      </form>
      <ul className="space-y-2">
        {(data ?? []).map((g: any) => (
          <li key={g.id} className="flex items-center justify-between rounded-sm border border-border bg-background p-4">
            <div>
              <div className="text-sm font-semibold">{g.title}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{g.slug} · {g.published ? "Published" : "Draft"}</div>
            </div>
            <div className="flex gap-3 text-xs">
              <button onClick={() => toggle(g.id, g.published)} className="underline">{g.published ? "Unpublish" : "Publish"}</button>
              <button onClick={() => del(g.id)} className="text-destructive underline">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}