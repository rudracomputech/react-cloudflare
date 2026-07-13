import { createFileRoute } from "@tanstack/react-router";
import { PageLayout, PageHero } from "@/components/site/PageLayout";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — AeroPrior" },
      { name: "description", content: "Terms governing use of AeroPrior travel documentation services." },
      { property: "og:url", content: "/legal/terms" },
    ],
    links: [{ rel: "canonical", href: "/legal/terms" }],
  }),
  component: () => (
    <PageLayout>
      <PageHero eyebrow="Legal" title="Terms of Service" />
      <article className="mx-auto max-w-3xl space-y-6 px-6 py-16 text-sm leading-relaxed text-muted-foreground">
        <p>By using AeroPrior you agree to these terms. AeroPrior provides verifiable travel reservation documents for visa, immigration, and onward-travel documentation purposes. Reservations are temporary bookings, not paid tickets or paid hotel stays.</p>
        <h2 className="!mt-8 text-base font-semibold text-foreground">Use of service</h2>
        <p>You agree to provide accurate information. Submitting fraudulent identity details, attempting to use documents to deceive border authorities about real travel intent, or any unlawful use will result in immediate refund-free cancellation and may be reported.</p>
        <h2 className="!mt-8 text-base font-semibold text-foreground">No guarantee of visa outcome</h2>
        <p>No service can guarantee visa approval. AeroPrior guarantees only that documents are verifiable during their stated validity window.</p>
        <h2 className="!mt-8 text-base font-semibold text-foreground">Refunds</h2>
        <p>Full refund issued if a document cannot be verified within validity. See the refund policy for details.</p>
      </article>
    </PageLayout>
  ),
});