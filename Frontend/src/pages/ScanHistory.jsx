import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RetinalImage from "../components/media/RetinalImage";
import { getScans, getScansByEye } from "../services/scanService";
import { getPredictionByScan } from "../services/predictionService";
import { eyeLabel, formatDate, formatMonth, formatPercent, sortScansNewest } from "../utils/format";

export default function ScanHistory() {
  const navigate = useNavigate();
  const [eye, setEye] = useState("ALL");
  const [scans, setScans] = useState([]);
  const [preds, setPreds] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const list = sortScansNewest(eye === "ALL" ? await getScans() : await getScansByEye(eye));
        if (!mounted) return;
        setScans(list);
        const entries = await Promise.all(
          list.map(async (scan) => {
            try {
              return [scan.id, await getPredictionByScan(scan.id)];
            } catch {
              return [scan.id, null];
            }
          })
        );
        if (mounted) setPreds(Object.fromEntries(entries));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [eye]);

  return (
    <div>
      <div className="hero">
        <div>
          <h1 className="section-title" style={{ fontSize: 30 }}>Scan history</h1>
          <p className="muted">Review previous retinal scans in your Digital Twin timeline.</p>
        </div>
        <div className="eye-tabs">
          {["ALL", "LEFT", "RIGHT"].map((item) => (
            <button key={item} className={`eye-tab ${eye === item ? "active" : ""}`} onClick={() => setEye(item)}>
              {item === "ALL" ? "All" : item === "LEFT" ? "Left" : "Right"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 220 }} />
      ) : !scans.length ? (
        <div className="card empty">No previous scans for this view. Start a new retinal scan to begin your history.</div>
      ) : (
        <div className="timeline">
          {scans.map((scan) => {
            const pred = preds[scan.id];
            return (
              <div className="tl-item" key={scan.id} style={{ marginBottom: 18 }}>
                <div>
                  <strong>{formatMonth(scan.scanDate)}</strong>
                  <div className="tiny">{formatDate(scan.scanDate)}</div>
                </div>
                <div>
                  <div className="tl-node" />
                  <div className="tl-line" />
                </div>
                <article className="card">
                  <div className="grid-2">
                    <RetinalImage src={scan.imageUrl} />
                    <div>
                      <p className="tiny">{eyeLabel(scan.eyeSide)}</p>
                      <h3>{pred?.disease || "Prediction pending"}</h3>
                      <p className="muted">AI prediction score: {pred?.confidence != null ? formatPercent(pred.confidence) : "—"}</p>
                      <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => navigate(`/analysis/${scan.id}`)}>
                        View result
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
