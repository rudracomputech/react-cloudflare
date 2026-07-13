import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { PageLayout } from "@/components/site/PageLayout";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

type Tab = { to: string; label: string; exact?: boolean };
const TABS: Tab[] = [
  { to: "/admin", label: "Dashboard", exact: true },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/contact", label: "Inbox" },
  { to: "/admin/coupons", label: "Coupons" },
  { to: "/admin/testimonials", label: "Testimonials" },
  { to: "/admin/faqs", label: "FAQs" },
  { to: "/admin/blog", label: "Blog" },
  { to: "/admin/guides", label: "Guides" },
  { to: "/admin/countries", label: "Countries" },
  { to: "/admin/templates", label: "Templates" },
  { to: "/admin/roles", label: "Roles" },
  { to: "/admin/activity", label: "Activity" },
  { to: "/admin/payment-logs", label: "Payments" },
  { to: "/admin/email-logs", label: "Emails" },
  { to: "/admin/settings", label: "Settings" },
];

function AdminLayout() {
  const { isStaff, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => { if (!loading && !isStaff) nav({ to: "/account" }); }, [loading, isStaff, nav]);
  if (loading || !isStaff) {
    return <PageLayout><div className="mx-auto max-w-7xl px-6 py-32 text-center text-sm text-muted-foreground">Loading…</div></PageLayout>;
  }
  return (
    <PageLayout>
      <div className="border-b border-border bg-subtle">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-6 py-3">
          <span className="mr-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Admin</span>
          {TABS.map((t) => (
            <Link key={t.to} to={t.to as any} activeOptions={{ exact: t.exact ?? false }}
              className="rounded-sm px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-background hover:text-foreground"
              activeProps={{ className: "rounded-sm px-3 py-1.5 text-xs font-medium bg-background text-foreground" }}>
              {t.label}
            </Link>
          ))}
        </div>
      </div>
      <Outlet />
    </PageLayout>
  );
}