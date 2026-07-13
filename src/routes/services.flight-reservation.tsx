import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/site/ServicePage";

export const Route = createFileRoute("/services/flight-reservation")({
  head: () => ({
    meta: [
      { title: "Flight Reservation for Visa — Verifiable PNR | AeroPrior" },
      { name: "description", content: "Embassy-grade flight reservations with a verifiable PNR, issued from a real GDS. Delivered in under 30 minutes for visa applications." },
      { property: "og:title", content: "Flight Reservation for Visa — AeroPrior" },
      { property: "og:description", content: "Verifiable PNR flight reservations for visa documentation. Delivered fast, refundable if not verifiable." },
      { property: "og:url", content: "/services/flight-reservation" },
    ],
    links: [{ rel: "canonical", href: "/services/flight-reservation" }],
  }),
  component: Page,
});

function Page() {
  return (
    <ServicePage
      slug="flight-reservation"
      eyebrow="Service / Flight"
      name="Flight Reservation"
      headline="Verifiable flight reservations for visa applications"
      subtitle="Issued from a real Global Distribution System. Each booking carries a live PNR your consular officer can verify directly with the airline."
      priceFrom="$18"
      deliveryEta="15–30 minutes"
      validity="48–72 hours"
      bullets={[
        { h: "Verifiable PNR", b: "Live record locator that your embassy or airline can confirm by phone or website during the validity window." },
        { h: "Real GDS issuance", b: "Bookings created via Amadeus, Sabre, or Galileo — the same systems used by travel agencies worldwide." },
        { h: "Round-trip or one-way", b: "Configure outbound, return, and connections. Match the exact itinerary in your visa application." },
        { h: "PDF + airline link", b: "Receive a clean, embassy-ready PDF itinerary plus a verification link, sent to your email." },
      ]}
      faq={[
        { q: "Is the reservation a real ticket?", a: "No. It is a temporary, verifiable booking — not a paid ticket. This is the standard format embassies accept as proof of intended travel." },
        { q: "How long does the PNR stay verifiable?", a: "Typically 48 to 72 hours. We confirm exact validity before delivery." },
        { q: "What if my reservation isn't verifiable?", a: "Full refund. We re-issue or refund any booking that cannot be confirmed by the airline within validity." },
        { q: "Can I choose the airline and route?", a: "Yes. Specify your preferred airline, dates, and routing in the order form." },
      ]}
    />
  );
}