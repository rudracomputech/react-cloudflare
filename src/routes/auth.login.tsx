import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/site/PageLayout";

export const Route = createFileRoute("/auth/login")({
  head: () => ({
    meta: [
      { title: "Sign in — AeroPrior" },
      { name: "description", content: "Sign in to manage your reservations and orders." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Signed in");
    nav({ to: "/account" });
  }

  return (
    <PageLayout>
      <section className="mx-auto max-w-md px-6 py-20">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Sign in</h1>
        <p className="mb-8 text-sm text-muted-foreground">Manage your orders and download documents.</p>
        <form onSubmit={onSubmit} className="space-y-5 rounded-sm border border-border bg-subtle p-8">
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          <Field label="Password" type="password" value={password} onChange={setPassword} required />
          <button disabled={busy} className="w-full rounded-sm bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground disabled:opacity-60">
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <div className="flex justify-between text-xs text-muted-foreground">
            <Link to="/auth/signup" className="hover:text-foreground">Create account</Link>
            <Link to="/auth/reset-password" className="hover:text-foreground">Forgot password?</Link>
          </div>
        </form>
      </section>
    </PageLayout>
  );
}

function Field({ label, type, value, onChange, required }: { label: string; type: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div>
      <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} className="w-full rounded-sm border border-border bg-background px-4 py-3 text-sm focus:border-accent focus:outline-none" />
    </div>
  );
}