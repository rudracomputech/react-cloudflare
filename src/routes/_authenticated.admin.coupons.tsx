import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/coupons")({
  head: () => ({ meta: [{ title: "Admin — Coupons" }] }),
  component: Coupons,
});

function Coupons() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => (await supabase.from("coupons").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const [code, setCode] = useState(""); const [pct, setPct] = useState(""); const [usd, setUsd] = useState(""); const [max, setMax] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("coupons").insert({
      code: code.trim().toUpperCase(),
      discount_percent: pct ? Number(pct) : null,
      discount_amount_usd: usd ? Number(usd) : null,
      max_uses: max ? Number(max) : null,
    });
    if (error) return toast.error(error.message);
    toast.success("Coupon created");
    setCode(""); setPct(""); setUsd(""); setMax("");
    qc.invalidateQueries({ queryKey: ["admin-coupons"] });
  }
  async function toggle(id: string, active: boolean) {
    await supabase.from("coupons").update({ active: !active }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-coupons"] });
  }
  async function del(id: string) {
    if (!confirm("Delete coupon?")) return;
    await supabase.from("coupons").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-coupons"] });
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold">Coupons</h1>
      <form onSubmit={add} className="mb-6 grid gap-3 rounded-sm border border-border bg-background p-4 md:grid-cols-5">
        <input required value={code} onChange={(e) => setCode(e.target.value)} placeholder="CODE" className="rounded-sm border border-border bg-background px-3 py-2 text-sm uppercase" />
        <input value={pct} onChange={(e) => setPct(e.target.value)} placeholder="% off" type="number" className="rounded-sm border border-border bg-background px-3 py-2 text-sm" />
        <input value={usd} onChange={(e) => setUsd(e.target.value)} placeholder="$ off" type="number" className="rounded-sm border border-border bg-background px-3 py-2 text-sm" />
        <input value={max} onChange={(e) => setMax(e.target.value)} placeholder="Max uses" type="number" className="rounded-sm border border-border bg-background px-3 py-2 text-sm" />
        <button className="rounded-sm bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">Add</button>
      </form>
      <div className="overflow-hidden rounded-sm border border-border">
        <table className="w-full text-sm">
          <thead className="bg-subtle font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr><th className="px-4 py-3 text-left">Code</th><th className="px-4 py-3">% / $</th><th className="px-4 py-3">Uses</th><th className="px-4 py-3">Active</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {(data ?? []).map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="px-4 py-3 font-mono">{c.code}</td>
                <td className="px-4 py-3 text-center">{c.discount_percent ? `${c.discount_percent}%` : `$${c.discount_amount_usd}`}</td>
                <td className="px-4 py-3 text-center">{c.uses_count}{c.max_uses ? ` / ${c.max_uses}` : ""}</td>
                <td className="px-4 py-3 text-center"><button onClick={() => toggle(c.id, c.active)} className="text-xs underline">{c.active ? "Yes" : "No"}</button></td>
                <td className="px-4 py-3 text-right"><button onClick={() => del(c.id)} className="text-xs text-destructive hover:underline">Delete</button></td>
              </tr>
            ))}
            {!data?.length && <tr><td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-foreground">No coupons yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}