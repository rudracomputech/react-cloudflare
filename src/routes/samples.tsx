import { createFileRoute } from "@tanstack/react-router";
import { PageLayout, PageHero } from "@/components/site/PageLayout";

export const Route = createFileRoute("/samples")({
  head: () => ({
    meta: [
      { title: "Samples — See real reservation documents | AeroPrior" },
      { name: "description", content: "Examples of the actual reservation PDFs we issue: flight PNRs, hotel confirmations, onward tickets, and cover letters." },
      { property: "og:title", content: "Document Samples — AeroPrior" },
      { property: "og:description", content: "Real examples of the documents we issue for visa applications." },
      { property: "og:url", content: "/samples" },
    ],
    links: [{ rel: "canonical", href: "/samples" }],
  }),
  component: SamplesPage,
});

const samples = [
  { name: "Flight Reservation", desc: "Itinerary with verifiable PNR, airline logo, passenger name, full routing." },
  { name: "Hotel Reservation", desc: "Confirmation number, hotel address, check-in/out dates, guest name." },
  { name: "Onward Ticket", desc: "Single-segment onward booking suitable for airline check-in." },
  { name: "Cover Letter", desc: "Professionally drafted explanation of travel purpose and ties to home country." },
];

function SamplesPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Documents"
        title="What you actually receive"
        subtitle="These are mock previews of the document formats we deliver. Real documents include live verification details unique to your booking."
      />
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          {samples.map((s) => (
            <div key={s.name} className="overflow-hidden rounded-sm border border-border bg-background">
              <div className="flex h-64 items-center justify-center border-b border-border bg-subtle">
                <div className="w-3/4 rounded-sm border border-border bg-background p-6 shadow-sm">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{s.name}</div>
                  <div className="mt-3 h-2 w-2/3 rounded bg-border" />
                  <div className="mt-2 h-2 w-1/2 rounded bg-border" />
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <div className="h-8 rounded bg-border/60" />
                    <div className="h-8 rounded bg-border/60" />
                    <div className="h-8 rounded bg-border/60" />
                  </div>
                  <div className="mt-4 h-2 w-full rounded bg-border/60" />
                  <div className="mt-2 h-2 w-3/4 rounded bg-border/60" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-base font-semibold">{s.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}