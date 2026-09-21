import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DigitalEyeTwin from "../components/twin/DigitalEyeTwin";
import ConfidenceRing from "../components/charts/ConfidenceRing";
import ProbabilityBars from "../components/charts/ProbabilityBars";
import RetinalImage from "../components/media/RetinalImage";
import { getScans } from "../services/scanService";
import { getPredictionByScan } from "../services/predictionService";
import { getClinicalRecommendation } from "../services/recommendationService";
import {
  eyeLabel,
  firstName,
  formatDate,
  formatMonth,
  formatPercent,
  greetingForNow,
  sortScansNewest,
} from "../utils/format";

export default function Dashboard() {
  const { user, digitalTwin, healthProfile } = useAuth();
  const navigate = useNavigate();
  const [scans, setScans] = useState([]);
  const [eye, setEye] = useState("ALL");
  const [recentPrediction, setRecentPrediction] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = sortScansNewest(await getScans());
        if (!mounted) return;
        setScans(list);
        if (list[0]?.id) {
          try {
            const pred = await getPredictionByScan(list[0].id);
            if (mounted) setRecentPrediction(pred);
          } catch {
            setRecentPrediction(null);
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    getClinicalRecommendation({
      prediction: recentPrediction,
      healthProfile,
      digitalTwin,
    }).then(setRecommendation);
  }, [recentPrediction, healthProfile, digitalTwin]);

  const filtered = useMemo(
    () => (eye === "ALL" ? scans : scans.filter((s) => String(s.eyeSide).toUpperCase() === eye)),
    [scans, eye]
  );
  const latest = filtered[0];
  const disease = recentPrediction?.disease || digitalTwin?.currentDisease;
  const confidence = recentPrediction?.confidence ?? digitalTwin?.currentConfidence;

  return (
    <div>
      <section className="hero">
        <div>
          <h1>
            {greetingForNow()}, {firstName(user?.name)} 👋
          </h1>
          <p className="muted">
            {digitalTwin?.lastScanDate
              ? "Your Digital Eye Twin is up to date."
              : "Your Digital Eye Twin is ready. Start a retinal scan to synchronize it."}
          </p>
          <div className="stat-pills">
            <div className="pill">
              Last Scan <strong>{formatDate(digitalTwin?.lastScanDate || latest?.scanDate)}</strong>
            </div>
            <div className="pill">
              Eye Status <strong>{disease ? "AI analyzed" : "Awaiting first scan"}</strong>
            </div>
          </div>
        </div>
        <button className="btn btn-ai" onClick={() => navigate("/scan")}>
          <Plus size={18} /> Start New Eye Scan
        </button>
      </section>

      <div className="grid-3">
        <article className="card card-lg">
          <p className="tiny">Current Eye Health</p>
          <h2 className="section-title">AI prediction overview</h2>
          <div className="health-split">
            <div>
              <div className="eye-tabs">
                <button className={`eye-tab ${eye === "LEFT" ? "active" : ""}`} onClick={() => setEye("LEFT")}>
                  Left eye
                </button>
                <button className={`eye-tab ${eye === "RIGHT" ? "active" : ""}`} onClick={() => setEye("RIGHT")}>
                  Right eye
                </button>
                <button className={`eye-tab ${eye === "ALL" ? "active" : ""}`} onClick={() => setEye("ALL")}>
                  Both
                </button>
              </div>
              <p className="muted">Current AI prediction</p>
              <h3 style={{ margin: "6px 0 10px" }}>{disease || "No prediction yet"}</h3>
              <p className="muted">Last scan {formatDate(digitalTwin?.lastScanDate || latest?.scanDate)}</p>
              <p className="tiny" style={{ marginTop: 12 }}>
                AI prediction — not a confirmed diagnosis
              </p>
            </div>
            <ConfidenceRing value={confidence || 0} />
          </div>
        </article>

        <article className="card card-lg twin-card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <p className="tiny" style={{ color: "#20D9E8" }}>Digital Eye Twin</p>
              <h2 className="section-title" style={{ color: "white" }}>Live twin view</h2>
            </div>
            <div className="sync">
              <span className="dot" /> Twin synchronized
            </div>
          </div>
          <DigitalEyeTwin active={Boolean(disease)} />
          <div className="twin-meta">
            <div className="twin-chip">
              <div className="tiny">Disease</div>
              {disease || "Awaiting analysis"}
            </div>
            <div className="twin-chip">
              <div className="tiny">Confidence</div>
              {confidence ? formatPercent(confidence) : "—"}
            </div>
            <div className="twin-chip">
              <div className="tiny">Last scan</div>
              {formatDate(digitalTwin?.lastScanDate || latest?.scanDate)}
            </div>
            <div className="twin-chip">
              <div className="tiny">Eye side</div>
              {eyeLabel(latest?.eyeSide)}
            </div>
          </div>
        </article>

        <article className="card card-lg">
          <p className="tiny">Recent retinal scan</p>
          {loading ? (
            <div className="skeleton" style={{ height: 220 }} />
          ) : latest ? (
            <>
              <RetinalImage src={latest.imageUrl} alt={`${eyeLabel(latest.eyeSide)} retinal scan`} />
              <p style={{ margin: "12px 0 4px" }}>
                <strong>{eyeLabel(latest.eyeSide)}</strong> · {formatDate(latest.scanDate)}
              </p>
              <p className="muted">AI prediction: {recentPrediction?.disease || disease || "Pending"}</p>
              <p className="muted">Model confidence: {confidence ? formatPercent(confidence) : "—"}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="btn btn-primary" onClick={() => navigate(`/analysis/${latest.id}`)}>
                  View Analysis
                </button>
                <button className="btn btn-ghost" onClick={() => navigate(`/reports/${latest.id}`)}>
                  View Report
                </button>
              </div>
            </>
          ) : (
            <div className="empty">No previous scans. Start a new retinal scan to build your timeline.</div>
          )}
        </article>
      </div>

      <div className="grid-2" style={{ marginTop: 18 }}>
        <article className="card">
          <h2 className="section-title">AI prediction scores</h2>
          <p className="muted" style={{ marginBottom: 16 }}>
            RFMiD analysis
          </p>
          <ProbabilityBars data={recentPrediction?.rfmid} />
        </article>
        <article className="card">
          <h2 className="section-title">AI prediction scores</h2>
          <p className="muted" style={{ marginBottom: 16 }}>
            ODIR analysis
          </p>
          <ProbabilityBars data={recentPrediction?.odir} />
        </article>
      </div>

      <div className="grid-2" style={{ marginTop: 18 }}>
        <article className="card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2 className="section-title">Disease progression</h2>
            <div className="eye-tabs">
              <button className={`eye-tab ${eye === "LEFT" ? "active" : ""}`} onClick={() => setEye("LEFT")}>Left</button>
              <button className={`eye-tab ${eye === "RIGHT" ? "active" : ""}`} onClick={() => setEye("RIGHT")}>Right</button>
            </div>
          </div>
          {filtered.length ? (
            <div className="timeline" style={{ marginTop: 12 }}>
              {filtered.slice(0, 6).map((scan) => (
                <div className="tl-item" key={scan.id}>
                  <div>
                    <strong>{formatMonth(scan.scanDate)}</strong>
                    <div className="tiny">{formatDate(scan.scanDate)}</div>
                  </div>
                  <div>
                    <div className="tl-node" />
                    <div className="tl-line" />
                  </div>
                  <div>
                    <strong>{eyeLabel(scan.eyeSide)}</strong>
                    <p className="muted">Scan recorded in your Digital Twin.</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">Progression appears after your first scans.</div>
          )}
        </article>

        <article className="card">
          <p className="tiny">Clinical support</p>
          <h2 className="section-title">AI-assisted clinical recommendation</h2>
          <p>{recommendation?.summary}</p>
          <p className="muted">{recommendation?.followUp}</p>
          <p className="muted">{recommendation?.medicalInfo}</p>
          <ul>
            {(recommendation?.sources || []).map((source) => (
              <li key={source}>{source}</li>
            ))}
          </ul>
          <p className="disclaimer">
            AI-generated clinical decision support. Final diagnosis and treatment decisions should be made by a qualified ophthalmologist.
          </p>
        </article>
      </div>
    </div>
  );
}
