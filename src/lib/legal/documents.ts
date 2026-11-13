import { LEGAL, type LegalDocId } from "@/lib/legal/config";

const { productName, companyName, siteUrl, contactEmail, privacyEmail, supportEmail, effectiveDate, governingLaw, arbitrationVenue } =
  LEGAL;

const footer = `

---

*Adapted from attorney-drafted templates released by [General Legal](https://general.legal) under CC0 1.0. This is not legal advice and does not create an attorney-client relationship. Have counsel review before relying on these documents in production.*
`;

export const LEGAL_CONTENT: Record<
  LegalDocId,
  { title: string; subtitle: string; body: string }
> = {
  terms: {
    title: "Terms of Use",
    subtitle: `Version 1.0 · Last revised ${effectiveDate}`,
    body: `
The website located at **${siteUrl}** (the "**Site**") is operated by **${companyName}** ("**Company**," "**us**," "**our**," or "**we**") under the product name **${productName}**. Certain features of the Site may be subject to additional guidelines posted on the Site, which are incorporated by reference into these Terms.

These Terms of Use ("**Terms**") govern your use of the Site. By accessing or using the Site, you agree to these Terms. You must be at least **18 years old** to use the Site. If you do not agree, do not use the Site.

**IMPORTANT — PLEASE READ SECTION 11 CAREFULLY.** It contains an agreement to resolve disputes through binding individual arbitration instead of in court, and includes a waiver of class action rights and jury trial rights. You have 30 days to opt out of the arbitration agreement, as described in Section 11.

## 1. Accounts

### 1.1 Creating an Account
Some features (including Library collections, favorites, and admin tools) may require registration. You agree to provide accurate information and keep it current. We may suspend or terminate accounts as described in Section 8.

### 1.2 Account Security
You are responsible for keeping login credentials confidential and for activity under your account. Notify us promptly at ${supportEmail} if you suspect unauthorized access.

## 2. Access to the Site

### 2.1 License
Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Site for your own personal or internal business evaluation purposes.

### 2.2 Restrictions
You may not: (i) license, sell, rent, or commercially exploit the Site or its content except as expressly allowed; (ii) reverse-engineer or attempt to extract source code except where prohibited restrictions are not allowed by law; (iii) access the Site to build a competing catalog by scraping at scale; (iv) overload, disrupt, or abuse our APIs, search, or infrastructure; or (v) remove proprietary notices.

### 2.3 Changes
We may modify, suspend, or discontinue the Site (or any part) at any time. We are not liable for such changes.

### 2.4 Ownership
Intellectual property in the Site and original content belongs to Company or its licensors. Third-party tool names, logos, and trademarks belong to their owners. Catalog descriptions may summarize publicly available information and are not an endorsement.

### 2.5 Feedback
If you share feedback, you grant us a perpetual, irrevocable, worldwide, royalty-free license to use it without attribution.

## 3. Privacy & Cookies
Your use is also governed by our [Privacy Policy](/legal/privacy) and [Cookie Notice](/legal/cookies), incorporated by reference. If there is a conflict about personal data processing, the Privacy Policy controls.

## 4. Catalog, Recommendations & AI Features
${productName} helps you discover and compare AI tools. Search, ranking, and explanations may use automated systems (including third-party AI providers). Outputs are informational only. See our [Disclaimer](/legal/disclaimer) and [Acceptable Use Agreement](/legal/acceptable-use).

## 5. Indemnification
You agree to defend, indemnify, and hold harmless Company and its officers, employees, and agents from claims and reasonable costs arising out of (i) your use of the Site, (ii) your violation of these Terms, or (iii) your violation of law.

## 6. Third-Party Services
The Site links to third-party AI tools, documentation, and publishers. We do not control or endorse Third-Party Services. Their own terms and privacy policies apply. You use them at your own risk.

## 7. Disclaimers
THE SITE IS PROVIDED "**AS IS**" AND "**AS AVAILABLE**." TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE CATALOG IS COMPLETE, CURRENT, OR ERROR-FREE, OR THAT RECOMMENDATIONS FIT YOUR USE CASE.

## 8. Limitation of Liability
TO THE MAXIMUM EXTENT PERMITTED BY LAW: (A) WE WILL NOT BE LIABLE FOR LOST PROFITS, LOST DATA, OR INDIRECT, CONSEQUENTIAL, INCIDENTAL, SPECIAL, EXEMPLARY, OR PUNITIVE DAMAGES; AND (B) OUR TOTAL LIABILITY FOR ANY CLAIM IS CAPPED AT THE GREATER OF **$50 USD** OR THE AMOUNT YOU PAID US UNDER THESE TERMS IN THE SIX MONTHS BEFORE THE CLAIM.

## 9. Term and Termination
These Terms apply while you use the Site. We may suspend or terminate access at any time for any reason, including Terms violations. Sections 2.2–2.5 and 3–11 survive termination.

## 10. General
### 10.1 Changes
We may update these Terms. Material changes may be noticed on the Site or by email. Continued use after notice means acceptance.

### 10.2 Governing Law
These Terms are governed by the laws of ${governingLaw}, without regard to conflict-of-law rules. For claims not subject to arbitration, courts in ${arbitrationVenue} have exclusive jurisdiction, subject to applicable consumer protections.

### 10.3 Entire Agreement
These Terms, the Privacy Policy, Cookie Notice, Acceptable Use Agreement, and Disclaimer are the entire agreement regarding the Site.

### 10.4 Contact
${companyName} · ${contactEmail} · ${siteUrl}

## 11. Dispute Resolution (Arbitration)
Please read carefully. Except for (i) individual small-claims actions and (ii) IP equitable relief, you and Company agree to resolve disputes through **binding individual arbitration**, not court, and waive class actions and jury trials.

### 11.1 Informal Resolution
Before arbitration, send written notice to ${contactEmail}. The parties will try in good faith to resolve the dispute within 60 days.

### 11.2 Opt-Out
You may opt out of arbitration within **30 days** of first accepting these Terms by emailing ${contactEmail} with your name, address, and a clear opt-out statement.

### 11.3 Severability
If any part of this Section 11 is unenforceable, it will be modified to the minimum extent necessary; the rest remains in effect.
${footer}`,
  },

  privacy: {
    title: "Privacy Policy",
    subtitle: `Effective as of ${effectiveDate} · GDPR-enhanced (adapted)`,
    body: `
**${companyName}** ("**${productName}**," "**we**," "**us**," or "**our**") provides an AI-tools discovery catalog, comparison features, news updates, and related services (the "**Service**"). This Privacy Policy describes how we process personal information collected through ${siteUrl} and related properties that link to this Policy.

**California / state privacy notice:** See **State privacy rights** below.

**European users:** See **Notice to European users** below.

## Personal information we collect

### Information you provide
1. **Contact data** — email address, display name, and similar details when you register or contact us.
2. **Account data** — authentication identifiers managed via our auth provider (Supabase Auth).
3. **Communications** — messages you send to support or feedback channels.
4. **User content** — search queries, collection names, favorites, and similar inputs you submit.
5. **Admin / contributor data** — if you are staff, role and editorial activity needed to operate the catalog.

### Information from third-party sources
Service providers that help us run the Service (hosting, authentication, analytics if enabled, AI inference providers used for search reformulation or embeddings).

### Automatic collection
1. **Device / log data** — browser type, approximate location derived from IP, pages viewed, referring URL, timestamps.
2. **Online activity** — search interactions, filters, and navigation on the Service.
3. **Local storage** — preferences such as theme mode and cookie consent choices stored on your device.

We do **not** intentionally collect government IDs, payment card numbers, or precise geolocation for the consumer catalog.

## Tracking technologies
We use cookies and similar technologies as described in our [Cookie Notice](/legal/cookies). Chat or generative-AI features (if enabled) may send prompts and limited context to contracted providers to produce answers; we instruct providers not to use your prompts to train public models where the contract allows that restriction.

## How we use personal information
1. **Provide and secure the Service** — accounts, sessions, abuse prevention.
2. **Operate discovery** — process queries, return catalog matches, improve ranking quality using aggregated signals.
3. **Publish and moderate content** — news, catalog edits, review workflows for staff.
4. **Communicate** — service notices and responses to your requests.
5. **Comply with law** and enforce our Terms.
6. **Improve the product** using de-identified or aggregated analytics where feasible.

## How we share personal information
We may share data with:
1. **Service providers** (hosting, database, auth, email, AI APIs) under contractual obligations.
2. **Professional advisors** (legal, security) when needed.
3. **Authorities** when required by law or to protect rights and safety.
4. **Business transfers** in connection with a merger, acquisition, or asset sale.

We do **not** sell personal information for money. We do not knowingly “share” personal information for cross-context behavioral advertising as defined by the CCPA/CPRA. If that changes, we will update this Policy and provide opt-out mechanisms.

## Retention
We retain account data while your account is active and for a reasonable period afterward for security, backups, and legal obligations. Search logs may be retained in aggregate or for a limited period to improve quality and detect abuse. You may request deletion as described below.

## Security
We use administrative, technical, and organizational measures appropriate to the risk (access controls, TLS in transit, role-based admin access). No method of transmission or storage is 100% secure.

## Your choices
1. **Account** — update profile information in-product where available.
2. **Cookies** — manage non-essential cookies via the cookie banner / preferences.
3. **Marketing** — opt out of optional emails using unsubscribe links (transactional mail may still be sent).
4. **Access / deletion** — contact ${privacyEmail}.

## State privacy rights (U.S.)
Depending on your state (e.g., California, Colorado, Connecticut, Virginia, and others), you may have rights to know/access, delete, correct, portability, and to opt out of certain processing. To exercise rights, email ${privacyEmail}. We will verify requests as required by law. You will not be discriminated against for exercising privacy rights.

**California Notice at Collection:** We collect the categories listed above for the purposes listed above. We retain information as described under Retention. We do not sell personal information.

## Notice to European users (GDPR / UK GDPR)
If you are in the EEA or UK, our legal bases may include: contract performance, legitimate interests (securing and improving the Service, answering inquiries), consent (where required for non-essential cookies or optional processing), and legal obligation.

You may have rights of access, rectification, erasure, restriction, objection, and portability, and the right to lodge a complaint with a supervisory authority. Contact ${privacyEmail}. Where we transfer data internationally, we use appropriate safeguards (such as standard contractual clauses) when required.

## Children
The Service is not directed to children under 16 (or under 13 where that is the applicable standard). We do not knowingly collect personal information from children.

## Changes
We may update this Policy and will revise the effective date above. Material changes may be highlighted on the Site.

## Contact
Privacy inquiries: **${privacyEmail}**  
General: **${contactEmail}**  
Site: **${siteUrl}**
${footer}`,
  },

  cookies: {
    title: "Cookie Notice",
    subtitle: `Last modified ${effectiveDate}`,
    body: `
This Cookie Notice explains how **${companyName}** ("**we**," "**us**," or "**our**") uses cookies and similar technologies on **${siteUrl}** and related pages that link to this Notice (the "**Sites**").

## What are cookies?
Cookies are small data files placed on your device when you visit a website. They help the Sites function, remember preferences, and understand usage. We may use session cookies (expire when you close the browser) and persistent cookies (remain until deleted or expired).

We use **first-party** cookies (set by us) and may use **third-party** cookies set by providers that help us operate the Sites (for example authentication or analytics, if enabled).

## Types we use

- **Essential** — Required for security, authentication sessions, and storing your cookie preference. Examples: Supabase auth cookies. Always on.
- **Functionality** — Remembers choices such as theme (light / dark / system) via localStorage. Can be cleared in browser settings.
- **Analytics** — Helps us understand traffic and feature usage only if enabled and consented. Off until you accept where required.
- **Advertising** — Not used by default on ${productName}. If we add ads later, we will update this Notice.

## Other technologies
1. **Browser web storage (localStorage / sessionStorage)** — theme and cookie consent records.
2. **Pixels / beacons** — only if we send HTML email campaigns or enable analytics that use them; not required for core catalog browsing.

We do **not** currently use Flash LSOs or session-replay SDKs. If that changes, we will update this Notice.

## Your choices
1. **Cookie banner** — on your first visit (and when you reopen preferences), you can accept or reject non-essential cookies where consent is required.
2. **Browser controls** — block or delete cookies in your browser settings. Blocking essential cookies may break login or security features.
3. **Industry opt-outs** — for interest-based ads from third parties (if we ever enable advertising): [Network Advertising Initiative](https://optout.networkadvertising.org/) and [Digital Advertising Alliance](https://optout.aboutads.info/).

## More information
See our [Privacy Policy](/legal/privacy) for how we process personal information.

## Questions
Email **${privacyEmail}**.
${footer}`,
  },

  "acceptable-use": {
    title: "Acceptable Use Agreement",
    subtitle: `Agreement for using ${productName} · ${effectiveDate}`,
    body: `
This Acceptable Use Agreement ("**Agreement**") supplements the [Terms of Use](/legal/terms) and applies to your use of **${productName}** (the "**Service**"). By using the Service, you agree to this Agreement.

## 1. Permitted use
You may use the Service to:
1. Browse, search, and compare AI tools listed in the catalog.
2. Read Latest / news posts and linked sources.
3. Save favorites or collections if those features are available on your account.
4. Share public links to catalog pages for legitimate informational purposes.

## 2. Prohibited use
You may not:
1. Scrape, harvest, or bulk-download the catalog, embeddings, or APIs in a way that burdens our systems or recreates a competing database, except via documented public interfaces and within reasonable rate limits.
2. Attempt to access admin, staff, or other users' accounts or data.
3. Upload malware, or probe the Service for vulnerabilities except under a coordinated disclosure emailed to ${supportEmail}.
4. Use the Service to generate or distribute unlawful, harmful, or deceptive content.
5. Misrepresent ${productName} recommendations as certified, regulated, or guaranteed advice (legal, medical, financial, or otherwise).
6. Circumvent paywalls, license terms, or access controls of third-party tools linked from the catalog.
7. Use automated bots that degrade service quality for others.

## 3. Third-party tools
Links to third-party AI products are for discovery only. You are solely responsible for complying with each vendor's terms, acceptable use, and export rules when you leave our Site.

## 4. AI outputs
Search answers and reformulated news may be produced with machine assistance. You must review outputs before relying on them. Do not use the Service as the sole basis for high-stakes decisions.

## 5. Enforcement
We may investigate violations, remove content, rate-limit, suspend, or terminate access, and report unlawful activity to authorities when appropriate.

## 6. Changes
We may update this Agreement; the date above will change. Continued use after posting means acceptance.

## 7. Contact
${supportEmail} · ${siteUrl}
${footer}`,
  },

  disclaimer: {
    title: "Disclaimer",
    subtitle: `Important limits on ${productName} · ${effectiveDate}`,
    body: `
## Informational purpose only
**${productName}** provides a curated catalog of AI tools, comparisons, and news-style updates for **informational purposes**. Nothing on the Site is professional advice (including legal, medical, investment, or compliance advice).

## No endorsement
Inclusion of a tool does not mean we endorse, certify, partner with, or verify every claim made by that tool's vendor. Trademarks and logos belong to their respective owners.

## Verification status
Fields may be marked "**To verify**." Rankings and match scores are internal quality signals for ordering results; they are not consumer-facing grades of safety, accuracy, or legality.

## Third-party sites
When you follow outbound links, you leave our Service and are subject to third-party terms and privacy practices. We are not responsible for third-party content, pricing, uptime, or data handling.

## AI-generated text
Portions of search explanations or news reformulations may be generated or assisted by AI models. They can be incomplete or incorrect. Always confirm critical facts with primary sources.

## Availability
The Service may change, break, or be unavailable. Catalog coverage is not exhaustive.

## Limitation
To the fullest extent permitted by law, ${companyName} disclaims liability arising from your reliance on catalog content, rankings, or third-party tools. See the [Terms of Use](/legal/terms) for warranty disclaimers and liability caps.

## Contact
${contactEmail}
${footer}`,
  },
};

export function getLegalDoc(id: string) {
  if (id in LEGAL_CONTENT) return LEGAL_CONTENT[id as LegalDocId];
  return null;
}
