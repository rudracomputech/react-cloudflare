import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/countries")({
  head: () => ({ meta: [{ title: "Admin — Country Pages" }] }),
  component: CountriesAdmin,
});

function CountriesAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-countries"],
    queryFn: async () => (await supabase.from("country_pages").select("*").order("country_name")).data ?? [],
  });
  const [slug, setSlug] = useState(""); const [name, setName] = useState(""); const [title, setTitle] = useState(""); const [body, setBody] = useState("");
  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("country_pages").insert({ slug, country_name: name, title, body_md: body });
    if (error) return toast.error(error.message);
    setSlug(""); setName(""); setTitle(""); setBody(""); qc.invalidateQueries({ queryKey: ["admin-countries"] });
  }
  async function toggle(id: string, p: boolean) { await supabase.from("country_pages").update({ published: !p }).eq("id", id); qc.invalidateQueries({ queryKey: ["admin-countries"] }); }
  async function del(id: string) { if (!confirm("Delete?")) return; await supabase.from("country_pages").delete().eq("id", id); qc.invalidateQueries({ queryKey: ["admin-countries"] }); }
  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold">Country Pages</h1>
      <form onSubmit={add} className="mb-6 space-y-3 rounded-sm border border-border bg-background p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <input required value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug (e.g. schengen)" className="rounded-sm border border-border bg-background px-3 py-2 text-sm" />
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Country name" className="rounded-sm border border-border bg-background px-3 py-2 text-sm" />
          <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Page title" className="rounded-sm border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <textarea required value={body} onChange={(e) => setBody(e.target.value)} rows={8} placeholder="Markdown body" className="w-full rounded-sm border border-border bg-background px-3 py-2 font-mono text-sm" />
        <button className="rounded-sm bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">Add country page</button>
      </form>
      <ul className="space-y-2">
        {(data ?? []).map((c: any) => (
          <li key={c.id} className="flex items-center justify-between rounded-sm border border-border bg-background p-4">
            <div>
              <div className="text-sm font-semibold">{c.country_name}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{c.slug} · {c.published ? "Published" : "Draft"}</div>
            </div>
            <div className="flex gap-3 text-xs">
              <button onClick={() => toggle(c.id, c.published)} className="underline">{c.published ? "Unpublish" : "Publish"}</button>
              <button onClick={() => del(c.id)} className="text-destructive underline">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}