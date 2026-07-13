import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/email-logs")({
  head: () => ({ meta: [{ title: "Admin — Email Logs" }] }),
  component: EmailLogs,
});

function EmailLogs() {
  const { data } = useQuery({
    queryKey: ["admin-email-logs"],
    queryFn: async () => (await supabase.from("email_logs").select("*").order("created_at", { ascending: false }).limit(200)).data ?? [],
  });
  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold">Email Logs</h1>
      <div className="overflow-x-auto rounded-sm border border-border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-subtle text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr><th className="px-4 py-2">When</th><th className="px-4 py-2">To</th><th className="px-4 py-2">Subject</th><th className="px-4 py-2">Template</th><th className="px-4 py-2">Status</th></tr>
          </thead>
          <tbody>
            {(data ?? []).map((r: any) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-2 font-mono text-xs">{new Date(r.created_at).toLocaleString()}</td>
                <td className="px-4 py-2 font-mono text-xs">{r.to_email}</td>
                <td className="px-4 py-2">{r.subject}</td>
                <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{r.template ?? "—"}</td>
                <td className="px-4 py-2 font-mono text-[10px] uppercase">{r.status}</td>
              </tr>
            ))}
            {(data ?? []).length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">No emails sent yet — email infra is scaffolded; domain pending.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}