
import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate
} from "react-router-dom";

import {
  registerCustomer,
  loginUser,
  logoutUser,
  getCurrentUser,
  getRoleDashboard
} from "./api";

const homeFor = (role) => {
  if (role === "ADMIN") return "/admin";
  if (role === "TAILOR") return "/tailor";
  return "/customer";
};

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginUser(email, password);
      const account = await getCurrentUser();
      onLogin(account);
      navigate(homeFor(account.role), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand-mark">✂</div>
        <h1>Welcome to StitchFlow</h1>
        <p>Sign in to your tailoring account.</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={submit}>
          <label>Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <label>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />

          <button disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="footer-text">
          New customer? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerCustomer(form);
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand-mark">✂</div>
        <h1>Create an Account</h1>
        <p>Register as a StitchFlow customer.</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={submit}>
          <label>Full Name</label>
          <input
            name="fullName"
            value={form.fullName}
            onChange={update}
            required
            placeholder="Enter full name"
          />

          <label>Email Address</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={update}
            required
            placeholder="you@example.com"
          />

          <label>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={update}
            required
            minLength={8}
            maxLength={72}
            placeholder="At least 8 characters"
          />

          <button disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="footer-text">
          Already registered? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

function Protected({ user, role, children }) {
  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== role) {
    return <Navigate to={homeFor(user.role)} replace />;
  }

  return children;
}

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [serverMessage, setServerMessage] = useState("");
  const [error, setError] = useState("");
  const [section, setSection] = useState("dashboard");

  const titles = {
    CUSTOMER: "Customer Dashboard",
    TAILOR: "Tailor Dashboard",
    ADMIN: "Administrator Dashboard"
  };

  useEffect(() => {
    let active = true;

    getRoleDashboard(user.role)
      .then((data) => {
        if (active) setServerMessage(data.message);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });

    return () => { active = false; };
  }, [user.role]);

  async function handleLogout() {
    try {
      await logoutUser();
      onLogout();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">✂ StitchFlow</div>
        <div className="side-label">{user.role}</div>

        <button
          className="side-link"
          onClick={() => setSection("dashboard")}
        >
          Dashboard
        </button>

        <button
          className="side-link"
          onClick={() => setSection("profile")}
        >
          My Account
        </button>

        <button
          className="side-link logout-link"
          onClick={handleLogout}
        >
          Log Out
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <span>{titles[user.role]}</span>
          <strong>{user.fullName}</strong>
        </header>

        {error && <div className="error">{error}</div>}

        {section === "dashboard" ? (
          <div className="content">
            <h1>Hello, {user.fullName}!</h1>
            <p>Welcome to your StitchFlow dashboard.</p>

            <div className="info-card">
              <h2>{titles[user.role]}</h2>
              <p>{serverMessage || "Checking backend access..."}</p>
              <p>
                Signed in as <strong>{user.role}</strong>
              </p>
            </div>
          </div>
        ) : (
          <div className="content">
            <h1>My Account</h1>

            <div className="info-card">
              <p><strong>Name:</strong> {user.fullName}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>User ID:</strong> {user.id}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return <div className="loading">Loading StitchFlow...</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={user ? homeFor(user.role) : "/login"}
            replace
          />
        }
      />

      <Route
        path="/login"
        element={
          user
            ? <Navigate to={homeFor(user.role)} replace />
            : <Login onLogin={setUser} />
        }
      />

      <Route
        path="/register"
        element={
          user
            ? <Navigate to={homeFor(user.role)} replace />
            : <Register />
        }
      />

      {["CUSTOMER", "TAILOR", "ADMIN"].map((role) => (
        <Route
          key={role}
          path={homeFor(role)}
          element={
            <Protected user={user} role={role}>
              <Dashboard
                user={user}
                onLogout={() => setUser(null)}
              />
            </Protected>
          }
        />
      ))}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
