import { createFileRoute } from "@tanstack/react-router";
import { PageLayout, PageHero } from "@/components/site/PageLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About AeroPrior — Travel documentation operations" },
      { name: "description", content: "AeroPrior is a documentation operations platform issuing verifiable travel reservations for visa, immigration, and onward-travel proof." },
      { property: "og:title", content: "About AeroPrior" },
      { property: "og:description", content: "A documentation operations platform — not a dummy ticket vendor." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="About"
        title="A documentation operations platform — not a dummy ticket shop"
        subtitle="AeroPrior issues verifiable travel reservations for visa, immigration, and onward-travel proof. Real airline and hotel inventory. Real verifiability. Real accountability."
      />
      <section className="mx-auto max-w-3xl space-y-10 px-6 py-16 text-base leading-relaxed text-muted-foreground">
        <p>Visa applicants and travellers need documentation that consular officers and border agents can verify. Most online sellers issue documents that look the part but don't withstand a one-minute check. That fails the traveller at exactly the moment it matters.</p>
        <p>We built AeroPrior because the industry needed a serious operator. Bookings are issued through actual Global Distribution Systems. Hotels are real properties. Cover letters are drafted by people who have read consulate guidance. When something doesn't work, we refund.</p>
        <p>Our customers are visa applicants, travel agents, immigration consultants, business travellers, and digital nomads — people who need documentation that holds up when it's checked.</p>
        <h2 className="!mt-16 text-xl font-bold tracking-tight text-foreground">What we don't do</h2>
        <ul className="list-inside list-disc space-y-2">
          <li>We don't sell fake or photoshopped documents.</li>
          <li>We don't guarantee visa approval — no service legally can.</li>
          <li>We don't issue inventory we can't stand behind.</li>
        </ul>
      </section>
    </PageLayout>
  );
}