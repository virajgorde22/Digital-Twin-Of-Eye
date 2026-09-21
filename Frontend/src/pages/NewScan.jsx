import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ScanAnalyzer from "../components/scan/ScanAnalyzer";
import { createScan } from "../services/scanService";
import { analyzeScan } from "../services/predictionService";
import { getFriendlyError } from "../utils/errors";
import { isAllowedImage } from "../utils/image";

const STEPS = [
  { n: "01", label: "Select Eye" },
  { n: "02", label: "Upload" },
  { n: "03", label: "Verify" },
  { n: "04", label: "Analyze" },
  { n: "05", label: "Result" },
];

export default function NewScan() {
  const navigate = useNavigate();
  const toast = useToast();
  const { refreshAll } = useAuth();
  const inputRef = useRef(null);
  const [step, setStep] = useState(1);
  const [eyeSide, setEyeSide] = useState("LEFT");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  function onFile(selected) {
    if (!selected) return;
    if (!isAllowedImage(selected)) {
      setError("Please upload a JPG, JPEG, or PNG retinal fundus image.");
      return;
    }
    setError("");
    setFile(selected);
  }

  async function runAnalysis() {
    setBusy(true);
    setStep(4);
    setError("");
    try {
      const scan = await createScan(file, eyeSide);
      const prediction = await analyzeScan(scan.id, file);
      await refreshAll();
      sessionStorage.setItem(
        `eyetwin_prediction_${scan.id}`,
        JSON.stringify({ ...prediction, imageUrl: scan.imageUrl, previewUrl })
      );
      toast.success("AI analysis complete.");
      navigate(`/analysis/${scan.id}`, { state: { prediction, scan, previewUrl } });
    } catch (err) {
      const message = getFriendlyError(err, "AI analysis service is temporarily unavailable.");
      setError(message);
      toast.error(message);
      setStep(3);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="section-title" style={{ fontSize: 28 }}>New eye scan</h1>
      <p className="muted" style={{ marginBottom: 18 }}>
        Start a new retinal scan. Select an eye, upload a fundus image, then run AI-assisted analysis.
      </p>
      <div className="steps">
        {STEPS.map((item, idx) => (
          <div className={`step ${step === idx + 1 ? "active" : ""}`} key={item.n}>
            <div className="tiny">{item.n}</div>
            <strong>{item.label}</strong>
          </div>
        ))}
      </div>

      {error ? <div className="error-banner">{error}</div> : null}

      {step === 1 && (
        <div className="choice-grid">
          {["LEFT", "RIGHT"].map((side) => (
            <button
              key={side}
              className={`choice ${eyeSide === side ? "selected" : ""}`}
              onClick={() => setEyeSide(side)}
            >
              <div className="tiny">Select eye</div>
              <h2 className="section-title">{side === "LEFT" ? "Left eye" : "Right eye"}</h2>
              <p className="muted">Capture or upload a fundus photograph for this eye.</p>
            </button>
          ))}
          <div>
            <button className="btn btn-primary" onClick={() => setStep(2)}>
              Continue to upload
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <div
            className="dropzone"
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onFile(e.dataTransfer.files?.[0]);
            }}
          >
            <div>
              <h2 className="section-title">Upload retinal fundus image</h2>
              <p className="muted">JPG, PNG, JPEG · drag and drop or browse</p>
              {previewUrl ? <img src={previewUrl} alt="Selected retinal preview" style={{ maxHeight: 220, margin: "18px auto 0", borderRadius: 16 }} /> : null}
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            hidden
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
            <button className="btn btn-primary" disabled={!file} onClick={() => setStep(3)}>
              Verify image
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <h2 className="section-title">Image quality verification</h2>
          <p className="muted">Confirm this is a clear retinal fundus photograph before analysis.</p>
          {previewUrl ? <img src={previewUrl} alt="Image to verify" style={{ maxWidth: 360, borderRadius: 16, margin: "16px 0" }} /> : null}
          <ul>
            <li>Image received</li>
            <li>File type verified</li>
            <li>Ready for AI analysis</li>
          </ul>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => setStep(2)}>Back</button>
            <button className="btn btn-ai" onClick={runAnalysis} disabled={busy}>
              Run AI analysis
            </button>
          </div>
        </div>
      )}

      {step === 4 && <ScanAnalyzer previewUrl={previewUrl} busy={busy} />}
    </div>
  );
}
