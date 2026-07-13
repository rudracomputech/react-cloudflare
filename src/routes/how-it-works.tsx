import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout, PageHero } from "@/components/site/PageLayout";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — Reservation documents in minutes | AeroPrior" },
      { name: "description", content: "Four simple steps: pick a service, share trip details, pay securely, receive your embassy-ready reservation document by email." },
      { property: "og:title", content: "How AeroPrior Works" },
      { property: "og:description", content: "Verifiable reservations delivered in 18–25 minutes." },
    ],
    links: [{ rel: "canonical", href: "/how-it-works" }],
  }),
  component: HowItWorks,
});

const STEPS = [
  { n: "01", t: "Choose a service", d: "Flight reservation, hotel booking, onward ticket, or visa cover letter." },
  { n: "02", t: "Share trip details", d: "Passenger names, dates, routing. Takes under 2 minutes." },
  { n: "03", t: "Pay securely", d: "Stripe checkout. Cards, Apple Pay, Google Pay. Multi-currency." },
  { n: "04", t: "Receive your document", d: "Embassy-ready PDF delivered by email, typically 18–25 minutes." },
];

function HowItWorks() {
  return (
    <PageLayout>
      <PageHero eyebrow="Process" title="From order to document in under 30 minutes" subtitle="A calm, operational pipeline — no calls, no back-and-forth, no surprises." />
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-sm border border-border bg-background p-6">
              <div className="font-mono text-[11px] uppercase tracking-widest text-accent">{s.n}</div>
              <h3 className="mt-2 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap gap-4">
          <Link to="/services/flight-reservation" className="rounded-sm bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground">Start an order</Link>
          <Link to="/samples" className="rounded-sm border border-border px-5 py-3 text-sm font-semibold">See sample documents</Link>
        </div>
      </section>
    </PageLayout>
  );
}