import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/site/ServicePage";

export const Route = createFileRoute("/services/onward-ticket")({
  head: () => ({
    meta: [
      { title: "Onward Ticket — Proof of Onward Travel | AeroPrior" },
      { name: "description", content: "Verifiable onward ticket for visa-free entry, immigration checkpoints, and airline check-in. Delivered in minutes." },
      { property: "og:title", content: "Onward Ticket — AeroPrior" },
      { property: "og:description", content: "Proof of onward travel for immigration and airline check-in. Verifiable PNR, fast delivery." },
      { property: "og:url", content: "/services/onward-ticket" },
    ],
    links: [{ rel: "canonical", href: "/services/onward-ticket" }],
  }),
  component: Page,
});

function Page() {
  return (
    <ServicePage
      slug="onward-ticket"
      eyebrow="Service / Onward"
      name="Onward Ticket"
      headline="Onward travel proof for immigration & check-in"
      subtitle="A verifiable onward flight reservation accepted at airline check-in counters and immigration checkpoints worldwide."
      priceFrom="$14"
      deliveryEta="10–20 minutes"
      validity="24–48 hours"
      bullets={[
        { h: "Counter-ready", b: "Airline staff and border officers can verify your onward booking on the spot via the airline system." },
        { h: "Fast turnaround", b: "Most onward tickets delivered in under 20 minutes — useful when you're already at the airport." },
        { h: "Choose destination", b: "Specify the onward destination required by the country you're entering." },
        { h: "PDF + verification link", b: "Email-delivered PDF plus an airline verification URL for any officer to confirm." },
      ]}
      faq={[
        { q: "Will this work at airline check-in?", a: "Yes — onward tickets are designed exactly for this scenario. The PNR is verifiable for at least 24 hours." },
        { q: "Is this legal to use?", a: "Yes. An onward ticket is a real reservation. It is not a fake ticket — it is a temporary booking that proves you intend to leave the country." },
        { q: "How fast can I get one?", a: "Typically under 20 minutes. For airport emergencies we prioritize and notify you on WhatsApp." },
        { q: "What if it doesn't verify?", a: "Full refund and we re-issue at no extra cost." },
      ]}
    />
  );
}