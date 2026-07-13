import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout, PageHero } from "@/components/site/PageLayout";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Transparent rates from $12 | AeroPrior" },
      { name: "description", content: "Flat, transparent pricing for verifiable travel reservations. No hidden fees. Refund if not verifiable." },
      { property: "og:title", content: "Pricing — AeroPrior" },
      { property: "og:description", content: "Flat, transparent rates with full refund if your booking is not verifiable." },
      { property: "og:url", content: "/pricing" },
    ],
    links: [{ rel: "canonical", href: "/pricing" }],
  }),
  component: PricingPage,
});

const tiers = [
  { name: "Onward Ticket", price: "$14", to: "/services/onward-ticket", desc: "Single onward booking. 24–48h validity." },
  { name: "Cover Letter", price: "$12", to: "/services/cover-letter", desc: "Embassy-ready drafted letter, two revisions." },
  { name: "Hotel Reservation", price: "$15", to: "/services/hotel-reservation", desc: "Real property, confirmation number." },
  { name: "Flight Reservation", price: "$18", to: "/services/flight-reservation", desc: "Verifiable PNR, real GDS issuance." },
];

function PricingPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Pricing"
        title="Flat pricing. Full refund if it does not verify."
        subtitle="One price per document. No subscriptions, no upsells. Volume discounts available for travel agents and immigration consultants."
      />
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((t) => (
            <div key={t.name} className="bg-background p-8">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">From</div>
              <div className="mt-2 text-4xl font-bold tracking-tight">{t.price}</div>
              <h3 className="mt-6 text-base font-semibold">{t.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.desc}</p>
              <Link to={t.to} className="mt-6 inline-block font-mono text-[11px] uppercase tracking-widest text-accent hover:underline">View service →</Link>
            </div>
          ))}
        </div>
        <div className="mt-16 grid gap-8 rounded-sm border border-border bg-subtle p-8 md:grid-cols-3">
          <Fact h="No subscription" b="Pay per document. No monthly fees, no membership tiers." />
          <Fact h="Refund guarantee" b="Full refund if the booking cannot be verified within its validity window." />
          <Fact h="Bulk discounts" b="Travel agencies and consultants — contact us for volume pricing on 10+ documents/month." />
        </div>
      </section>
    </PageLayout>
  );
}

function Fact({ h, b }: { h: string; b: string }) {
  return (
    <div>
      <h4 className="text-sm font-semibold">{h}</h4>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b}</p>
    </div>
  );
}