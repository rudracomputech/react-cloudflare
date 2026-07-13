import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageLayout } from "@/components/site/PageLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", params.slug)
      .eq("published", true)
      .maybeSingle();
    if (!data) throw notFound();
    return { post: data };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.post.title ?? "Article"} | AeroPrior Blog` },
      { name: "description", content: loaderData?.post.excerpt ?? loaderData?.post.title ?? "" },
      { property: "og:title", content: loaderData?.post.title ?? "" },
      { property: "og:description", content: loaderData?.post.excerpt ?? "" },
      ...(loaderData?.post.cover_url ? [{ property: "og:image", content: loaderData.post.cover_url }] : []),
    ],
    links: loaderData ? [{ rel: "canonical", href: `/blog/${loaderData.post.slug}` }] : [],
  }),
  notFoundComponent: () => (
    <PageLayout>
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="text-2xl font-bold">Article not found</h1>
        <Link to="/blog" className="mt-4 inline-block text-sm underline">Back to blog</Link>
      </div>
    </PageLayout>
  ),
  errorComponent: ({ error, reset }) => (
    <PageLayout>
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={reset} className="mt-4 rounded-sm border border-border px-4 py-2 text-sm">Retry</button>
      </div>
    </PageLayout>
  ),
  component: BlogPost,
});

function BlogPost() {
  const { post } = Route.useLoaderData();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.published_at,
    description: post.excerpt,
  };
  return (
    <PageLayout>
      <article className="mx-auto max-w-3xl px-6 py-16">
        <Link to="/blog" className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground">← Blog</Link>
        <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight">{post.title}</h1>
        {post.published_at ? (
          <div className="mt-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            {new Date(post.published_at).toLocaleDateString()}
          </div>
        ) : null}
        {post.cover_url ? (
          <img src={post.cover_url} alt="" className="mt-8 w-full rounded-sm border border-border" />
        ) : null}
        <div className="prose prose-neutral mt-10 max-w-none whitespace-pre-line text-base leading-relaxed">
          {post.body_md}
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </article>
    </PageLayout>
  );
}