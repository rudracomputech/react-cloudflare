import { createFileRoute } from "@tanstack/react-router";
import { PageLayout, PageHero } from "@/components/site/PageLayout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Support & WhatsApp | AeroPrior" },
      { name: "description", content: "Reach our support team via email, WhatsApp, or contact form. Typical response time under 10 minutes." },
      { property: "og:title", content: "Contact AeroPrior" },
      { property: "og:description", content: "Email, WhatsApp, or form. Response time under 10 minutes during support hours." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Contact"
        title="Talk to our documentation team"
        subtitle="Real humans, real response times. We handle urgent airport situations and consulate questions in minutes, not days."
      />
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1fr_360px]">
          <form className="space-y-6">
            <Field label="Your name" name="name" required />
            <Field label="Email" name="email" type="email" required />
            <Field label="WhatsApp (optional)" name="whatsapp" />
            <div>
              <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">How can we help</label>
              <textarea name="message" rows={6} required className="w-full rounded-sm border border-border bg-background px-4 py-3 text-sm focus:border-accent focus:outline-none" />
            </div>
            <button type="button" className="rounded-sm bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent/90">Send message</button>
            <p className="text-xs text-muted-foreground">By submitting you agree to our privacy policy. We never share your details.</p>
          </form>
          <aside className="h-fit space-y-6 rounded-sm border border-border bg-subtle p-6">
            <Info label="Email" value="support@aeroprior.com" />
            <Info label="WhatsApp" value="+1 (555) 010-0420" />
            <Info label="Support hours" value="24/7 — average reply 10 mins" />
            <Info label="Office" value="London, UK" />
          </aside>
        </div>
      </section>
    </PageLayout>
  );
}

function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</label>
      <input type={type} name={name} required={required} className="w-full rounded-sm border border-border bg-background px-4 py-3 text-sm focus:border-accent focus:outline-none" />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}