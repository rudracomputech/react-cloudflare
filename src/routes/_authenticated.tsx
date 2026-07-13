import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { PageLayout } from "@/components/site/PageLayout";

export const Route = createFileRoute("/_authenticated")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const { user, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth/login" });
  }, [loading, user, nav]);

  if (loading || !user) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-7xl px-6 py-32 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      </PageLayout>
    );
  }

  return <Outlet />;
}