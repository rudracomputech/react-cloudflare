import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageLayout, PageHero } from "@/components/site/PageLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — What customers say | AeroPrior" },
      { name: "description", content: "Real, verified reviews from travelers who used AeroPrior reservations for visa applications and onward travel proof." },
      { property: "og:title", content: "Customer Reviews — AeroPrior" },
      { property: "og:description", content: "Verified reviews from real customers." },
    ],
    links: [{ rel: "canonical", href: "/reviews" }],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const { data } = useQuery({
    queryKey: ["public-reviews"],
    queryFn: async () =>
      (await supabase.from("testimonials").select("*").eq("published", true).order("created_at", { ascending: false })).data ?? [],
  });

  return (
    <PageLayout>
      <PageHero eyebrow="Reviews" title="Real feedback from real travelers" subtitle="Reviews come from customers who completed orders. We publish them verbatim." />
      <section className="mx-auto max-w-7xl px-6 py-16">
        {(data ?? []).length === 0 ? (
          <div className="rounded-sm border border-dashed border-border bg-subtle p-10 text-center text-sm text-muted-foreground">
            We're collecting reviews as we deliver. Check back soon.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(data ?? []).map((t: any) => (
              <article key={t.id} className="rounded-sm border border-border bg-background p-6">
                {t.rating ? (
                  <div className="font-mono text-[11px] uppercase tracking-widest text-accent">{"★".repeat(t.rating)}</div>
                ) : null}
                <p className="mt-3 text-sm leading-relaxed">{t.body}</p>
                <div className="mt-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  {t.author_name}{t.author_country ? ` · ${t.author_country}` : ""}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageLayout>
  );
}