import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/site/PageLayout";
import { TrustStrip } from "@/components/site/TrustStrip";

const TITLE =
  "Verifiable Travel Reservations for Visa & Immigration Documentation";
const DESCRIPTION =
  "Fast, secure, embassy-ready reservation documents — flight itineraries, hotel bookings, onward tickets and cover letters for visa applications.";

const SERVICES = [
  {
    n: "01 / Flight",
    name: "Flight Reservation",
    blurb: "Confirms round-trip or one-way travel with a verifiable PNR.",
    from: "$14",
    to: "/services/flight-reservation",
  },
  {
    n: "02 / Stay",
    name: "Hotel Booking",
    blurb: "Proof of accommodation across 500k+ global properties.",
    from: "$12",
    to: "/services/hotel-booking",
  },
  {
    n: "03 / Transit",
    name: "Onward Ticket",
    blurb: "Onward travel proof for immigration entry requirements.",
    from: "$14",
    to: "/services/onward-ticket",
  },
  {
    n: "04 / Admin",
    name: "Cover Letter",
    blurb: "Professionally structured visa application intent letter.",
    from: "$10",
    to: "/services/cover-letter",
  },
] as const;

const STEPS = [
  {
    n: "01",
    title: "Order Details",
    body: "Provide your travel dates and route via our secure intake form. No sensitive passport data required at order time.",
  },
  {
    n: "02",
    title: "Manual Verification",
    body: "Our agents process the booking and verify PNR status directly with airline systems before issuance.",
  },
  {
    n: "03",
    title: "Receive PDF",
    body: "A verifiable, embassy-ready PDF document is delivered to your email within our current ETA window.",
  },
] as const;

const INTEGRITY = [
  { h: "Verifiable PNR Codes", b: "Every flight reservation includes a genuine PNR that can be checked on the airline website." },
  { h: "30-Minute Average Delivery", b: "Our team operates 24/7 to ensure documentation is ready when you need it." },
  { h: "No-Risk Refund Policy", b: "Full refund if the reservation cannot be verified at the time of delivery." },
  { h: "Human Support, 24/7", b: "Real documentation specialists available via WhatsApp and email." },
] as const;

