import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageLayout, PageHero } from "@/components/site/PageLayout";
import { StripeCheckoutModal } from "@/components/StripeCheckoutModal";
import { PRICE_ID_BY_SERVICE } from "@/lib/stripe";

export const Route = createFileRoute("/order/$service")({
  head: ({ params }) => ({
    meta: [{ title: `Order ${params.service} — AeroPrior` }],
  }),
  component: OrderPage,
});

type Passenger = { first_name: string; last_name: string; dob: string };

function OrderPage() {
  const { service } = Route.useParams();
  const { user } = useAuth();
  const nav = useNavigate();

  const { data: svc, isLoading } = useQuery({
    queryKey: ["service", service],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").eq("slug", service).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(user?.email ?? "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [depart, setDepart] = useState("");
  const [ret, setRet] = useState("");
  const [passengers, setPassengers] = useState<Passenger[]>([{ first_name: "", last_name: "", dob: "" }]);
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [checkout, setCheckout] = useState<{ orderId: string; orderNumber: string } | null>(null);

  if (isLoading) {
    return <PageLayout><div className="mx-auto max-w-3xl px-6 py-20 text-sm text-muted-foreground">Loading…</div></PageLayout>;
  }
  if (!svc) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h1 className="text-2xl font-bold">Service not found</h1>
          <Link to="/" className="mt-4 inline-block text-sm text-accent">← Back home</Link>
        </div>
      </PageLayout>
    );
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!accepted) return toast.error("Please accept the disclaimer.");
    if (!svc) return;
    if (!user) {
      toast.message("Sign in or create an account to place an order.");
      nav({ to: "/auth/signup" });
      return;
    }
    setBusy(true);
    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        email,
        service_slug: service,
        amount: svc.base_price,
        amount_usd: svc.base_price,
        currency: svc.currency,
        country,
        locale: typeof navigator !== "undefined" ? navigator.language : null,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        passengers,
        form_data: { from, to, depart, ret, contact_name: name, phone },
        disclaimer_accepted_at: new Date().toISOString(),
        status: "awaiting_payment",
        payment_status: "unpaid",
      })
      .select("id, order_number")
      .single();
    setBusy(false);
    if (error) return toast.error(error.message);
    setCheckout({ orderId: data.id, orderNumber: data.order_number });
  }

  return (
    <PageLayout>
      <PageHero eyebrow={`Order · Step ${step} of 3`} title={`${svc.name}`} subtitle={`Delivery ${svc.eta_minutes_min}–${svc.eta_minutes_max} min after payment. ${svc.currency} ${Number(svc.base_price).toFixed(2)} flat.`} />
      <section className="mx-auto max-w-3xl px-6 py-12">
        <form onSubmit={submit} className="space-y-8">
          {step === 1 && (
            <Card title="Trip details">
              <Grid>
                <F label="From (city / airport)" value={from} onChange={setFrom} required />
                <F label="To (city / airport)" value={to} onChange={setTo} required />
                <F label="Departure date" type="date" value={depart} onChange={setDepart} required />
                <F label="Return date (optional)" type="date" value={ret} onChange={setRet} />
              </Grid>
              <div className="mt-6">
                <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Passengers</label>
                {passengers.map((p, i) => (
                  <div key={i} className="mb-3 grid gap-3 md:grid-cols-3">
                    <input className="rounded-sm border border-border bg-background px-3 py-2 text-sm" placeholder="First name" value={p.first_name} onChange={(e) => updateP(i, { first_name: e.target.value })} required />
                    <input className="rounded-sm border border-border bg-background px-3 py-2 text-sm" placeholder="Last name" value={p.last_name} onChange={(e) => updateP(i, { last_name: e.target.value })} required />
                    <input type="date" className="rounded-sm border border-border bg-background px-3 py-2 text-sm" value={p.dob} onChange={(e) => updateP(i, { dob: e.target.value })} required />
                  </div>
                ))}
                <button type="button" onClick={() => setPassengers((ps) => [...ps, { first_name: "", last_name: "", dob: "" }])} className="text-xs font-medium text-accent">+ Add passenger</button>
              </div>
              <Next onClick={() => setStep(2)} />
            </Card>
          )}

          {step === 2 && (
            <Card title="Contact">
              <Grid>
                <F label="Full name" value={name} onChange={setName} required />
                <F label="Email" type="email" value={email} onChange={setEmail} required />
                <F label="WhatsApp / phone" value={phone} onChange={setPhone} />
                <F label="Country (ISO)" value={country} onChange={setCountry} placeholder="e.g. IN, US, AE" />
              </Grid>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="rounded-sm border border-border px-5 py-3 text-sm">Back</button>
                <Next onClick={() => setStep(3)} />
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card title="Review & confirm">
              <div className="space-y-3 rounded-sm border border-border bg-subtle p-5 text-sm">
                <Row k="Service" v={svc.name} />
                <Row k="Route" v={`${from} → ${to}`} />
                <Row k="Dates" v={ret ? `${depart} → ${ret}` : depart} />
                <Row k="Passengers" v={String(passengers.length)} />
                <Row k="Contact" v={`${name} · ${email}`} />
                <Row k="Total" v={`${svc.currency} ${Number(svc.base_price).toFixed(2)}`} />
              </div>
              <label className="mt-6 flex items-start gap-3 text-xs text-muted-foreground">
                <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5" />
                <span>I understand AeroPrior issues verifiable temporary reservations for documentation purposes, not ticketed flights or paid hotel stays, and that visa approval is never guaranteed.</span>
              </label>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="rounded-sm border border-border px-5 py-3 text-sm">Back</button>
                <button disabled={busy} className="rounded-sm bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground disabled:opacity-60">
                  {busy ? "Placing order…" : "Confirm & continue"}
                </button>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">Payment provider is connected in Phase 2. Your order is recorded and our team can process it manually in the meantime.</p>
            </Card>
          )}
        </form>
      </section>
      {checkout && (
        <StripeCheckoutModal
          orderId={checkout.orderId}
          priceId={PRICE_ID_BY_SERVICE[service] ?? `${service.replace(/-/g, "_")}_one_time`}
          returnUrl={`${window.location.origin}/checkout/success?order=${encodeURIComponent(checkout.orderNumber)}&session_id={CHECKOUT_SESSION_ID}`}
          onClose={() => setCheckout(null)}
        />
      )}
    </PageLayout>
  );

  function updateP(i: number, patch: Partial<Passenger>) {
    setPassengers((ps) => ps.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-border bg-background p-8">
      <h2 className="mb-6 text-lg font-semibold tracking-tight">{title}</h2>
      {children}
    </div>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 md:grid-cols-2">{children}</div>;
}
function F(p: { label: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{p.label}</label>
      <input type={p.type ?? "text"} value={p.value} onChange={(e) => p.onChange(e.target.value)} required={p.required} placeholder={p.placeholder} className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm focus:border-accent focus:outline-none" />
    </div>
  );
}
function Next({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} className="mt-6 rounded-sm bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground">Continue →</button>;
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{k}</span>
      <span className="text-right">{v}</span>
    </div>
  );
}