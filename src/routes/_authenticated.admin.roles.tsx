import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/roles")({
  head: () => ({ meta: [{ title: "Admin — Roles" }] }),
  component: RolesAdmin,
});

const ROLES = ["super_admin","admin","support_agent","fulfillment_agent","content_editor","customer"] as const;
type Role = typeof ROLES[number];

function RolesAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("id,user_id,role,created_at").order("created_at", { ascending: false });
      const ids = Array.from(new Set((roles ?? []).map((r: any) => r.user_id)));
      const { data: profs } = ids.length
        ? await supabase.from("profiles").select("user_id, display_name").in("user_id", ids)
        : { data: [] as any[] };
      const map: Record<string, string> = {};
      (profs ?? []).forEach((p: any) => (map[p.user_id] = p.display_name ?? p.user_id));
      return (roles ?? []).map((r: any) => ({ ...r, name: map[r.user_id] ?? r.user_id }));
    },
  });
  const [uid, setUid] = useState(""); const [role, setRole] = useState<Role>("support_agent");
  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("user_roles").insert({ user_id: uid, role });
    if (error) return toast.error(error.message);
    setUid(""); qc.invalidateQueries({ queryKey: ["admin-roles"] });
  }
  async function del(id: string) { if (!confirm("Revoke?")) return; await supabase.from("user_roles").delete().eq("id", id); qc.invalidateQueries({ queryKey: ["admin-roles"] }); }
  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold">Role Management</h1>
      <form onSubmit={add} className="mb-6 flex flex-wrap gap-3 rounded-sm border border-border bg-background p-4">
        <input required value={uid} onChange={(e) => setUid(e.target.value)} placeholder="User ID (UUID)" className="flex-1 rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs" />
        <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="rounded-sm border border-border bg-background px-3 py-2 text-sm">
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <button className="rounded-sm bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">Grant</button>
      </form>
      <ul className="space-y-2">
        {(data ?? []).map((r: any) => (
          <li key={r.id} className="flex items-center justify-between rounded-sm border border-border bg-background p-4">
            <div>
              <div className="text-sm font-semibold">{r.name}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{r.user_id} · {r.role}</div>
            </div>
            <button onClick={() => del(r.id)} className="text-xs text-destructive underline">Revoke</button>
          </li>
        ))}
      </ul>
    </section>
  );
}