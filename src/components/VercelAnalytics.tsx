import { Analytics } from "@vercel/analytics/react";
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getCookieConsent, type CookieConsentValue } from "@/components/CookieConsent";

/**
 * Loads Vercel Web Analytics only after the visitor accepts optional analytics
 * ("Accept all" in CookieConsent). Essential-only keeps tracking off.
 * Passes TanStack route + path so SPA navigations count as page views.
 */
export function VercelAnalytics() {
  const [allowed, setAllowed] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const route = useRouterState({
    select: (s) => {
      const last = s.matches[s.matches.length - 1];
      return last?.routeId ?? s.location.pathname;
    },
  });

  useEffect(() => {
    const sync = (value: CookieConsentValue | null) => {
      setAllowed(value === "all");
    };
    sync(getCookieConsent());
    const onConsent = (e: Event) => {
      const detail = (e as CustomEvent<CookieConsentValue>).detail;
      sync(detail ?? getCookieConsent());
    };
    window.addEventListener("ai-discov-cookie-consent", onConsent);
    return () => window.removeEventListener("ai-discov-cookie-consent", onConsent);
  }, []);

  if (!allowed) return null;
  return <Analytics framework="react" path={path} route={route} />;
}
