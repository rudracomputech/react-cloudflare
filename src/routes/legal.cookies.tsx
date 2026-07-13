import { createFileRoute } from "@tanstack/react-router";
import { PageLayout, PageHero } from "@/components/site/PageLayout";

export const Route = createFileRoute("/legal/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy | AeroPrior" },
      { name: "description", content: "How AeroPrior uses cookies and similar technologies, and how to control them." },
    ],
    links: [{ rel: "canonical", href: "/legal/cookies" }],
  }),
  component: CookiePolicy,
});

function CookiePolicy() {
  return (
    <PageLayout>
      <PageHero eyebrow="Legal" title="Cookie Policy" subtitle="What we store, why we store it, and how to opt out." />
      <section className="mx-auto max-w-3xl px-6 py-16 text-sm leading-relaxed text-muted-foreground">
        <h2 className="mb-3 text-base font-semibold text-foreground">Strictly necessary</h2>
        <p>Session, authentication, and CSRF cookies that keep the site working. These cannot be disabled.</p>
        <h2 className="mb-3 mt-8 text-base font-semibold text-foreground">Functional</h2>
        <p>Currency preference, locale, and cookie-consent state are stored locally to remember your selections.</p>
        <h2 className="mb-3 mt-8 text-base font-semibold text-foreground">Analytics</h2>
        <p>We do not load analytics cookies until you accept the consent banner.</p>
        <h2 className="mb-3 mt-8 text-base font-semibold text-foreground">Controlling cookies</h2>
        <p>Use your browser settings to clear or block cookies. Some site functions may not work if blocked.</p>
      </section>
    </PageLayout>
  );
}