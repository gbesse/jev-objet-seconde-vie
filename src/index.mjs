// Objectif : implémenter la frontière de décision métier propre au dépôt.
import { readFile } from "node:fs/promises";
export const DECISIONS = Object.freeze({
  "repair": "réparation",
  "reuse": "réemploi",
  "donate": "don",
  "recycle": "recyclage",
  "residual_waste": "déchet_résiduel",
  "no_object": "aucun_objet"
});
const CRITERIA = Object.freeze({
  "repair": "réparation",
  "reuse": "réemploi",
  "donate": "don",
  "recycle": "recyclage",
  "residual_waste": "déchet résiduel",
  "no_object": "aucun objet"
});
export function objectCase(input) {
  if (!input?.id || !input?.text || !input?.source?.url || !input?.source?.date) throw new TypeError("Le dossier exige id, text, source.url et source.date");
  const date = new Date(input.source.date);
  if (Number.isNaN(date.valueOf())) throw new TypeError("source.date doit être une date ISO valide");
  return { ...input, id: String(input.id), text: String(input.text).trim(), source: { url: String(input.source.url), date: date.toISOString() } };
}
export async function routeObject(input, provider) {
  const record = objectCase(input);
  if (record.quantity === 0) return { decision: "no_object", label: DECISIONS["no_object"], probability: 1, review: false, deterministic: true };
  const response = await provider.decide({
    state: record,
    questions: { decision: { type: "choice", instructions: "Analysez ce dossier de seconde vie à partir des seuls éléments sourcés. Choisissez la catégorie la plus prudente. N’inventez ni fait, ni droit applicable, ni garantie.", criteria: CRITERIA } },
  });
  const answer = response.answers.decision;
  return { decision: answer.choice, label: DECISIONS[answer.choice], probability: answer.probabilities[answer.choice], confidence: answer.confidence, review: answer.confidence < 0.8, deterministic: false, usage: response.usage };
}
export async function runCli(argv, io = console) {
  if (argv.length !== 1) throw new Error("Usage : jev-objet-seconde-vie <dossier.json>");
  const dossier = objectCase(JSON.parse(await readFile(argv[0], "utf8")));
  io.log(JSON.stringify({ dossier, prochaineÉtape: "Transmettez ce dossier à routeObject avec un fournisseur Jev configuré." }, null, 2));
}
