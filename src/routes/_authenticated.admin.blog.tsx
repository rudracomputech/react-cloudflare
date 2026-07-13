import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/blog")({
  head: () => ({ meta: [{ title: "Admin — Blog" }] }),
  component: Blog,
});

function Blog() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-blog"],
    queryFn: async () => (await supabase.from("blog_posts").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const [title, setTitle] = useState(""); const [slug, setSlug] = useState(""); const [excerpt, setExcerpt] = useState(""); const [body, setBody] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("blog_posts").insert({ title, slug: slug || title.toLowerCase().replace(/\s+/g, "-"), excerpt, body_md: body });
    if (error) return toast.error(error.message);
    setTitle(""); setSlug(""); setExcerpt(""); setBody(""); qc.invalidateQueries({ queryKey: ["admin-blog"] });
  }
  async function publish(id: string, p: boolean) {
    await supabase.from("blog_posts").update({ published: !p, published_at: !p ? new Date().toISOString() : null }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-blog"] });
  }
  async function del(id: string) { if (!confirm("Delete?")) return; await supabase.from("blog_posts").delete().eq("id", id); qc.invalidateQueries({ queryKey: ["admin-blog"] }); }

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold">Blog posts</h1>
      <form onSubmit={add} className="mb-6 space-y-3 rounded-sm border border-border bg-background p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="rounded-sm border border-border bg-background px-3 py-2 text-sm" />
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug (auto)" className="rounded-sm border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Excerpt" className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm" />
        <textarea required value={body} onChange={(e) => setBody(e.target.value)} rows={8} placeholder="Body (markdown)" className="w-full rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs" />
        <button className="rounded-sm bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">Create draft</button>
      </form>
      <ul className="space-y-2">
        {(data ?? []).map((p) => (
          <li key={p.id} className="flex items-center justify-between rounded-sm border border-border bg-background p-4">
            <div>
              <div className="text-sm font-semibold">{p.title}</div>
              <div className="text-xs text-muted-foreground">/{p.slug} · {p.published ? "Published" : "Draft"}</div>
            </div>
            <div className="flex gap-3 text-xs">
              <button onClick={() => publish(p.id, p.published)} className="underline">{p.published ? "Unpublish" : "Publish"}</button>
              <button onClick={() => del(p.id)} className="text-destructive underline">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}