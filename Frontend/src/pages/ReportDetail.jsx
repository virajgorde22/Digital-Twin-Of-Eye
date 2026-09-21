import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RetinalImage from "../components/media/RetinalImage";
import ProbabilityBars from "../components/charts/ProbabilityBars";
import ConfidenceRing from "../components/charts/ConfidenceRing";
import { getScan } from "../services/scanService";
import { getPredictionByScan } from "../services/predictionService";
import { getClinicalRecommendation } from "../services/recommendationService";
import { eyeLabel, formatDate, formatPercent } from "../utils/format";

export default function ReportDetail() {
  const { scanId } = useParams();
  const { user, healthProfile, digitalTwin } = useAuth();
  const [scan, setScan] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const s = await getScan(scanId);
      let p = null;
      try {
        p = await getPredictionByScan(scanId);
      } catch {
        p = null;
      }
      const cached = sessionStorage.getItem(`eyetwin_prediction_${scanId}`);
      if (cached) p = { ...p, ...JSON.parse(cached) };
      if (!mounted) return;
      setScan(s);
      setPrediction(p);
      setRecommendation(await getClinicalRecommendation({ prediction: p, healthProfile, digitalTwin }));
    })();
    return () => {
      mounted = false;
    };
  }, [scanId, healthProfile, digitalTwin]);

  return (
    <div className="report stack">
      <div className="hero">
        <div>
          <p className="tiny">EyeTwin clinical report</p>
          <h1 className="section-title" style={{ fontSize: 30 }}>Digital retinal report</h1>
        </div>
        <button className="btn btn-primary no-print" onClick={() => window.print()}>
          Download report
        </button>
      </div>

      <article className="card">
        <h2 className="section-title">Patient information</h2>
        <p>{user?.name}</p>
        <p className="muted">{user?.email}</p>
        <p className="muted">Age {healthProfile?.age || "—"} · {healthProfile?.gender || "Not specified"}</p>
      </article>

      <article className="card">
        <h2 className="section-title">Scan information</h2>
        <p>{eyeLabel(scan?.eyeSide || prediction?.eyeSide)}</p>
        <p className="muted">{formatDate(scan?.scanDate)}</p>
      </article>

      <article className="card">
        <h2 className="section-title">Retinal image</h2>
        <RetinalImage src={scan?.imageUrl} />
      </article>

      <article className="card" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16 }}>
        <div>
          <h2 className="section-title">AI prediction</h2>
          <p>{prediction?.disease || "Unavailable"}</p>
          <p className="tiny">AI prediction score — not a confirmed diagnosis</p>
        </div>
        <ConfidenceRing value={prediction?.confidence || 0} />
      </article>

      <div className="grid-2">
        <article className="card">
          <h2 className="section-title">RFMiD analysis</h2>
          <ProbabilityBars data={prediction?.rfmid} animate={false} />
        </article>
        <article className="card">
          <h2 className="section-title">ODIR analysis</h2>
          <ProbabilityBars data={prediction?.odir} animate={false} />
        </article>
      </div>

      <article className="card">
        <h2 className="section-title">Confidence</h2>
        <p className="metric">{prediction?.confidence != null ? formatPercent(prediction.confidence) : "—"}</p>
      </article>

      <article className="card">
        <h2 className="section-title">Grad-CAM</h2>
        {prediction?.gradCamUrl ? <RetinalImage src={prediction.gradCamUrl} alt="Grad-CAM heatmap" /> : <p className="muted">No Grad-CAM visualization is stored for this scan.</p>}
      </article>

      <article className="card">
        <h2 className="section-title">Disease progression</h2>
        <p className="muted">This report reflects the selected scan within the patient’s Digital Twin history.</p>
      </article>

      <article className="card">
        <h2 className="section-title">AI-assisted clinical recommendation</h2>
        <p>{recommendation?.summary}</p>
        <p className="muted">{recommendation?.followUp}</p>
        <p className="muted">{recommendation?.medicalInfo}</p>
        <h3>Sources</h3>
        <ul>
          {(recommendation?.sources || []).map((source) => (
            <li key={source}>{source}</li>
          ))}
        </ul>
      </article>

      <p className="disclaimer">
        Medical disclaimer: EyeTwin provides AI-assisted screening and clinical decision support. It is not a substitute for professional medical advice, diagnosis, or treatment. Final decisions must be made by a qualified ophthalmologist.
      </p>
    </div>
  );
}
