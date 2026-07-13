import { createFileRoute } from "@tanstack/react-router";
import { PageLayout, PageHero } from "@/components/site/PageLayout";

export const Route = createFileRoute("/legal/refunds")({
  head: () => ({
    meta: [
      { title: "Refund Policy — AeroPrior" },
      { name: "description", content: "Full refund if your booking cannot be verified within its validity window." },
      { property: "og:url", content: "/legal/refunds" },
    ],
    links: [{ rel: "canonical", href: "/legal/refunds" }],
  }),
  component: () => (
    <PageLayout>
      <PageHero eyebrow="Legal" title="Refund Policy" />
      <article className="mx-auto max-w-3xl space-y-6 px-6 py-16 text-sm leading-relaxed text-muted-foreground">
        <p>You receive a full refund if:</p>
        <ul className="list-inside list-disc space-y-2">
          <li>The reservation cannot be verified within its stated validity window.</li>
          <li>We fail to deliver within the stated ETA without contacting you.</li>
          <li>The format of the document is incorrect for the stated visa category.</li>
        </ul>
        <p>Refunds are not issued for visa denials — visa outcomes are decided by consulates and are outside our control.</p>
        <p>Refunds are processed within 5–7 business days to the original payment method.</p>
      </article>
    </PageLayout>
  ),
});