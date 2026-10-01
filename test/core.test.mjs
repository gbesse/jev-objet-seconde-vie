// Objectif : vérifier la normalisation, la règle déterministe et les décisions sémantiques.
import test from "node:test";
import assert from "node:assert/strict";
import { objectCase, routeObject } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const casLimite = {
  "id": "limite-1",
  "text": "Cas synthétique traité par une règle déterministe avant toute analyse sémantique.",
  "source": {
    "url": "https://example.test/cas-limite",
    "date": "2026-09-27"
  },
  "quantity": 0
};
const casPrincipal = {
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
};
const casÀRevoir = {
  "id": "revue-1",
  "text": "Canapé propre avec une couture ouverte et une structure qui semble solide, sans photo du dessous.",
  "source": {
    "url": "https://example.test/dossier-ambigu",
    "date": "2026-09-26"
  },
  "details": {
    "origine": "donnée synthétique",
    "signal": "informations incomplètes"
  }
};
test("exige une source", () => assert.throws(() => objectCase({ id: "x", text: "y" }), /source/));
test("applique le cas limite sans appel Jev", async () => {
  const provider = createFakeProvider(() => { throw new Error("appel interdit"); });
  assert.equal((await routeObject(casLimite, provider)).decision, "no_object");
  assert.equal(provider.calls, 0);
});
test("classe un dossier sourcé avec une confiance suffisante", async () => {
  const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "repair", probabilities: {
  "repair": 0.82,
  "reuse": 0.036,
  "donate": 0.036,
  "recycle": 0.036,
  "residual_waste": 0.036,
  "no_object": 0.036
}, confidence: 0.82 } }, usage: { input_tokens: 10, output_tokens: 0 } }));
  const résultat = await routeObject(casPrincipal, provider);
  assert.equal(résultat.decision, "repair");
  assert.equal(résultat.review, false);
  assert.equal(provider.calls, 1);
});
test("marque une décision incertaine pour revue humaine", async () => {
  const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "reuse", probabilities: {
  "repair": 0.096,
  "reuse": 0.52,
  "donate": 0.096,
  "recycle": 0.096,
  "residual_waste": 0.096,
  "no_object": 0.096
}, confidence: 0.62 } }, usage: { input_tokens: 10, output_tokens: 0 } }));
  const résultat = await routeObject(casÀRevoir, provider);
  assert.equal(résultat.decision, "reuse");
  assert.equal(résultat.review, true);
  assert.equal(résultat.confidence, 0.62);
  assert.equal(provider.calls, 1);
});