const FAQ = [
  {
    q: "Are these documents legal for visa applications?",
    a: "Yes. We issue legitimate, temporary reservations through Global Distribution Systems (GDS). Embassies can verify the PNR on the airline's official Manage Booking page.",
  },
  {
    q: "How long does a PNR stay valid?",
    a: "Each reservation is valid for a fixed window — typically 24 to 72 hours — which is sufficient for the visa appointment and most embassy reviews. We will indicate the exact validity at delivery.",
  },
  {
    q: "Can an embassy verify my booking?",
    a: "Yes. The embassy uses the provided PNR (Passenger Name Record) and surname to look up the reservation on the carrier's official site.",
  },
  {
    q: "What is your refund process?",
    a: "If your document is not delivered within the promised window or the reservation is not verifiable at the time of delivery, we issue a full refund — usually back to your card within 5–10 business days.",
  },
] as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${TITLE} | AeroPrior` },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: `${TITLE} | AeroPrior` },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }),
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border pt-20 pb-16">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 md:grid-cols-2">
          <div className="animate-fade-up">
            <h1 className="mb-6 text-balance text-5xl font-bold leading-[0.95] tracking-tight md:text-6xl">
              Verifiable Travel Reservations for Visa &amp; Immigration
            </h1>
            <p className="mb-8 max-w-[42ch] text-lg leading-relaxed text-muted-foreground">
              Professional documentation operations for flight itineraries, hotel bookings, and
              onward tickets. Verifiable PNR codes delivered in minutes.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/services/flight-reservation"
                className="rounded-sm bg-accent px-6 py-3 font-semibold tracking-tight text-accent-foreground transition-all hover:bg-accent/90"
              >
                Start Reservation
              </Link>
              <Link
                to="/samples"
                className="rounded-sm border border-border bg-background px-6 py-3 font-semibold tracking-tight transition-all hover:bg-subtle"
              >
                See a sample
              </Link>
            </div>
          </div>
          <div className="animate-fade-up [animation-delay:150ms]">
            <div className="relative rounded-sm border border-border bg-subtle p-4 shadow-sm">
              <div className="grid aspect-[4/5] w-full place-items-center rounded-sm bg-background shadow-inner outline outline-1 -outline-offset-1 outline-black/5">
                <div className="space-y-3 px-8 text-center">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Flight Reservation
                  </div>
                  <div className="font-mono text-2xl font-semibold">LHR → HKG</div>
                  <div className="font-mono text-[11px] text-muted-foreground">CX 748 · 14 MAR · 22:35</div>
                  <div className="mx-auto mt-6 h-px w-16 bg-border" />
                  <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    PNR: LH492X
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 rounded-sm bg-navy p-4 text-white shadow-xl">
                <div className="mb-1 flex items-center gap-2">
                  <div className="size-1.5 animate-pulse-soft rounded-full bg-accent" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/60">
                    Verification Status
                  </span>
                </div>
                <div className="font-mono text-sm uppercase">PNR: LH492X ACTIVE</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TrustStrip />

      {/* Services */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16">
          <span className="mb-4 block font-mono text-[11px] uppercase tracking-[0.3em] text-accent">
            Product Matrix
          </span>
          <h2 className="text-3xl font-bold tracking-tight">Operational Services</h2>
        </div>
        <div className="grid gap-px border border-border bg-border md:grid-cols-4">
          {SERVICES.map((s) => (
            <Link
              key={s.name}
              to={s.to}
              className="group bg-background p-8 transition-colors hover:bg-subtle"
            >
              <span className="mb-6 block font-mono text-[10px] uppercase text-muted-foreground">
                {s.n}
              </span>
              <h3 className="mb-3 text-lg font-bold">{s.name}</h3>
              <p className="mb-8 text-sm leading-relaxed text-muted-foreground">{s.blurb}</p>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-[11px] text-muted-foreground">FROM</span>
                <span className="text-xl font-bold">{s.from}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-navy py-24 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14">
            <span className="mb-4 block font-mono text-[11px] uppercase tracking-[0.3em] text-accent">
              Issuance Protocol
            </span>
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          </div>
          <div className="grid gap-12 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="mb-6 grid size-10 place-items-center border border-white/20">
                  <span className="font-mono text-sm text-accent">{s.n}</span>
                </div>
                <h4 className="mb-4 text-xl font-bold">{s.title}</h4>
                <p className="text-sm leading-relaxed text-white/60">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="border-b border-border py-24">
        <div className="mx-auto grid max-w-7xl gap-24 px-6 md:grid-cols-2">
          <div>
            <h2 className="mb-8 text-3xl font-bold tracking-tight">Operational Integrity</h2>
            <div className="space-y-6">
              {INTEGRITY.map((item) => (
                <div key={item.h} className="flex gap-4">
                  <div className="shrink-0 pt-1.5">
                    <div className="size-1.5 rounded-full bg-accent" />
                  </div>
                  <div>
                    <h5 className="mb-1 text-sm font-semibold">{item.h}</h5>
                    <p className="text-sm text-muted-foreground">{item.b}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {["Flight Itinerary", "Hotel Voucher"].map((label) => (
              <div
                key={label}
                className="grid aspect-[4/5] w-full place-items-center rounded-sm border border-border bg-subtle shadow-sm"
              >
                <div className="px-4 text-center">
                  <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                    Sample
                  </div>
                  <div className="mt-1 text-sm font-semibold">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-24">
        <h2 className="mb-12 text-center text-2xl font-bold tracking-tight">Protocol FAQ</h2>
        <div className="space-y-px border border-border bg-border">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group bg-background p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
                <span>{q}</span>
                <span className="font-mono text-muted-foreground transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/faq" className="font-mono text-xs uppercase tracking-widest text-accent hover:underline">
            See full FAQ →
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="mb-8 text-3xl font-bold tracking-tight text-white">
            Ready to secure your travel documentation?
          </h2>
          <Link
            to="/services/flight-reservation"
            className="inline-block rounded-sm bg-accent px-10 py-4 font-bold tracking-tight text-accent-foreground transition-all hover:bg-accent/90"
          >
            Get your reservation
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
