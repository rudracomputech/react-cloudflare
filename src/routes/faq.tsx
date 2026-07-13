import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageLayout, PageHero } from "@/components/site/PageLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Frequently asked questions | AeroPrior" },
      { name: "description", content: "Answers about reservation legality, embassy verification, delivery times, refunds, and support." },
      { property: "og:title", content: "AeroPrior FAQ" },
      { property: "og:description", content: "Everything you need to know before ordering a reservation document." },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
  }),
  component: FAQPage,
});

function FAQPage() {
  const { data: faqs } = useQuery({
    queryKey: ["public-faqs"],
    queryFn: async () =>
      (await supabase.from("faqs").select("*").eq("published", true).order("sort_order")).data ?? [],
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: (faqs ?? []).map((f: any) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <PageLayout>
      <PageHero eyebrow="Support" title="Frequently asked questions" subtitle="If you don't find an answer here, reach out — support replies within stated hours." />
      <section className="mx-auto max-w-3xl px-6 py-16">
        {(faqs ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No FAQs published yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-sm border border-border bg-background">
            {(faqs ?? []).map((f: any) => (
              <li key={f.id} className="p-6">
                <h3 className="text-base font-semibold">{f.question}</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{f.answer}</p>
              </li>
            ))}
          </ul>
        )}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </section>
    </PageLayout>
  );
}