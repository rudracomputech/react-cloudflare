import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function TrustStrip() {
  const { data: settings } = useQuery({
    queryKey: ["public-settings", "trust"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from("settings")
        .select("key, value")
        .in("key", ["support_status", "delivery_eta"]);
      const m: Record<string, any> = {};
      (data ?? []).forEach((r: any) => (m[r.key] = r.value));
      return m;
    },
  });

  const { data: counts } = useQuery({
    queryKey: ["live-activity"],
    refetchInterval: 60_000,
    staleTime: 30_000,
    queryFn: async () => {
      const since = new Date();
      since.setHours(0, 0, 0, 0);
      const { count: deliveredToday } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .gte("delivered_at", since.toISOString());
      const { data: last } = await supabase
        .from("orders")
        .select("delivered_at")
        .not("delivered_at", "is", null)
        .order("delivered_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return { deliveredToday: deliveredToday ?? 0, lastDeliveredAt: last?.delivered_at ?? null };
    },
  });

  const status = settings?.support_status?.status ?? "online";
  const supportLabel = settings?.support_status?.label ?? "Support online";
  const etaRange = settings?.delivery_eta
    ? `${settings.delivery_eta.min_minutes}–${settings.delivery_eta.max_minutes} MINS`
    : "18–25 MINS";
  const supportOnline = status === "online";
  const eta = etaRange;
  const delivered =
    counts && counts.deliveredToday > 0 ? `${counts.deliveredToday.toLocaleString()} TODAY` : null;
  const lastActivity = counts?.lastDeliveredAt
    ? `${Math.max(1, Math.round((Date.now() - new Date(counts.lastDeliveredAt).getTime()) / 60000))} MINS AGO`
    : null;

  return (
    <div className="border-y border-white/10 bg-navy py-4 text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap gap-x-12 gap-y-4 px-6">
        <div className="flex items-center gap-3">
          <div
            className={`size-2 rounded-full ${supportOnline ? "bg-success shadow-[0_0_8px_oklch(0.69_0.16_155/0.5)]" : status === "away" ? "bg-yellow-400" : "bg-white/30"}`}
          />
          <span className="font-mono text-[11px] uppercase tracking-wider text-white/80">
            {supportLabel}
          </span>
        </div>
        <div className="hidden h-4 w-px bg-white/10 sm:block" />
        <Cell label="Current ETA" value={eta} />
        {delivered && (<>
          <div className="hidden h-4 w-px bg-white/10 sm:block" />
          <Cell label="Volume" value={delivered} />
        </>)}
        {lastActivity && (<>
          <div className="hidden h-4 w-px bg-white/10 sm:block" />
          <Cell label="Last Activity" value={lastActivity} />
        </>)}
      </div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-mono text-[10px] uppercase tracking-tighter text-white/40">{label}</span>
      <span className="font-mono text-[13px] font-medium">{value}</span>
    </div>
  );
}