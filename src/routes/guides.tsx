import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageLayout, PageHero } from "@/components/site/PageLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/guides")({
  head: () => ({
    meta: [
      { title: "Guides — Visa & travel documentation guides | AeroPrior" },
      { name: "description", content: "In-depth guides on visa applications, embassy requirements, onward travel proof, and reservation documents." },
      { property: "og:title", content: "AeroPrior Guides" },
      { property: "og:description", content: "Long-form guides on visa and travel documentation." },
    ],
    links: [{ rel: "canonical", href: "/guides" }],
  }),
  component: GuidesIndex,
});

function GuidesIndex() {
  const { data } = useQuery({
    queryKey: ["public-guides"],
    queryFn: async () =>
      (await supabase.from("guides").select("slug,title,created_at").eq("published", true).order("created_at", { ascending: false })).data ?? [],
  });
  return (
    <PageLayout>
      <PageHero eyebrow="Resources" title="Guides" subtitle="Practical, embassy-aware guides written by our documentation team." />
      <section className="mx-auto max-w-5xl px-6 py-16">
        {(data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No guides published yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-sm border border-border bg-background">
            {(data ?? []).map((g: any) => (
              <li key={g.slug}>
                <Link to="/guides/$slug" params={{ slug: g.slug }} className="block p-6 hover:bg-subtle">
                  <h3 className="text-base font-semibold">{g.title}</h3>
                  <div className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{new Date(g.created_at).toLocaleDateString()}</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageLayout>
  );
}