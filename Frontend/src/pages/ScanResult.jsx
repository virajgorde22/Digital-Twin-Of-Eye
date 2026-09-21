import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ProbabilityBars from "../components/charts/ProbabilityBars";
import ConfidenceRing from "../components/charts/ConfidenceRing";
import RetinalImage from "../components/media/RetinalImage";
import DigitalEyeTwin from "../components/twin/DigitalEyeTwin";
import { getScan } from "../services/scanService";
import { getPredictionByScan } from "../services/predictionService";
import { getClinicalRecommendation } from "../services/recommendationService";
import { useAuth } from "../context/AuthContext";
import { eyeLabel, formatDate, formatPercent } from "../utils/format";
import { getFriendlyError } from "../utils/errors";

export default function ScanResult() {
  const { scanId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { healthProfile, digitalTwin } = useAuth();
  const [scan, setScan] = useState(location.state?.scan || null);
  const [prediction, setPrediction] = useState(location.state?.prediction || null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("overlay");
  const [overlay, setOverlay] = useState(55);
  const [recommendation, setRecommendation] = useState(null);
  const previewUrl = location.state?.previewUrl;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cached = sessionStorage.getItem(`eyetwin_prediction_${scanId}`);
        if (cached && !prediction) {
          const parsed = JSON.parse(cached);
          if (mounted) setPrediction(parsed);
        }
        const s = scan || (await getScan(scanId));
        if (mounted) setScan(s);
        if (!prediction?.rfmid) {
          try {
            const p = await getPredictionByScan(scanId);
            if (mounted) {
              setPrediction((current) => ({ ...p, ...current, ...p }));
            }
          } catch (err) {
            if (!prediction && mounted) setError(getFriendlyError(err, "No prediction is available for this scan yet."));
          }
        }
      } catch (err) {
        if (mounted) setError(getFriendlyError(err));
      }
    })();
    return () => {
      mounted = false;
    };
  }, [scanId]);

  useEffect(() => {
    getClinicalRecommendation({ prediction, healthProfile, digitalTwin }).then(setRecommendation);
  }, [prediction, healthProfile, digitalTwin]);

  const imageSrc = previewUrl || prediction?.previewUrl || scan?.imageUrl;
  const hasHeatmap = Boolean(prediction?.gradCamUrl);

  const compare = useMemo(() => {
    if (!hasHeatmap) return null;
    return (
      <div>
        <div className="eye-tabs">
          {["original", "heatmap", "overlay"].map((item) => (
            <button key={item} className={`eye-tab ${mode === item ? "active" : ""}`} onClick={() => setMode(item)}>
              {item}
            </button>
          ))}
        </div>
        <div className="compare">
          <RetinalImage src={imageSrc} />
          <div className="overlay-box">
            <RetinalImage src={mode === "original" ? imageSrc : prediction.gradCamUrl} alt="AI attention visualization" />
            {mode === "overlay" ? (
              <div style={{ position: "absolute", inset: 0, opacity: overlay / 100 }}>
                <RetinalImage src={prediction.gradCamUrl} alt="" />
              </div>
            ) : null}
          </div>
        </div>
        {mode === "overlay" ? (
          <input className="range" type="range" min="0" max="100" value={overlay} onChange={(e) => setOverlay(Number(e.target.value))} aria-label="Heatmap overlay amount" />
        ) : null}
      </div>
    );
  }, [hasHeatmap, imageSrc, mode, overlay, prediction]);

  if (error && !prediction) {
    return <div className="error-banner">{error === "NO_PREDICTION" ? "No prediction is available for this scan yet." : error}</div>;
  }

  return (
    <div className="stack">
      <div className="hero">
        <div>
          <p className="tiny">Detailed result</p>
          <h1 className="section-title" style={{ fontSize: 30 }}>AI analysis complete</h1>
          <p className="muted">
            {eyeLabel(prediction?.eyeSide || scan?.eyeSide)} · {formatDate(scan?.scanDate)}
          </p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate(`/reports/${scanId}`)}>
          Open report
        </button>
      </div>

      <div className="grid-2">
        <article className="card">
          <h2 className="section-title">Retinal image</h2>
          <RetinalImage src={imageSrc} />
        </article>
        <article className="card" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center" }}>
          <div>
            <p className="tiny">AI prediction</p>
            <h2 className="section-title">{prediction?.disease || "Unavailable"}</h2>
            <p className="muted">Model confidence {prediction?.confidence != null ? formatPercent(prediction.confidence) : "—"}</p>
            <p className="tiny" style={{ marginTop: 10 }}>Not a confirmed medical diagnosis</p>
          </div>
          <ConfidenceRing value={prediction?.confidence || 0} />
        </article>
      </div>

      <div className="grid-2">
        <article className="card">
          <h2 className="section-title">RFMiD analysis</h2>
          <p className="muted" style={{ marginBottom: 12 }}>AI prediction scores</p>
          <ProbabilityBars data={prediction?.rfmid} />
        </article>
        <article className="card">
          <h2 className="section-title">ODIR analysis</h2>
          <p className="muted" style={{ marginBottom: 12 }}>AI prediction scores</p>
          <ProbabilityBars data={prediction?.odir} />
        </article>
      </div>

      <article className="card">
        <h2 className="section-title">AI attention visualization</h2>
        {hasHeatmap ? compare : <p className="muted">Grad-CAM is not available for this scan yet. When the AI service provides a heatmap, original, heatmap, and overlay views will appear here.</p>}
      </article>

      <div className="grid-2">
        <article className="card twin-card">
          <p className="tiny" style={{ color: "#20D9E8" }}>Digital Twin</p>
          <h2 className="section-title" style={{ color: "white" }}>Twin updated</h2>
          <DigitalEyeTwin compact />
        </article>
        <article className="card">
          <h2 className="section-title">AI-assisted clinical recommendation</h2>
          <p>{recommendation?.summary}</p>
          <p className="muted">{recommendation?.followUp}</p>
          <p className="disclaimer">
            AI-generated clinical decision support. Final diagnosis and treatment decisions should be made by a qualified ophthalmologist.
          </p>
        </article>
      </div>
    </div>
  );
}
