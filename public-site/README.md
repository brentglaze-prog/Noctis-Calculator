# NOCTIS public site: compact pages and consultations

Live site: https://www.noctiscoaching.com

Compact homepage, Coaching, Method, Resources, and consultation form. All three coaching paths link directly to `/contact?interest=...` with the choice carried into the form. A consultation link appears in the main header. Mobile stacks the cards and keeps the header visible. The four-screen peptide calculator is preserved.

`edge.mjs` is deployed as `noctis-public-edge.mjs` and delegates other requests, including API calls, to the retained `noctis-peptide-edge.mjs`. All existing Worker modules and configuration are preserved with Cloudflare's Replace Worker Script Content endpoint. `files.mjs` holds the browser files and touch icon. Existing icon routes and new versioned routes serve the same Noctis N monogram.

The form uses the existing `/api/inquiries` contract, consent, honeypot, request IDs, retry deduplication, and conditional phone number. It requests a consultation; it does not claim to book a calendar slot.

Edit the HTML, CSS, or client module, then regenerate `files.mjs` from those files. `build.py` generates the pages from retained site chrome; do not use generated pages as the original input for repeated template changes. No secrets or patient data are stored here.
