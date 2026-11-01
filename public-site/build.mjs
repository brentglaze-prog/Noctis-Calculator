// Regenerates files.mjs (the Worker asset payload) from the source files in this folder.
// Key order is fixed so an unchanged tree reproduces the deployed payload byte-for-byte.
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const here=name=>fileURLToPath(new URL(name,import.meta.url));
const names=["home.html","coaching.html","method.html","resources.html","contact.html","site-compact-v2.css","consultation-v2.mjs","noctis-favicon-v2.svg","noctis-touch-v2.png","lab-compact.html","tools-compact-v3.css","calculator-client-v3.mjs","visual-coaching-v4.mjs","visual-coaching-v4.css","assets/noctis-prep-v4.webp","assets/noctis-hero-v4.webp","assets/noctis-health-v4.webp","assets/noctis-training-v4.webp","assets/noctis-prep-v5.webp","assets/noctis-training-v5.webp","assets/noctis-health-v5.webp","health-coaching.html","personal-training.html","bodybuilding-competition-prep.html","labs.html","assets/noctis-labs-v1.webp","home-refinement-v1.css","coaching-compact-v1.css","portal-preview-v1.css","assets/noctis-client-training-plan-demo-v1.jpg","assets/noctis-client-checkin-demo-v1.jpg","portal.html","consultation-mobile-v1.css"];
const binary=/\.(png|jpg|webp)$/;
const files=Object.fromEntries(names.map(n=>[n,binary.test(n)?readFileSync(here(n)).toString('base64'):readFileSync(here(n),'utf8')]));
writeFileSync(here('files.mjs'),'export const files = '+JSON.stringify(files)+';\n');
