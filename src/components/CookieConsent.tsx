import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const STORAGE_KEY = "ai-discov-cookie-consent";

export type CookieConsentValue = "essential" | "all";

function readConsent(): CookieConsentValue | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "essential" || raw === "all") return raw;
  } catch {
    /* ignore */
  }
  return null;
}

export function getCookieConsent(): CookieConsentValue | null {
  if (typeof window === "undefined") return null;
  return readConsent();
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readConsent() == null);
  }, []);

  const save = (value: CookieConsentValue) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
    setVisible(false);
    window.dispatchEvent(new CustomEvent("ai-discov-cookie-consent", { detail: value }));
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      className="fixed inset-x-0 bottom-0 z-50 p-4 md:p-6"
    >
      <div className="glass mx-auto flex max-w-3xl flex-col gap-4 rounded-3xl px-5 py-5 shadow-lg md:flex-row md:items-end md:px-6">
        <div className="min-w-0 flex-1">
          <p className="type-title text-[1rem] tracking-[-0.02em] text-foreground">Cookies</p>
          <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
            We use essential cookies to run AI Discov securely, and optional analytics only if you
            allow them. See our{" "}
            <Link to="/legal/$slug" params={{ slug: "cookies" }} className="text-primary underline-offset-2 hover:underline">
              Cookie Notice
            </Link>{" "}
            and{" "}
            <Link to="/legal/$slug" params={{ slug: "privacy" }} className="text-primary underline-offset-2 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => save("essential")}
            className="rounded-full glass px-4 py-2 text-[0.8125rem] text-foreground transition-apple hover:bg-fill"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => save("all")}
            className="rounded-full bg-primary px-4 py-2 text-[0.8125rem] font-medium text-primary-foreground transition-apple hover:brightness-110"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
