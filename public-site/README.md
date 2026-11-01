# NOCTIS public site: compact pages and consultations

Live site: https://www.noctiscoaching.com

Compact homepage, Coaching, Method, Resources, and consultation form. All three coaching paths link directly to `/contact?interest=...` with the choice carried into the form. A consultation link appears in the main header. Mobile stacks the cards and keeps the header visible. The four-screen peptide calculator is preserved.

`edge.mjs` is deployed as `noctis-public-edge.mjs` and delegates other requests, including API calls, to the retained `noctis-peptide-edge.mjs`. All existing Worker modules and configuration are preserved with Cloudflare's Replace Worker Script Content endpoint. `files.mjs` holds the browser files and touch icon. Existing icon routes and new versioned routes serve the same Noctis N monogram.

The form uses the existing `/api/inquiries` contract, consent, honeypot, request IDs, retry deduplication, and conditional phone number. It requests a consultation; it does not claim to book a calendar slot.

Edit the HTML, CSS, or client module, then regenerate `files.mjs` from those files. `build.py` generates the pages from retained site chrome; do not use generated pages as the original input for repeated template changes. No secrets or patient data are stored here.

## Deployment map (verified 2026-11-01)

- `noctis-coaching` Worker: routes `www.noctiscoaching.com/*` and `noctiscoaching.com/*`. Main module `noctis-public-edge.mjs` (= `edge.mjs` here), plus `public-site/files.mjs`, `peptide-calculator/files.mjs`, `lead-email.mjs`, and the retained Next.js bundle (`index.js`, not in this repo). Bindings: ASSETS, INQUIRY_PORTAL_ORIGIN, INQUIRY_RELAY_SECRET (secret), LEAD_DELIVERY_DB (D1), LEAD_EMAIL, LEAD_OWNER_EMAIL.
- `noctis-learning-lab` Worker: routes `/learning-lab/reconstitution` and `/learning-lab/reconstitution/` on both hosts, so it shadows `lab-compact.html` in `files.mjs`. Single module `lab-edge.mjs`.
- Ship changes as a version upload (keeps bindings and assets), check the version's preview URL, then deploy that version. The `content/v2` API returns the latest uploaded version, which is not necessarily the deployed one.
