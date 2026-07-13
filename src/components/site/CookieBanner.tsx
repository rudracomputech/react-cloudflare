import { useEffect, useState } from "react";

const KEY = "ap_cookie_consent_v1";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (typeof localStorage !== "undefined" && !localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* noop */
    }
  }, []);

  function accept(value: "all" | "essential") {
    try { localStorage.setItem(KEY, value); } catch { /* noop */ }
    setShow(false);
  }

  if (!show) return null;
  return (
    <div className="fixed inset-x-3 bottom-3 z-[90] rounded-sm border border-border bg-background p-4 shadow-2xl md:inset-x-auto md:bottom-6 md:right-6 md:max-w-md">
      <p className="text-xs text-muted-foreground">
        We use essential cookies to operate the site, and optional analytics to improve it. You can read more in our{" "}
        <a href="/legal/privacy" className="underline">Privacy Policy</a>.
      </p>
      <div className="mt-3 flex gap-2">
        <button onClick={() => accept("all")} className="rounded-sm bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground">Accept all</button>
        <button onClick={() => accept("essential")} className="rounded-sm border border-border px-3 py-2 text-xs">Essential only</button>
      </div>
    </div>
  );
}