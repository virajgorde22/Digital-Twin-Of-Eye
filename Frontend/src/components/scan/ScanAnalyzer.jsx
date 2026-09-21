import { useEffect, useMemo, useState } from "react";

const STAGES = [
  { id: 1, title: "Uploading retinal image...", console: [{ label: "Image Quality", state: "running" }] },
  { id: 2, title: "Verifying image quality...", checks: ["Image received", "Resolution verified", "Checking retinal quality"] },
  { id: 3, title: "Preprocessing retinal image..." },
  { id: 4, title: "Running AI disease detection...", model: true },
  { id: 5, title: "Analyzing disease probabilities..." },
  { id: 6, title: "Updating Digital Twin..." },
  { id: 7, title: "Analysis complete" },
];

const CONSOLE = [
  { label: "Image Quality", at: 2 },
  { label: "Preprocessing", at: 3 },
  { label: "RETFound", at: 4 },
  { label: "RFMiD Analysis", at: 5 },
  { label: "ODIR Analysis", at: 5 },
  { label: "Digital Twin", at: 6 },
];

export default function ScanAnalyzer({ previewUrl, result, busy }) {
  const [stage, setStage] = useState(1);
  const demoBars = useMemo(
    () => [
      { label: "Diabetic Retinopathy", value: 63 },
      { label: "Glaucoma", value: 86 },
      { label: "Cataract", value: 91 },
      { label: "AMD", value: 12 },
    ],
    []
  );
  const [barReady, setBarReady] = useState(false);

  useEffect(() => {
    if (result) {
      setStage(7);
      return;
    }
    setStage(1);
    setBarReady(false);
    const timers = [700, 1400, 2100, 2800, 3600, 4300].map((ms, i) =>
      setTimeout(() => setStage(i + 2), ms)
    );
    const barTimer = setTimeout(() => setBarReady(true), 3800);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(barTimer);
    };
  }, [busy, result]);

  const current = STAGES.find((s) => s.id === stage) || STAGES[0];

  return (
    <div>
      <p className="tiny">AI workstation</p>
      <h2 className="section-title">{current.title}</h2>
      <p className="muted">These stages describe the analysis experience while the backend processes your scan.</p>
      <div className="analyzer" style={{ marginTop: 18 }}>
        <div className="scan-stage">
          {previewUrl ? <img src={previewUrl} alt="Retinal image being analyzed" /> : null}
          <div className="scan-grid" />
          {stage >= 3 && stage < 7 ? <div className="scan-line" /> : null}
        </div>
        <aside className="console" aria-live="polite">
          <p className="tiny" style={{ color: "#20D9E8" }}>AI Analysis</p>
          {CONSOLE.map((row) => {
            const done = stage > row.at || result;
            const running = !result && stage === row.at;
            return (
              <div className="console-row" key={row.label}>
                <span>● {row.label}</span>
                <span className={done ? "status-done" : running ? "status-run" : ""}>
                  {done ? "Complete" : running ? "Running" : "Queued"}
                </span>
              </div>
            );
          })}
          {stage === 4 && (
            <div style={{ marginTop: 18 }}>
              <div className="tiny">AI Model</div>
              <strong>RETFound</strong>
              <div className="tiny" style={{ marginTop: 10 }}>Models</div>
              <p>RFMiD + ODIR</p>
              <p className="muted">Analyzing retinal features...</p>
            </div>
          )}
          {stage >= 5 && !result && (
            <div style={{ marginTop: 16 }}>
              {demoBars.map((bar) => (
                <div key={bar.label} style={{ marginBottom: 8 }}>
                  <div className="bar-row">
                    <span>{bar.label}</span>
                    <span>{barReady ? `${bar.value}%` : "—"}</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: barReady ? `${bar.value}%` : "8%" }} />
                  </div>
                </div>
              ))}
              <p className="tiny" style={{ marginTop: 10, color: "#829AB1" }}>
                Illustrative progress only. Final scores come from the AI service.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
