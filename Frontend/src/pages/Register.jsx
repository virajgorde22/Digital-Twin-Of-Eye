import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import DigitalEyeTwin from "../components/twin/DigitalEyeTwin";
import { getFriendlyError } from "../utils/errors";

export default function Register() {
  const { user, register, loading } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(form);
    } catch (error) {
      toast.error(getFriendlyError(error, "Unable to create your account."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-split">
      <section className="auth-visual">
        <div className="brand" style={{ padding: 0 }}>
          <div className="brand-mark">◉</div>
          <div className="brand-word">
            Eye<span>Twin</span>
          </div>
        </div>
        <DigitalEyeTwin />
        <div className="auth-copy">
          <h2>See your eye. Understand your health. Build your Digital Twin.</h2>
        </div>
      </section>
      <section className="auth-form-wrap">
        <form className="auth-card" onSubmit={onSubmit}>
          <h1 className="section-title">Create account</h1>
          <p className="muted" style={{ marginBottom: 20 }}>
            Start tracking your retinal health with EyeTwin.
          </p>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" minLength={6} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <button className="btn btn-ai" style={{ width: "100%" }} disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </button>
          <p className="muted" style={{ marginTop: 16, textAlign: "center" }}>
            Already registered? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
