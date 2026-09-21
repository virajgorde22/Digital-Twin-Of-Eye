import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NewScan from "./pages/NewScan";
import ScanResult from "./pages/ScanResult";
import ScanHistory from "./pages/ScanHistory";
import HealthProfile from "./pages/HealthProfile";
import Reports from "./pages/Reports";
import ReportDetail from "./pages/ReportDetail";

function Shell({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Shell><Dashboard /></Shell>} />
            <Route path="/scan" element={<Shell><NewScan /></Shell>} />
            <Route path="/analysis/:scanId" element={<Shell><ScanResult /></Shell>} />
            <Route path="/history" element={<Shell><ScanHistory /></Shell>} />
            <Route path="/profile" element={<Shell><HealthProfile /></Shell>} />
            <Route path="/reports" element={<Shell><Reports /></Shell>} />
            <Route path="/reports/:scanId" element={<Shell><ReportDetail /></Shell>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
