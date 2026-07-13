import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/site/PageLayout";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({ meta: [{ title: "Create account — AeroPrior" }] }),
  component: SignupPage,
});

function SignupPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/account`,
        data: { display_name: name },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Check your email to verify your account.");
    nav({ to: "/auth/login" });
  }

  return (
    <PageLayout>
      <section className="mx-auto max-w-md px-6 py-20">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Create account</h1>
        <p className="mb-8 text-sm text-muted-foreground">Track orders and re-order in one click.</p>
        <form onSubmit={onSubmit} className="space-y-5 rounded-sm border border-border bg-subtle p-8">
          <F label="Name" type="text" value={name} onChange={setName} required />
          <F label="Email" type="email" value={email} onChange={setEmail} required />
          <F label="Password" type="password" value={password} onChange={setPassword} required />
          <button disabled={busy} className="w-full rounded-sm bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground disabled:opacity-60">
            {busy ? "Creating…" : "Create account"}
          </button>
          <p className="text-xs text-muted-foreground">Already have an account? <Link to="/auth/login" className="text-foreground hover:underline">Sign in</Link></p>
        </form>
      </section>
    </PageLayout>
  );
}

function F(p: { label: string; type: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div>
      <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{p.label}</label>
      <input type={p.type} value={p.value} onChange={(e) => p.onChange(e.target.value)} required={p.required} className="w-full rounded-sm border border-border bg-background px-4 py-3 text-sm focus:border-accent focus:outline-none" />
    </div>
  );
}