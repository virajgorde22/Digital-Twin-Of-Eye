import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { deleteHealthProfile, saveHealthProfile } from "../services/healthService";
import { getFriendlyError } from "../utils/errors";

const empty = {
  age: "",
  gender: "",
  diabetes: false,
  hypertension: false,
  highCholesterol: false,
  familyHistory: false,
  previousEyeDisease: "",
  previousEyeTreatment: "",
  currentMedication: "",
  additionalInformation: "",
};

export default function HealthProfile() {
  const { healthProfile, setHealthProfile } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    ...empty,
    ...healthProfile,
    age: healthProfile?.age ?? "",
    gender: healthProfile?.gender ?? "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!healthProfile) return;
    setForm({
      ...empty,
      ...healthProfile,
      age: healthProfile.age ?? "",
      gender: healthProfile.gender ?? "",
    });
  }, [healthProfile]);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        age: form.age === "" ? null : Number(form.age),
        gender: form.gender,
        diabetes: Boolean(form.diabetes),
        hypertension: Boolean(form.hypertension),
        highCholesterol: Boolean(form.highCholesterol),
        familyHistory: Boolean(form.familyHistory),
        previousEyeDisease: form.previousEyeDisease,
        previousEyeTreatment: form.previousEyeTreatment,
        currentMedication: form.currentMedication,
        additionalInformation: form.additionalInformation,
      };
      const saved = await saveHealthProfile(payload);
      setHealthProfile(saved);
      toast.success("Health profile saved.");
    } catch (error) {
      toast.error(getFriendlyError(error, "Unable to save your health profile."));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    try {
      await deleteHealthProfile();
      setHealthProfile(null);
      setForm(empty);
      toast.success("Health profile removed.");
    } catch (error) {
      toast.error(getFriendlyError(error, "Unable to delete the health profile."));
    }
  }

  return (
    <form className="stack" onSubmit={onSubmit}>
      <div>
        <h1 className="section-title" style={{ fontSize: 30 }}>Health profile</h1>
        <p className="muted">Keep this information current so AI-assisted recommendations stay relevant.</p>
      </div>

      {!healthProfile ? (
        <div className="card">Your profile is empty. Add a few details to personalize clinical support.</div>
      ) : null}

      <article className="card">
        <h2 className="section-title">Personal information</h2>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="age">Age</label>
            <input id="age" type="number" min="1" max="120" value={form.age} onChange={(e) => update("age", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="gender">Gender</label>
            <select id="gender" value={form.gender} onChange={(e) => update("gender", e.target.value)}>
              <option value="">Select</option>
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
              <option>Prefer not to say</option>
            </select>
          </div>
        </div>
      </article>

      <article className="card">
        <h2 className="section-title">Health conditions</h2>
        {[
          ["diabetes", "Diabetes"],
          ["hypertension", "Hypertension"],
          ["highCholesterol", "High cholesterol"],
        ].map(([key, label]) => (
          <label className="switch" key={key}>
            <span>{label}</span>
            <input type="checkbox" checked={Boolean(form[key])} onChange={(e) => update(key, e.target.checked)} />
          </label>
        ))}
      </article>

      <article className="card">
        <h2 className="section-title">Eye history</h2>
        <label className="switch">
          <span>Family history of eye disease</span>
          <input type="checkbox" checked={Boolean(form.familyHistory)} onChange={(e) => update("familyHistory", e.target.checked)} />
        </label>
        <div className="field">
          <label htmlFor="prev">Previous eye disease</label>
          <textarea id="prev" value={form.previousEyeDisease || ""} onChange={(e) => update("previousEyeDisease", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="treat">Previous eye treatment</label>
          <textarea id="treat" value={form.previousEyeTreatment || ""} onChange={(e) => update("previousEyeTreatment", e.target.value)} />
        </div>
      </article>

      <article className="card">
        <h2 className="section-title">Medication</h2>
        <div className="field">
          <label htmlFor="meds">Current medication</label>
          <textarea id="meds" value={form.currentMedication || ""} onChange={(e) => update("currentMedication", e.target.value)} />
        </div>
      </article>

      <article className="card">
        <h2 className="section-title">Additional information</h2>
        <div className="field">
          <label htmlFor="more">Notes for your clinician</label>
          <textarea id="more" value={form.additionalInformation || ""} onChange={(e) => update("additionalInformation", e.target.value)} />
        </div>
      </article>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save profile"}</button>
        {healthProfile ? (
          <button type="button" className="btn btn-danger" onClick={onDelete}>
            Delete profile
          </button>
        ) : null}
      </div>
    </form>
  );
}
