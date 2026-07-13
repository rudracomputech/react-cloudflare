import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/testimonials")({
  head: () => ({ meta: [{ title: "Admin — Testimonials" }] }),
  component: Testimonials,
});

function Testimonials() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => (await supabase.from("testimonials").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const [name, setName] = useState(""); const [country, setCountry] = useState(""); const [body, setBody] = useState(""); const [rating, setRating] = useState("5");
  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("testimonials").insert({ author_name: name, author_country: country || null, body, rating: Number(rating), published: true });
    if (error) return toast.error(error.message);
    setName(""); setCountry(""); setBody(""); qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
  }
  async function toggle(id: string, p: boolean) { await supabase.from("testimonials").update({ published: !p }).eq("id", id); qc.invalidateQueries({ queryKey: ["admin-testimonials"] }); }
  async function del(id: string) { if (!confirm("Delete?")) return; await supabase.from("testimonials").delete().eq("id", id); qc.invalidateQueries({ queryKey: ["admin-testimonials"] }); }

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold">Testimonials</h1>
      <form onSubmit={add} className="mb-6 space-y-3 rounded-sm border border-border bg-background p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Author name" className="rounded-sm border border-border bg-background px-3 py-2 text-sm" />
          <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country (e.g. IN)" className="rounded-sm border border-border bg-background px-3 py-2 text-sm" />
          <input value={rating} onChange={(e) => setRating(e.target.value)} type="number" min={1} max={5} className="rounded-sm border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <textarea required value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Testimonial body" className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm" />
        <button className="rounded-sm bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">Add</button>
      </form>
      <ul className="space-y-3">
        {(data ?? []).map((t) => (
          <li key={t.id} className="rounded-sm border border-border bg-background p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">{t.author_name} {t.author_country && <span className="text-muted-foreground">· {t.author_country}</span>}</div>
                <div className="text-xs text-muted-foreground">★ {t.rating ?? "—"}</div>
              </div>
              <div className="flex gap-3 text-xs">
                <button onClick={() => toggle(t.id, t.published)} className="underline">{t.published ? "Unpublish" : "Publish"}</button>
                <button onClick={() => del(t.id)} className="text-destructive underline">Delete</button>
              </div>
            </div>
            <p className="mt-2 text-sm">{t.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}