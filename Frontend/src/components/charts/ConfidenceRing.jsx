import { formatPercent, toPercent } from "../../utils/format";

export default function ConfidenceRing({ value = 0, label = "Confidence" }) {
  const pct = Math.max(0, Math.min(100, toPercent(value)));
  const radius = 58;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="ring-wrap" aria-label={`${label} ${formatPercent(value)}`}>
      <svg width="148" height="148" viewBox="0 0 148 148">
        <circle cx="74" cy="74" r={radius} fill="none" stroke="#EEF4F8" strokeWidth="10" />
        <circle
          cx="74"
          cy="74"
          r={radius}
          fill="none"
          stroke="url(#conf)"
          strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="conf" x1="0" x2="1">
            <stop offset="0%" stopColor="#1769FF" />
            <stop offset="100%" stopColor="#20D9E8" />
          </linearGradient>
        </defs>
      </svg>
      <div className="ring-center">
        <div className="metric">{formatPercent(value)}</div>
        <div className="tiny">{label}</div>
      </div>
    </div>
  );
}
