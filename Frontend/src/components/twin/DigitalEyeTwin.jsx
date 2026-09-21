export default function DigitalEyeTwin({ active = true, compact = false }) {
  return (
    <svg
      className="twin-svg"
      viewBox="0 0 400 400"
      role="img"
      aria-label="Digital Eye Twin visualization"
      style={{ width: compact ? 220 : undefined }}
    >
      <defs>
        <radialGradient id="iris" cx="50%" cy="46%" r="55%">
          <stop offset="0%" stopColor="#20D9E8" stopOpacity="0.9" />
          <stop offset="42%" stopColor="#1769FF" />
          <stop offset="100%" stopColor="#071525" />
        </radialGradient>
        <linearGradient id="ring" x1="0" x2="1">
          <stop offset="0%" stopColor="#20D9E8" />
          <stop offset="100%" stopColor="#7357FF" />
        </linearGradient>
      </defs>

      <circle cx="200" cy="200" r="168" fill="none" stroke="url(#ring)" strokeWidth="1.2" opacity="0.45" className="spin-ring" />
      <circle cx="200" cy="200" r="148" fill="none" stroke="#20D9E8" strokeWidth="0.6" opacity="0.25" />
      <circle cx="200" cy="200" r="118" fill="url(#iris)" />
      <circle cx="200" cy="200" r="96" fill="none" stroke="#20D9E8" strokeWidth="0.8" opacity="0.35" />
      <ellipse cx="200" cy="200" rx="86" ry="38" fill="none" stroke="#9adfff" strokeWidth="1.4" opacity="0.55" />
      <circle cx="200" cy="200" r="28" fill="#071525" />
      <circle cx="200" cy="200" r="12" fill="#1769FF" />
      <circle cx="208" cy="192" r="4" fill="white" opacity="0.85" />

      <g className="particles" fill="#20D9E8">
        <circle cx="86" cy="118" r="2.2" />
        <circle cx="318" cy="146" r="1.8" style={{ animationDelay: "1s" }} />
        <circle cx="92" cy="278" r="1.6" style={{ animationDelay: "2s" }} />
        <circle cx="310" cy="268" r="2" style={{ animationDelay: "0.6s" }} />
        <circle cx="200" cy="64" r="1.8" />
      </g>

      <g stroke="#20D9E8" strokeWidth="0.8" fill="none" opacity="0.45">
        <line x1="200" y1="52" x2="200" y2="84" />
        <line x1="52" y1="200" x2="84" y2="200" />
        <line x1="316" y1="200" x2="348" y2="200" />
        <line x1="200" y1="316" x2="200" y2="348" />
      </g>

      <circle cx="200" cy="52" r="3.5" fill={active ? "#20D9E8" : "#829AB1"} />
      <circle cx="52" cy="200" r="3.5" fill="#7357FF" opacity="0.8" />
      <circle cx="348" cy="200" r="3.5" fill="#1769FF" />
      <circle cx="200" cy="348" r="3.5" fill="#13B8A6" />
    </svg>
  );
}
