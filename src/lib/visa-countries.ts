export interface VisaCountry {
  slug: string;
  name: string;
  region: string;
  blurb: string;
  requirements: string[];
  tips: string[];
}

export const VISA_COUNTRIES: VisaCountry[] = [
  {
    slug: "Schengen",
    name: "Schengen Area",
    region: "Europe",
    blurb:
      "Schengen consulates require proof of accommodation, return travel, and travel medical insurance. Reservation documents are widely accepted in lieu of paid tickets at the application stage.",
    requirements: [
      "Confirmed flight itinerary (round-trip)",
      "Hotel reservations covering the full stay",
      "Travel medical insurance of at least €30,000 coverage",
      "Cover letter explaining purpose and itinerary",
    ],
    tips: [
      "Match flight and hotel dates exactly to your stated itinerary.",
      "Use a reservation that remains verifiable for at least 7 days after submission.",
      "Cover letter should reference your employer and ties to home country.",
    ],
  },
  {
    slug: "UK",
    name: "United Kingdom",
    region: "Europe",
    blurb:
      "UK Standard Visitor visa applications benefit from clear evidence of intended travel and return. Reservations are accepted as proof of intended itinerary.",
    requirements: [
      "Flight itinerary (round-trip) with verifiable PNR",
      "Hotel or accommodation address",
      "Cover letter and travel history evidence",
    ],
    tips: [
      "Avoid booking actual tickets before approval — reservations are acceptable.",
      "Submit accommodation aligned to your stay duration.",
    ],
  },
  {
    slug: "USA",
    name: "United States",
    region: "Americas",
    blurb:
      "B1/B2 visa interviews focus on ties to home country. Reservations support but do not substitute strong evidence of intent to return.",
    requirements: [
      "DS-160 confirmation",
      "Round-trip flight itinerary",
      "Hotel reservations or invitation letter",
    ],
    tips: [
      "Do not buy non-refundable tickets before the interview.",
      "Bring printed copies of reservations to the consular appointment.",
    ],
  },
  {
    slug: "Canada",
    name: "Canada",
    region: "Americas",
    blurb:
      "IRCC applications for visitor visas accept reservation documents as proof of intended travel.",
    requirements: [
      "Flight reservation with PNR",
      "Accommodation details",
      "Proof of funds and employment",
    ],
    tips: [
      "Submit reservations with dates inside your requested entry window.",
      "Pair reservations with a cover letter explaining purpose.",
    ],
  },
  {
    slug: "UAE",
    name: "United Arab Emirates",
    region: "Middle East",
    blurb:
      "Onward tickets are required at most UAE entry points, even for visa-on-arrival nationalities.",
    requirements: [
      "Onward or return flight booking",
      "Hotel reservation",
      "Passport with 6+ months validity",
    ],
    tips: [
      "Onward tickets are strictly enforced at Dubai and Abu Dhabi check-in counters.",
      "Reservations are valid 24–48 hours — coordinate timing with departure.",
    ],
  },
  {
    slug: "Thailand",
    name: "Thailand",
    region: "Asia",
    blurb:
      "Thai immigration enforces proof of onward travel for most visa-exempt arrivals.",
    requirements: [
      "Onward flight ticket out of Thailand within stamp validity",
      "Accommodation address (recommended)",
    ],
    tips: [
      "Airlines like Singapore Airlines and Qatar enforce strictly at check-in.",
      "Onward to neighbouring countries (Cambodia, Laos) is widely accepted.",
    ],
  },
  {
    slug: "Australia",
    name: "Australia",
    region: "Oceania",
    blurb:
      "Visitor visa subclass 600 applications benefit from clear itinerary documentation.",
    requirements: [
      "Flight reservation matching stay duration",
      "Accommodation confirmation",
      "Cover letter for tourist or visitor purpose",
    ],
    tips: [
      "Match reservation validity to processing time (15–30 days typical).",
      "Use reservations rather than paid tickets pre-decision.",
    ],
  },
  {
    slug: "Japan",
    name: "Japan",
    region: "Asia",
    blurb:
      "Japanese consulates require a detailed schedule of stay including transportation and accommodation.",
    requirements: [
      "Schedule of stay form",
      "Flight itinerary (round-trip)",
      "Hotel reservations for each night",
    ],
    tips: [
      "Hotel confirmations are checked carefully — use real properties.",
      "Cover letter should integrate the schedule of stay.",
    ],
  },
  {
    slug: "South-Korea",
    name: "South Korea",
    region: "Asia",
    blurb:
      "Korean visa applications accept reservation documents as part of supporting evidence.",
    requirements: [
      "Flight itinerary",
      "Accommodation details",
      "Bank statements and employment proof",
    ],
    tips: [
      "Itinerary should align with your stated purpose (tourism, business, family).",
    ],
  },
];