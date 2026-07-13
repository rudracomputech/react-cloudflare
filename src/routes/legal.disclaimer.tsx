import { createFileRoute } from "@tanstack/react-router";
import { PageLayout, PageHero } from "@/components/site/PageLayout";

export const Route = createFileRoute("/legal/disclaimer")({
  head: () => ({
    meta: [
      { title: "Disclaimer — AeroPrior" },
      { name: "description", content: "Important disclaimers about AeroPrior reservation documents and visa outcomes." },
      { property: "og:url", content: "/legal/disclaimer" },
    ],
    links: [{ rel: "canonical", href: "/legal/disclaimer" }],
  }),
  component: () => (
    <PageLayout>
      <PageHero eyebrow="Legal" title="Disclaimer" />
      <article className="mx-auto max-w-3xl space-y-6 px-6 py-16 text-sm leading-relaxed text-muted-foreground">
        <p>AeroPrior issues temporary, verifiable travel reservations for documentation purposes only. Reservations are not ticketed flights or paid hotel stays.</p>
        <p>AeroPrior is not affiliated with any airline, hotel chain, embassy, consulate, or government authority.</p>
        <p>Submission of an AeroPrior reservation in a visa application does not guarantee approval. Visa outcomes are at the sole discretion of the issuing consulate.</p>
      </article>
    </PageLayout>
  ),
});