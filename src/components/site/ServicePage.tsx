import { Link } from "@tanstack/react-router";
import { PageLayout, PageHero } from "./PageLayout";

export interface ServicePageProps {
  slug: string;
  eyebrow: string;
  name: string;
  headline: string;
  subtitle: string;
  priceFrom: string;
  bullets: { h: string; b: string }[];
  faq: { q: string; a: string }[];
  deliveryEta?: string;
  validity?: string;
}

export function ServicePage({
  slug,
  eyebrow,
  name,
  headline,
  subtitle,
  priceFrom,
  bullets,
  faq,
  deliveryEta = "30 minutes",
  validity = "24–72 hours",
}: ServicePageProps) {
  return (
    <PageLayout>
      <PageHero eyebrow={eyebrow} title={headline} subtitle={subtitle} />
      <div className="border-b border-border bg-subtle">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px border-x border-border bg-border md:grid-cols-4">
          <Spec label="Service" value={name} />
          <Spec label="From" value={priceFrom} />
          <Spec label="Delivery" value={deliveryEta} />
          <Spec label="Validity" value={validity} />
        </div>
      </div>
      <section className="mx-auto grid max-w-7xl gap-16 px-6 py-20 md:grid-cols-[1fr_360px]">
        <div>
          <h2 className="mb-8 text-2xl font-bold tracking-tight">What you receive</h2>
          <div className="space-y-6">
            {bullets.map((item) => (
              <div key={item.h} className="flex gap-4">
                <div className="shrink-0 pt-1.5"><div className="size-1.5 rounded-full bg-accent" /></div>
                <div>
                  <h5 className="mb-1 text-sm font-semibold">{item.h}</h5>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.b}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <aside className="h-fit rounded-sm border border-border bg-subtle p-6">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Order</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">{priceFrom}</span>
            <span className="text-sm text-muted-foreground">/ document</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Delivered within {deliveryEta}. Full refund if not verifiable.</p>
          <Link to="/order/$service" params={{ service: slug }} className="mt-6 block w-full rounded-sm bg-accent px-6 py-3 text-center text-sm font-semibold text-accent-foreground hover:bg-accent/90">Start order →</Link>
          <Link to="/contact" className="mt-3 block text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground">Or contact support →</Link>
          <div className="mt-6 rounded-sm border border-border bg-background p-4 text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Disclaimer.</strong> AeroPrior issues temporary, verifiable travel reservations for documentation purposes. Reservations are not ticketed flights or paid hotel stays and are not a guarantee of visa approval.
          </div>
        </aside>
      </section>
      <section className="border-t border-border bg-subtle py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-10 text-2xl font-bold tracking-tight">Common questions</h2>
          <div className="space-y-px border border-border bg-border">
            {faq.map(({ q, a }) => (
              <details key={q} className="group bg-background p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
                  <span>{q}</span>
                  <span className="font-mono text-muted-foreground transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background p-6">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 text-sm font-semibold">{value}</div>
    </div>
  );
}