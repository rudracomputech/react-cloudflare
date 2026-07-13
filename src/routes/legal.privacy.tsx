import { createFileRoute } from "@tanstack/react-router";
import { PageLayout, PageHero } from "@/components/site/PageLayout";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — AeroPrior" },
      { name: "description", content: "How AeroPrior collects, uses, and protects your information." },
      { property: "og:url", content: "/legal/privacy" },
    ],
    links: [{ rel: "canonical", href: "/legal/privacy" }],
  }),
  component: () => (
    <PageLayout>
      <PageHero eyebrow="Legal" title="Privacy Policy" />
      <article className="mx-auto max-w-3xl space-y-6 px-6 py-16 text-sm leading-relaxed text-muted-foreground">
        <p>We collect only the information needed to issue your reservation documents: name, contact details, travel dates, and payment metadata. We do not sell your data.</p>
        <h2 className="!mt-8 text-base font-semibold text-foreground">Retention</h2>
        <p>Order records are retained for 24 months for accounting and compliance. You can request deletion at any time by emailing support.</p>
        <h2 className="!mt-8 text-base font-semibold text-foreground">Third parties</h2>
        <p>We share data only with airlines, hotels, and payment processors strictly as required to fulfill your order.</p>
      </article>
    </PageLayout>
  ),
});