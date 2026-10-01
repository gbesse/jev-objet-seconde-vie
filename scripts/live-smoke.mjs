// Objectif : effectuer un appel Jev synthétique uniquement sur demande explicite.
import { createJevClient } from "../src/jev.mjs";
import { routeObject } from "../src/index.mjs";
const client = createJevClient();
const résultat = await routeObject({
  "id": "exemple-1",
  "text": "Grille-pain de quatre ans qui chauffe encore mais dont le levier ne reste plus enclenché.",
  "source": {
    "url": "https://example.test/source-publique",
    "date": "2026-09-25"
  },
  "details": {
    "territoire": "Commune Exemple",
    "origine": "donnée synthétique"
  }
}, client);
console.log(JSON.stringify({ décision: résultat.decision, confiance: résultat.confidence, usage: résultat.usage }, null, 2));
