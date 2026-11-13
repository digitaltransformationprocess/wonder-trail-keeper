/** Brand / contact placeholders for legal pages — update when domain or entity changes. */
export const LEGAL = {
  productName: "AI Discov",
  companyName: "AI Discov",
  siteUrl:
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL) ||
    "https://aidiscov.com",
  contactEmail: "legal@aidiscov.com",
  privacyEmail: "privacy@aidiscov.com",
  supportEmail: "support@aidiscov.com",
  effectiveDate: "November 13, 2026",
  governingLaw: "the State of Delaware, United States",
  arbitrationVenue: "Wilmington, Delaware",
} as const;

export type LegalDocId =
  | "terms"
  | "privacy"
  | "cookies"
  | "acceptable-use"
  | "disclaimer";

export const LEGAL_DOCS: Array<{
  id: LegalDocId;
  title: string;
  short: string;
  path: `/legal/${LegalDocId}`;
}> = [
  {
    id: "terms",
    title: "Terms of Use",
    short: "Rules for accessing and using AI Discov.",
    path: "/legal/terms",
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    short: "How we collect, use, and share personal information.",
    path: "/legal/privacy",
  },
  {
    id: "cookies",
    title: "Cookie Notice",
    short: "Cookies and similar technologies on the Site.",
    path: "/legal/cookies",
  },
  {
    id: "acceptable-use",
    title: "Acceptable Use Agreement",
    short: "What you may and may not do with the catalog and tools.",
    path: "/legal/acceptable-use",
  },
  {
    id: "disclaimer",
    title: "Disclaimer",
    short: "Limits on recommendations, third-party tools, and verification.",
    path: "/legal/disclaimer",
  },
];
