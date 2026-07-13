import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/site/PageLayout";

export const Route = createFileRoute("/auth/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — AeroPrior" }] }),
  component: ResetPage,
});

function ResetPage() {
  const [mode, setMode] = useState<"request" | "update">("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      setMode("update");
    }
  }, []);

  async function request(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Check your email for a reset link.");
  }

  async function update(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated. You can sign in.");
  }

  return (
    <PageLayout>
      <section className="mx-auto max-w-md px-6 py-20">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Reset password</h1>
        {mode === "request" ? (
          <form onSubmit={request} className="mt-8 space-y-5 rounded-sm border border-border bg-subtle p-8">
            <Field label="Email" type="email" value={email} onChange={setEmail} />
            <button disabled={busy} className="w-full rounded-sm bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground disabled:opacity-60">{busy ? "Sending…" : "Send reset link"}</button>
          </form>
        ) : (
          <form onSubmit={update} className="mt-8 space-y-5 rounded-sm border border-border bg-subtle p-8">
            <Field label="New password" type="password" value={password} onChange={setPassword} />
            <button disabled={busy} className="w-full rounded-sm bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground disabled:opacity-60">{busy ? "Updating…" : "Update password"}</button>
          </form>
        )}
      </section>
    </PageLayout>
  );
}

function Field(p: { label: string; type: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{p.label}</label>
      <input type={p.type} value={p.value} onChange={(e) => p.onChange(e.target.value)} required className="w-full rounded-sm border border-border bg-background px-4 py-3 text-sm focus:border-accent focus:outline-none" />
    </div>
  );
}