import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/site/ServicePage";

export const Route = createFileRoute("/services/hotel-reservation")({
  head: () => ({
    meta: [
      { title: "Hotel Reservation for Visa — Confirmed Booking | AeroPrior" },
      { name: "description", content: "Confirmed hotel reservations for visa applications. Real properties, verifiable confirmation numbers, embassy-ready PDF." },
      { property: "og:title", content: "Hotel Reservation for Visa — AeroPrior" },
      { property: "og:description", content: "Embassy-grade hotel reservations with verifiable confirmation numbers." },
      { property: "og:url", content: "/services/hotel-reservation" },
    ],
    links: [{ rel: "canonical", href: "/services/hotel-reservation" }],
  }),
  component: Page,
});

function Page() {
  return (
    <ServicePage
      slug="hotel-reservation"
      eyebrow="Service / Hotel"
      name="Hotel Reservation"
      headline="Confirmed hotel reservations for your visa file"
      subtitle="Real hotels at your stated destination, each with a verifiable confirmation code matching your travel dates and visa itinerary."
      priceFrom="$15"
      deliveryEta="20–40 minutes"
      validity="During stay window"
      bullets={[
        { h: "Confirmation number", b: "A unique booking reference the consular officer can verify with the property directly." },
        { h: "Real properties only", b: "Bookings made at established hotels — no shell listings, no unverifiable inventory." },
        { h: "Matched to itinerary", b: "Check-in and check-out aligned to your flight dates and stated purpose of travel." },
        { h: "Embassy-ready PDF", b: "Branded confirmation document with guest name, dates, hotel address, and confirmation code." },
      ]}
      faq={[
        { q: "Is this a paid hotel stay?", a: "No. It is a confirmed reservation suitable for documentation. Most embassies accept this format; payment is not required at the booking stage." },
        { q: "Can I cancel and travel later?", a: "Reservations follow each hotel's cancellation policy. We disclose any restrictions before issuance." },
        { q: "What if the embassy rejects the format?", a: "Full refund. We provide a re-issuance or refund if the documentation isn't accepted because of a format issue on our side." },
        { q: "Can I pick a specific hotel?", a: "Yes — submit your preferred property, or let us pick one matched to your itinerary." },
      ]}
    />
  );
}