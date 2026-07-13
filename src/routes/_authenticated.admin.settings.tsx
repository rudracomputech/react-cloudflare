import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({ meta: [{ title: "Admin — Settings" }] }),
  component: Settings,
});

const KEYS = [
  { key: "support_status", label: "Support status", placeholder: '"online"' },
  { key: "eta_range", label: "Delivery ETA range", placeholder: '"30–60 min"' },
  { key: "sla_threshold", label: "SLA threshold (min)", placeholder: "60" },
  { key: "whatsapp_number", label: "WhatsApp number", placeholder: '"+1234567890"' },
  { key: "company_email", label: "Company email", placeholder: '"hello@aeroprior.com"' },
];

function Settings() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => (await supabase.from("settings").select("*")).data ?? [],
  });
  const [vals, setVals] = useState<Record<string, string>>({});
  useEffect(() => {
    if (data) {
      const m: Record<string, string> = {};
      data.forEach((s: any) => { m[s.key] = JSON.stringify(s.value); });
      setVals(m);
    }
  }, [data]);

  async function save(key: string) {
    let parsed: any;
    try { parsed = JSON.parse(vals[key]); } catch { return toast.error("Value must be valid JSON (e.g. \"text\" or 60)"); }
    const { error } = await supabase.from("settings").upsert({ key, value: parsed, is_public: true }, { onConflict: "key" });
    if (error) return toast.error(error.message);
    toast.success(`${key} saved`);
    qc.invalidateQueries({ queryKey: ["admin-settings"] });
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-2 text-2xl font-bold">Settings</h1>
      <p className="mb-6 text-sm text-muted-foreground">Public site values. Use JSON syntax: strings in quotes, numbers raw.</p>
      <div className="space-y-3">
        {KEYS.map((k) => (
          <div key={k.key} className="rounded-sm border border-border bg-background p-4">
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{k.label} <span className="ml-2 normal-case">{k.key}</span></label>
            <div className="flex gap-2">
              <input value={vals[k.key] ?? ""} onChange={(e) => setVals((v) => ({ ...v, [k.key]: e.target.value }))}
                placeholder={k.placeholder}
                className="flex-1 rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs" />
              <button onClick={() => save(k.key)} className="rounded-sm bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground">Save</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}