# NOCTIS public peptide calculator

Production route: https://www.noctiscoaching.com/resources/peptide-calculator/
Resources entry: https://www.noctiscoaching.com/resources

This addition uses direct dose, concentration, mL, and U-100 terminology. It accepts a user-supplied dose in mg or mcg; it does not recommend compound-specific doses. Calculations remain in the browser. Syringe scale and physical smallest marking are explicit. Results outside vial/syringe capacity are blocked; results between markings retain the unrounded value and require pharmacy confirmation rather than silently rounding.

## Files and validation

- `math.mjs`: pure conversion and validation logic.
- `client.mjs`: accessible form interactions; clears stale results on edits.
- `index.html`, `style.css`: calculator matching the existing public-site chrome.
- `resources.html`: existing Resources content with the calculator card added.
- `files.mjs`: generated immutable Worker asset payload from those five browser files.
- `edge.mjs`: bounded Worker entrypoint delegating all other paths to the existing `index.js` module.
- `math.test.mjs`: conversion, decimal marking, overflow, and input tests.

Run `node --test peptide-calculator/math.test.mjs`.
Regenerate `files.mjs` from the browser files whenever they change.

## Integration and rollback

Existing public Worker: `noctis-coaching` (Cloudflare). The public source tree is not present in the coaching portal repository. Deployment preserves the complete existing Worker module set, static-assets binding, runtime configuration, inquiry relay, and secrets by using the Cloudflare **Replace Worker Script Content** endpoint. Added modules are `noctis-peptide-edge.mjs` and `peptide-calculator/files.mjs`; the main module becomes `noctis-peptide-edge.mjs`. The original `index.js` is unmodified.

Baseline live version before this change: `a9e8c169-724b-42cb-9d86-fed93e9b908f`; deployment `928fd481-7ad1-41af-8701-221b037a4dad`. That version supports rollback. Future full public-site builds must incorporate or reapply this integration; an upload replacing the complete module set can otherwise remove the calculator.

No patient entries or runtime secrets belong in this repository.
