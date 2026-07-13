import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { VISA_COUNTRIES } from "@/lib/visa-countries";

// TODO: replace with project URL once a custom domain is set.
const BASE_URL = "";

const STATIC_PATHS = [
  { path: "/", priority: "1.0", changefreq: "weekly" as const },
  { path: "/about", priority: "0.6", changefreq: "monthly" as const },
  { path: "/pricing", priority: "0.8", changefreq: "monthly" as const },
  { path: "/samples", priority: "0.7", changefreq: "monthly" as const },
  { path: "/how-it-works", priority: "0.8", changefreq: "monthly" as const },
  { path: "/faq", priority: "0.7", changefreq: "monthly" as const },
  { path: "/reviews", priority: "0.6", changefreq: "weekly" as const },
  { path: "/guides", priority: "0.7", changefreq: "weekly" as const },
  { path: "/contact", priority: "0.5", changefreq: "monthly" as const },
  { path: "/track-order", priority: "0.5", changefreq: "monthly" as const },
  { path: "/blog", priority: "0.7", changefreq: "weekly" as const },
  { path: "/services/flight-reservation", priority: "0.9", changefreq: "monthly" as const },
  { path: "/services/hotel-reservation", priority: "0.9", changefreq: "monthly" as const },
  { path: "/services/onward-ticket", priority: "0.9", changefreq: "monthly" as const },
  { path: "/services/cover-letter", priority: "0.9", changefreq: "monthly" as const },
  { path: "/legal/terms", priority: "0.3", changefreq: "yearly" as const },
  { path: "/legal/privacy", priority: "0.3", changefreq: "yearly" as const },
  { path: "/legal/refunds", priority: "0.3", changefreq: "yearly" as const },
  { path: "/legal/disclaimer", priority: "0.3", changefreq: "yearly" as const },
  { path: "/legal/cookies", priority: "0.3", changefreq: "yearly" as const },
];

const USE_CASE_SLUGS = [
  "schengen-visa-flight-reservation",
  "onward-ticket-for-thailand",
  "hotel-booking-for-uae-visa",
  "cover-letter-for-us-visa",
  "dummy-ticket-for-canada-visa",
  "proof-of-onward-travel-for-uk",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries = [
          ...STATIC_PATHS,
          ...VISA_COUNTRIES.map((c) => ({
            path: `/visa/${c.slug}`,
            priority: "0.7",
            changefreq: "monthly" as const,
          })),
          ...USE_CASE_SLUGS.map((s) => ({
            path: `/use-case/${s}`,
            priority: "0.6",
            changefreq: "monthly" as const,
          })),
        ];

        const urls = entries
          .map(
            (e) =>
              `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
          )
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});