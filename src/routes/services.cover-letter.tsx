import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/site/ServicePage";

export const Route = createFileRoute("/services/cover-letter")({
  head: () => ({
    meta: [
      { title: "Visa Cover Letter — Embassy-Ready Drafting | AeroPrior" },
      { name: "description", content: "Professionally drafted visa cover letters explaining travel purpose, itinerary, and ties to home country." },
      { property: "og:title", content: "Visa Cover Letter — AeroPrior" },
      { property: "og:description", content: "Embassy-ready cover letters tailored to your visa category and country." },
      { property: "og:url", content: "/services/cover-letter" },
    ],
    links: [{ rel: "canonical", href: "/services/cover-letter" }],
  }),
  component: Page,
});

function Page() {
  return (
    <ServicePage
      slug="cover-letter"
      eyebrow="Service / Cover Letter"
      name="Visa Cover Letter"
      headline="Cover letters that explain your visa application clearly"
      subtitle="A concise, embassy-ready letter outlining your travel purpose, itinerary, financial coverage, and intention to return — written to the format each consulate expects."
      priceFrom="$12"
      deliveryEta="30–60 minutes"
      validity="N/A"
      bullets={[
        { h: "Tailored to visa type", b: "Tourist, business, family-visit, conference — we structure the letter to match the application category." },
        { h: "Country-specific phrasing", b: "Schengen, UK, US, Canada, UAE, and others each prefer slightly different framing. We adapt." },
        { h: "Itinerary integration", b: "Letter references your flights, hotels, and meetings so the consular officer sees one coherent file." },
        { h: "Editable draft included", b: "Receive the final PDF plus an editable copy so you can make last-minute adjustments." },
      ]}
      faq={[
        { q: "Do you write in my voice?", a: "Yes. You provide brief facts; we draft the letter in first person, professional tone." },
        { q: "How many revisions are included?", a: "Two free revisions within 48 hours of delivery." },
        { q: "Can you write for a specific embassy?", a: "Yes — tell us the country and visa type. We adapt the structure to that consulate's expectations." },
        { q: "Is the letter a guarantee of approval?", a: "No. No service can guarantee a visa outcome. A well-drafted letter materially improves the quality of your file." },
      ]}
    />
  );
}