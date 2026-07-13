import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

const NAV = [
  { to: "/services/flight-reservation", label: "Services" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/samples", label: "Samples" },
  { to: "/pricing", label: "Pricing" },
  { to: "/faq", label: "FAQ" },
  { to: "/blog", label: "Insights" },
] as const;

export function SiteHeader() {
  const { user, isStaff } = useAuth();
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold tracking-tighter text-foreground">
            AEROPRIOR
          </Link>
          <div className="hidden gap-6 text-[13px] font-medium uppercase tracking-wider text-muted-foreground md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/track-order"
            className="hidden text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Track order
          </Link>
          {user ? (
            <>
              <Link to="/account" className="hidden text-[13px] font-medium text-muted-foreground hover:text-foreground sm:inline">Account</Link>
              {isStaff && <Link to="/admin/orders" className="hidden text-[13px] font-medium text-muted-foreground hover:text-foreground sm:inline">Admin</Link>}
            </>
          ) : (
            <Link to="/auth/login" className="hidden text-[13px] font-medium text-muted-foreground hover:text-foreground sm:inline">Sign in</Link>
          )}
          <Link
            to="/order/$service"
            params={{ service: "flight-reservation" }}
            className="rounded-sm bg-accent px-5 py-2 text-sm font-semibold tracking-tight text-accent-foreground transition-all hover:bg-accent/90 active:scale-[0.98]"
          >
            Get your reservation
          </Link>
        </div>
      </div>
    </nav>
  );
}