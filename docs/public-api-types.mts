// Objectif : vérifier que les types publics sont importables.
import { objectCase, routeObject } from "../src/index.mjs";
const dossier = objectCase({
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
});
void routeObject(dossier, { decide: async () => ({}) });
