import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout, PageHero } from "@/components/site/PageLayout";
import { VISA_COUNTRIES } from "@/lib/visa-countries";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Visa & Travel Documentation Guides | AeroPrior" },
      { name: "description", content: "Country guides and travel documentation explainers — visa requirements, onward tickets, cover letters, and embassy expectations." },
      { property: "og:title", content: "Travel Documentation Guides — AeroPrior" },
      { property: "og:description", content: "Visa and documentation guides written by people who issue these documents daily." },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogPage,
});

function BlogPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Guides"
        title="Visa & travel documentation guides"
        subtitle="Country-by-country requirements, format expectations, and tactical advice from a team that issues these documents every day."
      />
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="mb-6 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Country guides</h2>
        <div className="grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {VISA_COUNTRIES.map((c) => (
            <Link key={c.slug} to="/visa/$country" params={{ country: c.slug }} className="block bg-background p-6 transition hover:bg-subtle">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{c.region}</span>
              <h3 className="mt-2 text-base font-semibold">{c.name}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{c.blurb}</p>
              <span className="mt-4 inline-block font-mono text-[11px] uppercase tracking-widest text-accent">Read guide →</span>
            </Link>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}