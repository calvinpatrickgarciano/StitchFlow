
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
  getRoleDashboard,
  createTailorAccount
} from "./api";

const dashboardPath = (role) => {
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
      navigate(dashboardPath(account.role), {
        replace: true
      });
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter password"
          />

          <button disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="footer-text">
          New customer?{" "}
          <Link to="/register">Create an account</Link>
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
            minLength={8}
            maxLength={72}
            required
            placeholder="At least 8 characters"
          />

          <button disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="footer-text">
          Already registered?{" "}
          <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

function Protected({ user, role, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return (
      <Navigate
        to={dashboardPath(user.role)}
        replace
      />
    );
  }

  return children;
}

// ADMIN ONLY: CREATE A TAILOR ACCOUNT
function CreateTailor() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    setSuccess("");
    setLoading(true);

    try {
      const created = await createTailorAccount(form);

      setSuccess(
        `Tailor account created for ${created.fullName} (${created.email}).`
      );

      setForm({
        fullName: "",
        email: "",
        password: ""
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="content">
      <h1>Create Tailor Account</h1>
      <p>Register a staff member for your tailoring shop.</p>

      <div className="info-card">
        <h2>Staff Registration</h2>

        {error && (
          <div className="error">{error}</div>
        )}

        {success && (
          <p role="status" style={{ color: "#27734a" }}>
            {success}
          </p>
        )}

        <form onSubmit={submit}>
          <label>Tailor Full Name</label>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={update}
            required
            placeholder="Enter staff name"
          />

          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={update}
            required
            placeholder="staff@example.com"
          />

          <label>Initial Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={update}
            required
            minLength={8}
            maxLength={72}
            placeholder="At least 8 characters"
          />

          <button disabled={loading}>
            {loading ? "Creating..." : "Create Tailor Account"}
          </button>
        </form>

        <p>
          The new account will automatically receive
          the <strong>TAILOR</strong> role.
        </p>
      </div>
    </div>
  );
}

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();

  const [section, setSection] = useState("dashboard");
  const [serverMessage, setServerMessage] = useState("");
  const [error, setError] = useState("");

  const titles = {
    CUSTOMER: "Customer Dashboard",
    TAILOR: "Tailor Dashboard",
    ADMIN: "Administrator Dashboard"
  };

  useEffect(() => {
    let active = true;

    getRoleDashboard(user.role)
      .then((result) => {
        if (active) {
          setServerMessage(result.message);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
        }
      });

    return () => {
      active = false;
    };
  }, [user.role]);

  async function handleLogout() {
    setError("");

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
        <div className="sidebar-brand">
          ✂ StitchFlow
        </div>

        <div className="side-label">
          {user.role}
        </div>

        <button
          className="side-link"
          onClick={() => setSection("dashboard")}
        >
          Dashboard
        </button>

        {user.role === "ADMIN" && (
          <button
            className="side-link"
            onClick={() => setSection("staff")}
          >
            Create Tailor Account
          </button>
        )}

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

        {error && (
          <div className="error">{error}</div>
        )}

        {section === "dashboard" && (
          <div className="content">
            <h1>Hello, {user.fullName}!</h1>

            <p>Welcome to your StitchFlow dashboard.</p>

            <div className="info-card">
              <h2>{titles[user.role]}</h2>

              <p>
                {serverMessage ||
                  "Verifying dashboard access..."}
              </p>

              <p>
                Signed in as <strong>{user.role}</strong>
              </p>
            </div>
          </div>
        )}

        {section === "profile" && (
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

        {section === "staff" && user.role === "ADMIN" && (
          <CreateTailor />
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
    return (
      <div className="loading">
        Loading StitchFlow...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={user ? dashboardPath(user.role) : "/login"}
            replace
          />
        }
      />

      <Route
        path="/login"
        element={
          user ? (
            <Navigate
              to={dashboardPath(user.role)}
              replace
            />
          ) : (
            <Login onLogin={setUser} />
          )
        }
      />

      <Route
        path="/register"
        element={
          user ? (
            <Navigate
              to={dashboardPath(user.role)}
              replace
            />
          ) : (
            <Register />
          )
        }
      />

      {["CUSTOMER", "TAILOR", "ADMIN"].map((role) => (
        <Route
          key={role}
          path={dashboardPath(role)}
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

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}
