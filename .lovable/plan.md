
# Travel Documentation Operations Platform — Final Locked Plan

Scope is locked. After approval I generate 3 design directions in the enterprise envelope below, you pick one, I build Phase 1.

---

## Positioning (locked)

**H1:** Verifiable Travel Reservations for Visa & Immigration Documentation
**Sub:** Fast, secure, embassy-ready reservation documents for visa applications and onward travel requirements.

Voice: Linear / Stripe / Scale AI — operational, calm, process-driven. Lead vocabulary: *reservation support, itinerary assistance, visa documentation, onward travel proof, verifiable reservations*. "Dummy/fake ticket" terms appear only in SEO blog/long-tail pages, never in nav, hero, CTAs, checkout. Never claim "visa guaranteed".

## Design envelope (locked, varied across 3 directions)

Deep navy/charcoal · white surfaces · soft gray dividers · single restrained orange accent on primary CTAs only. One modern sans, generous whitespace, squarer corners, no gradients, no stock travel photos, minimal motion (fade/slide only). Shadcn New York customized to enterprise feel.

## Homepage (locked order)

Hero → trust strip (real numbers) → 4 services → how it works → why us → samples → reviews (empty-state OK at launch) → FAQ (FAQPage schema) → CTA. **Subtle live signals** in the trust strip: admin-configured support status (`online | away | offline`), dynamic delivery ETA (admin-set range like "18–25 mins"), "X reservations delivered today" + "last completed N mins ago" (real DB counts, never fabricated, hidden when zero). No countdown timers, no fake urgency.

## Sitemap (Phase 1)

Marketing: `/`, `/services/flight-reservation`, `/services/hotel-booking`, `/services/onward-ticket`, `/services/cover-letter`, `/how-it-works`, `/samples`, `/pricing`, `/about`, `/contact`, `/faq`, `/reviews`
SEO: `/blog`, `/blog/$slug`, `/guides`, `/guides/$slug`, `/visa/$country` (9 seeded: Schengen, USA, UK, Canada, Australia, Germany, Thailand, Japan, UAE), `/use-case/$slug` (6 seeded long-tails)
Customer: `/order/$service`, `/checkout/success`, `/track-order`, `/account/*`, `/auth/*`
Legal: `/terms`, `/privacy`, `/refund-policy`, `/disclaimer`, `/cookie-policy`
Admin: `/admin/*`

Per-route `head()` with unique title/description/og; canonical on leaves only; JSON-LD (Organization root, FAQPage on faq+service pages, Article on blog/guides, BreadcrumbList on deep routes); generated `sitemap.xml` + `robots.txt`.

## Order flow

`/order/$service` multi-step: trip → contact (IP→country, currency selector w/ seeded rates) → review + disclaimer checkbox (timestamped) + Turnstile placeholder → Stripe stub (Phase 2 wires real Checkout) → confirmation. Captures ip, country, user_agent, locale, currency, amount_usd, disclaimer_accepted_at.

## Admin (Phase 1 scope)

Orders list with priority badges (VIP/repeat/urgent), single-threshold SLA color, assignee, search/filter. Order detail with payment timeline, **internal notes (admin-only) and customer-visible messages (kept in separate columns, distinct UI)**, quick-reply templates (email + whatsapp), refund-risk marker, repeat-customer tag, customer order history, manual PDF upload + mark delivered, fulfillment history download, **download log per document (count, last_at, ip, user_agent)**.

Plus: coupons, testimonials, FAQ, blog/guides editor, country-page editor, contact inbox, role mgmt (`super_admin | admin | support_agent | fulfillment_agent | content_editor`), settings (company info, support hours, **support status toggle**, **delivery ETA range**, SLA threshold, maintenance mode, refund policy text), admin activity log, payment/email logs.

Deferred: device fingerprinting, escalation engine, feature-flag rollout %, observability dashboard, KPI dashboard, image variant pipeline, i18n, webhook replay UI, advanced analytics.

## Trust layer

Real company info in footer/about/contact, transparent refund policy, stated support hours + response time visible site-wide, stated delivery ETA on every service page, `/samples` with real PDFs, `/track-order` (order # + email), FAQ covering legality/embassy verification/cancellation/refund/support, disclaimer block on service + checkout pages, floating WhatsApp button (link only Phase 1), cookie consent banner.

## Data model (Phase 1)

```text
profiles, user_roles + app_role enum + has_role() SECURITY DEFINER
services(slug pk, name, description, base_price, currency, active, deleted_at)
orders(id, order_number, user_id?, service_slug, status, payment_status,
  currency, amount, amount_usd, country, ip, user_agent, locale,
  passengers jsonb, form_data jsonb, coupon_code?, disclaimer_accepted_at,
  assigned_admin_id, priority, refund_risk_flag,
  internal_notes,            -- admin-only
  customer_message,          -- visible to customer on /track-order
  delivered_at, deleted_at, created_at, updated_at)
order_documents(id, order_id, storage_path, filename, uploaded_by,
  download_count, last_downloaded_at, last_download_ip, last_download_ua, created_at)
order_document_downloads(id, document_id, ip, user_agent, downloaded_at)  -- full log
order_events(id, order_id, type, payload jsonb, actor_id, created_at)
coupons, testimonials, blog_posts, guides, country_pages, faqs,
contact_messages, reply_templates(channel, title, body_md),
settings(key pk, value jsonb),    -- holds support_status, eta_range, sla_threshold, maintenance_mode
admin_activity_logs, payment_logs, email_logs
```

RLS via `has_role()`; customers see own orders or signed track-order token; service role server-side only; soft-delete everywhere.

## Architecture seams (kept, not built)

`PaymentProvider` interface (Stripe first), `NotificationChannel` (Email first, WA Phase 2), `DocumentGenerator` (manual now, AI/PNR later), `OrderService` layer for future public/affiliate API. Zero cost now, unlocks later phases without rewrites.

## Phases

**Phase 1 (this build, no keys):** design system + 3 directions → choose → build everything above with Stripe stub and Turnstile placeholder.
**Phase 2 (needs Stripe, Twilio WhatsApp, Cloudflare Turnstile):** live payments multi-currency + Radar/AVS, webhook, Lovable Emails, WhatsApp delivery + status, signed/expiring document URLs, live Turnstile, full refund workflow.
**Phase 3:** SEO content velocity, coupons live, live FX, consent-gated analytics, business KPI widgets, Telegram/Slack admin alerts.
**Phase 4 (as business demands):** security headers/CSP, brute-force protection, structured logs, Sentry, webhook replay UI, fingerprinting, image variants/CDN, i18n, agent dashboard, affiliate API, AI itinerary, Amadeus/Sabre.

## You handle outside the build

Brand name + domain (+ `.net/.co` backups), real company info, real support hours, real refund policy text, real testimonials when available, sample PDFs to seed `/samples`. Everything is editable from admin.

---

Approve and I generate the 3 enterprise design directions for you to pick from.
