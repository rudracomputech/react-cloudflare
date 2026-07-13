import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/faqs")({
  head: () => ({ meta: [{ title: "Admin — FAQs" }] }),
  component: FAQs,
});

function FAQs() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-faqs"],
    queryFn: async () => (await supabase.from("faqs").select("*").order("sort_order")).data ?? [],
  });
  const [q, setQ] = useState(""); const [a, setA] = useState(""); const [cat, setCat] = useState("");
  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("faqs").insert({ question: q, answer: a, category: cat || null });
    if (error) return toast.error(error.message);
    setQ(""); setA(""); setCat(""); qc.invalidateQueries({ queryKey: ["admin-faqs"] });
  }
  async function toggle(id: string, p: boolean) { await supabase.from("faqs").update({ published: !p }).eq("id", id); qc.invalidateQueries({ queryKey: ["admin-faqs"] }); }
  async function del(id: string) { if (!confirm("Delete?")) return; await supabase.from("faqs").delete().eq("id", id); qc.invalidateQueries({ queryKey: ["admin-faqs"] }); }

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold">FAQs</h1>
      <form onSubmit={add} className="mb-6 space-y-3 rounded-sm border border-border bg-background p-4">
        <input required value={q} onChange={(e) => setQ(e.target.value)} placeholder="Question" className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm" />
        <textarea required value={a} onChange={(e) => setA(e.target.value)} rows={3} placeholder="Answer" className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm" />
        <div className="flex gap-3">
          <input value={cat} onChange={(e) => setCat(e.target.value)} placeholder="Category (optional)" className="flex-1 rounded-sm border border-border bg-background px-3 py-2 text-sm" />
          <button className="rounded-sm bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">Add</button>
        </div>
      </form>
      <ul className="space-y-2">
        {(data ?? []).map((f) => (
          <li key={f.id} className="rounded-sm border border-border bg-background p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="text-sm font-semibold">{f.question}</div>
                <div className="mt-1 text-sm text-muted-foreground">{f.answer}</div>
                {f.category && <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{f.category}</div>}
              </div>
              <div className="flex gap-3 text-xs">
                <button onClick={() => toggle(f.id, f.published)} className="underline">{f.published ? "Hide" : "Show"}</button>
                <button onClick={() => del(f.id)} className="text-destructive underline">Delete</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}