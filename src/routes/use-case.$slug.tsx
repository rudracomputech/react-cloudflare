import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageLayout, PageHero } from "@/components/site/PageLayout";

const CASES: Record<string, { title: string; description: string; body: string }> = {
  "schengen-visa-flight-reservation": {
    title: "Flight reservation for a Schengen visa",
    description: "Embassy-ready flight reservation that satisfies Schengen visa proof-of-travel without buying a non-refundable ticket.",
    body: "Schengen consulates require proof of return travel. A real PNR-verifiable reservation from AeroPrior satisfies this and remains valid for two weeks — long enough for processing.",
  },
  "onward-ticket-for-thailand": {
    title: "Onward ticket for Thailand entry",
    description: "Verifiable onward ticket accepted by Thai immigration and airline check-in counters worldwide.",
    body: "Airlines flying into Thailand are obligated to deny boarding without proof of onward travel. Our onward ticket service issues a real reservation valid for at least 48 hours.",
  },
  "hotel-booking-for-uae-visa": {
    title: "Hotel reservation for UAE visa",
    description: "Verifiable UAE hotel booking suitable for tourist visa applications.",
    body: "UAE visa applications require accommodation proof. Our hotel reservations are verifiable through standard booking systems with the full confirmation reference.",
  },
  "cover-letter-for-us-visa": {
    title: "Visa cover letter for a US B1/B2",
    description: "Professionally drafted cover letter outlining travel purpose, itinerary, and ties to home country.",
    body: "A clear cover letter strengthens any non-immigrant visa application. We draft yours based on your trip and personal context.",
  },
  "dummy-ticket-for-canada-visa": {
    title: "Reservation document for a Canada visitor visa",
    description: "Verifiable flight reservation accepted by IRCC for visitor visa applications.",
    body: "IRCC accepts reservation documents as proof of intended travel. Order a flight reservation and receive a real, verifiable PDF within 30 minutes.",
  },
  "proof-of-onward-travel-for-uk": {
    title: "Proof of onward travel for the UK",
    description: "Airline-accepted onward ticket for travelers entering the UK on visit visas or visa-waiver routes.",
    body: "UK border officers and airline check-in staff routinely ask for proof of onward travel. Our onward ticket service provides exactly that, fast.",
  },
};

export const Route = createFileRoute("/use-case/$slug")({
  loader: ({ params }) => {
    const data = CASES[params.slug];
    if (!data) throw notFound();
    return { useCase: data, slug: params.slug };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.useCase.title ?? "Use case"} | AeroPrior` },
      { name: "description", content: loaderData?.useCase.description ?? "" },
      { property: "og:title", content: loaderData?.useCase.title ?? "" },
      { property: "og:description", content: loaderData?.useCase.description ?? "" },
    ],
    links: loaderData ? [{ rel: "canonical", href: `/use-case/${loaderData.slug}` }] : [],
  }),
  notFoundComponent: () => (
    <PageLayout>
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <Link to="/" className="mt-4 inline-block text-sm underline">Home</Link>
      </div>
    </PageLayout>
  ),
  errorComponent: ({ error, reset }) => (
    <PageLayout>
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <button onClick={reset} className="mt-4 rounded-sm border border-border px-4 py-2 text-sm">Retry</button>
      </div>
    </PageLayout>
  ),
  component: UseCase,
});

function UseCase() {
  const { useCase } = Route.useLoaderData();
  return (
    <PageLayout>
      <PageHero eyebrow="Use case" title={useCase.title} subtitle={useCase.description} />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-base leading-relaxed">{useCase.body}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/services/flight-reservation" className="rounded-sm bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground">Order now</Link>
          <Link to="/samples" className="rounded-sm border border-border px-5 py-3 text-sm font-semibold">See samples</Link>
        </div>
      </section>
    </PageLayout>
  );
}