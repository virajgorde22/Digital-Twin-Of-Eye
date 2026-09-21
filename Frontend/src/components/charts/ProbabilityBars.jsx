import { useEffect, useState } from "react";
import { formatPercent, mapToEntries } from "../../utils/format";

export default function ProbabilityBars({ data = {}, animate = true }) {
  const entries = mapToEntries(data);
  const [ready, setReady] = useState(!animate);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!entries.length) {
    return (
      <p className="muted">
        Detailed model scores are shown after a live analysis. Historical records store the primary AI prediction.
      </p>
    );
  }

  const top = entries[0]?.label;

  return (
    <div className="bars">
      {entries.map((entry) => (
        <div key={entry.label}>
          <div className={`bar-row ${entry.label === top ? "top" : ""}`}>
            <span>{entry.label}</span>
            <strong>{formatPercent(entry.value / 100)}</strong>
          </div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: ready ? `${entry.value}%` : "0%" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
