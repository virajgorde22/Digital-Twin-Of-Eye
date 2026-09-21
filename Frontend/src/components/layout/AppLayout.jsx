import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  ScanLine,
  UserRound,
  Bell,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { firstName } from "../../utils/format";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/scan", label: "New Scan", icon: ScanLine },
  { to: "/history", label: "Scan History", icon: History },
  { to: "/profile", label: "Health Profile", icon: UserRound },
  { to: "/reports", label: "Reports", icon: FileText },
];

function NavItems({ onClick }) {
  return (
    <nav className="nav-list" aria-label="Primary">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={onClick}
        >
          <link.icon size={18} />
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  function signOut() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark" aria-hidden>
            ◉
          </div>
          <div>
            <div className="brand-word">
              Eye<span>Twin</span>
            </div>
            <div className="brand-sub">Digital Twin of the Eye</div>
          </div>
        </div>
        <NavItems />
        <div className="sidebar-bottom">
          <div className="user-chip">
            <div className="avatar">{firstName(user?.name).slice(0, 1)}</div>
            <div>
              <div>{user?.name}</div>
              <div className="tiny" style={{ color: "rgba(255,255,255,.5)", letterSpacing: 0, textTransform: "none" }}>
                {user?.email}
              </div>
            </div>
          </div>
          <button className="nav-item" onClick={signOut}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div className="menu-row">
            <button className="icon-btn hamburger" onClick={() => setOpen((v) => !v)} aria-label="Open menu">
              <Menu size={18} />
            </button>
            <div>
              <div className="tiny">EyeTwin</div>
              <strong>{links.find((l) => location.pathname.startsWith(l.to))?.label || "Workspace"}</strong>
            </div>
          </div>
          <div className="menu-row">
            <button className="icon-btn" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <button className="icon-btn" aria-label="Profile" onClick={() => navigate("/profile")}>
              <UserRound size={18} />
            </button>
            <button className="icon-btn" aria-label="Logout" onClick={signOut}>
              <LogOut size={18} />
            </button>
          </div>
        </header>
        {open && (
          <div className="card" style={{ marginBottom: 16 }}>
            <NavItems onClick={() => setOpen(false)} />
          </div>
        )}
        {children}
      </main>

      <nav className="mobile-nav" aria-label="Mobile">
        {links.slice(0, 5).map((link) => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? "active" : "")}>
            <link.icon size={18} />
            {link.label.split(" ")[0]}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
