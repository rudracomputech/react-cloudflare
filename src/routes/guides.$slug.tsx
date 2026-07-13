import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageLayout } from "@/components/site/PageLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/guides/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase.from("guides").select("*").eq("slug", params.slug).eq("published", true).maybeSingle();
    if (!data) throw notFound();
    return { guide: data };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.guide.title ?? "Guide"} | AeroPrior Guides` },
      { name: "description", content: (loaderData?.guide.body_md ?? "").slice(0, 155) },
      { property: "og:title", content: loaderData?.guide.title ?? "" },
    ],
    links: loaderData ? [{ rel: "canonical", href: `/guides/${loaderData.guide.slug}` }] : [],
  }),
  notFoundComponent: () => (
    <PageLayout>
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="text-2xl font-bold">Guide not found</h1>
        <Link to="/guides" className="mt-4 inline-block text-sm underline">Back to guides</Link>
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
  component: GuideDetail,
});

function GuideDetail() {
  const { guide } = Route.useLoaderData();
  return (
    <PageLayout>
      <article className="mx-auto max-w-3xl px-6 py-16">
        <Link to="/guides" className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground">← Guides</Link>
        <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight">{guide.title}</h1>
        <div className="prose prose-neutral mt-10 max-w-none whitespace-pre-line text-base leading-relaxed">{guide.body_md}</div>
      </article>
    </PageLayout>
  );
}