import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageLayout, PageHero } from "@/components/site/PageLayout";
import { VISA_COUNTRIES, type VisaCountry } from "@/lib/visa-countries";

export const Route = createFileRoute("/visa/$country")({
  loader: ({ params }) => {
    const country = VISA_COUNTRIES.find((c) => c.slug === params.country);
    if (!country) throw notFound();
    return country;
  },
  head: ({ params, loaderData }) => {
    const c = loaderData;
    const title = c
      ? `${c.name} Visa — Reservation Documents Required | AeroPrior`
      : `Visa documents — ${params.country}`;
    const desc = c
      ? `Reservation document requirements for the ${c.name} visa. ${c.blurb.slice(0, 100)}`
      : "Visa reservation requirements.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: `/visa/${params.country}` },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: `/visa/${params.country}` }],
      scripts: c
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                headline: title,
                description: desc,
                about: `${c.name} visa requirements`,
              }),
            },
          ]
        : [],
    };
  },
  component: VisaPage,
  notFoundComponent: () => (
    <PageLayout>
      <PageHero title="Country guide not found" subtitle="We don't have a guide for that country yet." />
    </PageLayout>
  ),
});

function VisaPage() {
  const c = Route.useLoaderData() as VisaCountry;
  return (
    <PageLayout>
      <PageHero eyebrow={`Country guide / ${c.region}`} title={`${c.name} visa — reservation document requirements`} subtitle={c.blurb} />
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[1fr_320px]">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Required documents</h2>
          <ul className="mt-6 space-y-3">
            {c.requirements.map((r) => (
              <li key={r} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
          <h2 className="mt-12 text-xl font-bold tracking-tight">Tips for {c.name}</h2>
          <ul className="mt-6 space-y-3">
            {c.tips.map((t) => (
              <li key={t} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <aside className="h-fit space-y-4 rounded-sm border border-border bg-subtle p-6">
          <h3 className="text-sm font-semibold">Order documents for {c.name}</h3>
          <Link to="/services/flight-reservation" className="block rounded-sm border border-border bg-background p-4 text-sm hover:border-accent">Flight reservation →</Link>
          <Link to="/services/hotel-reservation" className="block rounded-sm border border-border bg-background p-4 text-sm hover:border-accent">Hotel reservation →</Link>
          <Link to="/services/cover-letter" className="block rounded-sm border border-border bg-background p-4 text-sm hover:border-accent">Cover letter →</Link>
        </aside>
      </section>
    </PageLayout>
  );
}