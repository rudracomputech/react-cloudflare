import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-12">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 text-sm text-muted-foreground md:grid-cols-4">
        <div className="md:col-span-2">
          <span className="mb-4 block text-lg font-bold tracking-tighter text-foreground">
            AEROPRIOR
          </span>
          <p className="mb-4 max-w-xs">
            Professional travel documentation operations for visa and immigration applicants
            worldwide. Verifiable reservations, embassy-ready PDFs.
          </p>
          <p className="text-xs">© {new Date().getFullYear()} Aeroprior Operations Ltd. All rights reserved.</p>
        </div>
        <div>
          <h6 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-foreground">
            Platform
          </h6>
          <ul className="space-y-2">
            <li><Link to="/services/flight-reservation" className="hover:text-foreground">Flight Reservation</Link></li>
            <li><Link to="/services/hotel-reservation" className="hover:text-foreground">Hotel Reservation</Link></li>
            <li><Link to="/services/onward-ticket" className="hover:text-foreground">Onward Ticket</Link></li>
            <li><Link to="/services/cover-letter" className="hover:text-foreground">Cover Letter</Link></li>
            <li><Link to="/samples" className="hover:text-foreground">Samples</Link></li>
            <li><Link to="/how-it-works" className="hover:text-foreground">How it works</Link></li>
            <li><Link to="/track-order" className="hover:text-foreground">Track order</Link></li>
          </ul>
        </div>
        <div>
          <h6 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-foreground">
            Company
          </h6>
          <ul className="space-y-2">
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            <li><Link to="/faq" className="hover:text-foreground">FAQ</Link></li>
            <li><Link to="/reviews" className="hover:text-foreground">Reviews</Link></li>
            <li><Link to="/guides" className="hover:text-foreground">Guides</Link></li>
            <li><Link to="/blog" className="hover:text-foreground">Blog</Link></li>
            <li><Link to="/legal/terms" className="hover:text-foreground">Terms of Service</Link></li>
            <li><Link to="/legal/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
            <li><Link to="/legal/refunds" className="hover:text-foreground">Refund Policy</Link></li>
            <li><Link to="/legal/disclaimer" className="hover:text-foreground">Disclaimer</Link></li>
            <li><Link to="/legal/cookies" className="hover:text-foreground">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}