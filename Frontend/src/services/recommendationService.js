/**
 * RAG-ready clinical recommendation abstraction.
 * When a RAG endpoint is added, replace the local builder with an API call.
 */

export async function getClinicalRecommendation(context) {
  return buildLocalRecommendation(context);
}

export function buildLocalRecommendation({
  prediction,
  healthProfile,
  digitalTwin,
}) {
  const disease = prediction?.disease || digitalTwin?.currentDisease;
  const confidence = Number(
    prediction?.confidence ?? digitalTwin?.currentConfidence ?? 0
  );
  const score = confidence <= 1 ? confidence * 100 : confidence;
  const conditions = [];

  if (healthProfile?.diabetes) conditions.push("diabetes");
  if (healthProfile?.hypertension) conditions.push("hypertension");
  if (healthProfile?.highCholesterol) conditions.push("high cholesterol");
  if (healthProfile?.familyHistory) conditions.push("family history of eye disease");

  const summary = disease
    ? `The current AI prediction for this retinal scan is ${disease} with a model confidence of ${score.toFixed(1)}%. This is an assistive finding, not a confirmed diagnosis.`
    : "No recent AI prediction is available yet. Complete a retinal scan to generate an AI-assisted clinical summary.";

  let followUp =
    "Schedule a routine ophthalmology review and keep your Digital Twin updated with regular scans.";

  if (score >= 70 && disease && !/normal/i.test(disease)) {
    followUp =
      "A specialist review with a qualified ophthalmologist is recommended to interpret these findings in a clinical context.";
  }

  if (conditions.length) {
    followUp += ` Your health profile notes ${conditions.join(", ")}, which can be relevant to retinal health and should be discussed with your clinician.`;
  }

  const medicalInfo = disease
    ? `${disease} findings on fundus imaging can have several causes. A clinician will consider symptoms, medical history, intraocular pressure, and additional imaging before confirming any diagnosis.`
    : "Retinal imaging can help track eye health over time when interpreted by a clinician.";

  return {
    summary,
    followUp,
    medicalInfo,
    sources: [
      "AI model ensemble: RETFound + RFMiD + ODIR (assistive screening)",
      "Patient health profile (self-reported)",
      "Digital Twin scan history",
    ],
    generatedBy: "rule-based-cds",
  };
}
