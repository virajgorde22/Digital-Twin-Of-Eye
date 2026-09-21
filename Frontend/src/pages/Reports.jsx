import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getScans } from "../services/scanService";
import { getPredictionByScan } from "../services/predictionService";
import { eyeLabel, formatDate, formatPercent, sortScansNewest } from "../utils/format";

export default function Reports() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const scans = sortScansNewest(await getScans());
        const withPred = await Promise.all(
          scans.map(async (scan) => {
            try {
              return { scan, prediction: await getPredictionByScan(scan.id) };
            } catch {
              return { scan, prediction: null };
            }
          })
        );
        if (mounted) setRows(withPred);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <h1 className="section-title" style={{ fontSize: 30 }}>Reports</h1>
      <p className="muted" style={{ marginBottom: 18 }}>
        Open a comprehensive digital report for any analyzed scan.
      </p>
      {loading ? <div className="skeleton" style={{ height: 180 }} /> : null}
      {!loading && !rows.length ? <div className="card empty">No reports yet. Complete a scan to generate one.</div> : null}
      <div className="stack">
        {rows.map(({ scan, prediction }) => (
          <article className="card" key={scan.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
            <div>
              <div className="tiny">{formatDate(scan.scanDate)}</div>
              <strong>{eyeLabel(scan.eyeSide)}</strong>
              <p className="muted">
                {prediction?.disease || "Awaiting AI prediction"} · {prediction?.confidence != null ? formatPercent(prediction.confidence) : ""}
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => navigate(`/reports/${scan.id}`)}>
              Open report
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
