import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import DigitalEyeTwin from "../components/twin/DigitalEyeTwin";
import { getFriendlyError } from "../utils/errors";

export default function Login() {
  const { user, login, loading } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (error) {
      toast.error(getFriendlyError(error, "Unable to sign in. Please check your details."));
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
          <p className="tiny" style={{ color: "#20D9E8" }}>
            AI-Powered Digital Twin of the Human Eye
          </p>
          <h2>Understand your eye. Track your vision. Build your Digital Twin.</h2>
        </div>
      </section>
      <section className="auth-form-wrap">
        <form className="auth-card" onSubmit={onSubmit}>
          <h1 className="section-title">Sign in</h1>
          <p className="muted" style={{ marginBottom: 20 }}>
            Welcome back to your eye-health workspace.
          </p>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} disabled={submitting}>
            {submitting ? "Signing in..." : "Sign In"}
          </button>
          <p className="muted" style={{ marginTop: 16, textAlign: "center" }}>
            New to EyeTwin? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
