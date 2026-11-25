import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  registerCustomer,
  loginUser,
  logoutUser,
  getCurrentUser,
  getRoleDashboard,
  createTailorAccount,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} from "./api";

const dashboardPath = (role) => {
  if (role === "ADMIN") return "/admin";
  if (role === "TAILOR") return "/tailor";
  return "/customer";
};

const roleNames = {
  CUSTOMER: "Customer",
  TAILOR: "Tailor",
  ADMIN: "Administrator",
};

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  switch (name) {
    case "scissors":
      return <svg {...common}><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.2 8.2 20 20M8.2 15.8 20 4"/></svg>;
    case "home":
      return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
    case "user":
      return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></svg>;
    case "lock":
      return <svg {...common}><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>;
    case "users":
      return <svg {...common}><circle cx="9" cy="8" r="3"/><path d="M2.5 20v-2a6.5 6.5 0 0 1 13 0v2M17 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3.5 5"/></svg>;
    case "logout":
      return <svg {...common}><path d="M10 17l5-5-5-5M15 12H3M12 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6"/></svg>;
    case "arrow":
      return <svg {...common}><path d="M5 12h14m-6-6 6 6-6 6"/></svg>;
    case "check":
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></svg>;
    case "sparkle":
      return <svg {...common}><path d="m12 2 2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2L12 2Z"/></svg>;
    case "mail":
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>;
    case "eye":
      return <svg {...common}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>;
    case "eye-off":
      return <svg {...common}><path d="m3 3 18 18M10.6 5.1A11 11 0 0 1 12 5c6 0 10 7 10 7a16 16 0 0 1-3.3 3.9M6.5 6.5C3.8 8.4 2 12 2 12s4 7 10 7a9.5 9.5 0 0 0 4-.9"/><path d="M10 10a3 3 0 0 0 4 4"/></svg>;
    default:
      return null;
  }
}

function Brand({ light = false }) {
  return (
    <div className={`brand ${light ? "brand-light" : ""}`}>
      <span className="brand-icon"><Icon name="scissors" size={22} /></span>
      <span>Stitch<span className="brand-accent">Flow</span></span>
    </div>
  );
}

function Notice({ children, type = "success" }) {
  if (!children) return null;
  return <div className={`notice notice-${type}`} role={type === "error" ? "alert" : "status"}>{children}</div>;
}

function PasswordInput({ id, label, value, onChange, autoComplete = "off", placeholder = "Enter password", minLength, maxLength }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="field-group">
      <label htmlFor={id}>{label}</label>
      <div className="password-wrap">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder}
          minLength={minLength}
          maxLength={maxLength}
          required
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? "Hide password" : "Show password"}
          title={visible ? "Hide password" : "Show password"}
        >
          <Icon name={visible ? "eye-off" : "eye"} size={18} />
        </button>
      </div>
    </div>
  );
}

function AuthShell({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-feature">
          <div className="auth-feature-top"><Brand light /></div>
          <div className="auth-feature-content">
            <span className="eyebrow eyebrow-light"><Icon name="sparkle" size={14} /> Made for better tailoring</span>
            <h2>Every great fit starts with a little care.</h2>
            <p>A thoughtful space for customers, tailors, and shop administrators to stay connected.</p>
            <div className="feature-art" aria-hidden="true">
              <span className="art-orbit art-orbit-one" />
              <span className="art-orbit art-orbit-two" />
              <div className="art-center"><Icon name="scissors" size={64} /></div>
              <span className="art-dot art-dot-one" />
              <span className="art-dot art-dot-two" />
            </div>
          </div>
          <p className="auth-feature-footer">StitchFlow · Crafted for every detail</p>
        </div>
        <div className="auth-panel">
          <div className="auth-mobile-brand"><Brand /></div>
          <div className="auth-card">
            <span className="eyebrow">YOUR STITCHFLOW ACCOUNT</span>
            <h1>{title}</h1>
            <p className="auth-subtitle">{subtitle}</p>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function Login({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginUser(email.trim(), password);
      const account = await getCurrentUser();
      onLogin(account);
      navigate(dashboardPath(account.role), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your StitchFlow workspace.">
      <Notice type="success">{location.state?.notice}</Notice>
      <Notice type="error">{error}</Notice>
      <form className="stack-form" onSubmit={submit}>
        <div className="field-group">
          <label htmlFor="login-email">Email address</label>
          <input id="login-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>
        <PasswordInput id="login-password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        <div className="auth-inline-link"><Link to="/forgot-password">Forgot password?</Link></div>
        <button className="primary-button" disabled={loading} type="submit">{loading ? "Signing in..." : "Sign in"} {!loading && <Icon name="arrow" size={18} />}</button>
      </form>
      <p className="auth-footer">New to StitchFlow? <Link to="/register">Create an account</Link></p>

    </AuthShell>
  );
}


// Public password-recovery pages. The server issues and verifies the tokens.
function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const response = await forgotPassword({ email: email.trim() });
      setSuccess(response.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Forgot your password?" subtitle="Enter your account email and we'll send a secure reset link if an account is registered.">
      <Notice type="error">{error}</Notice>
      <Notice>{success}</Notice>
      <form className="stack-form" onSubmit={submit}>
        <div className="field-group">
          <label htmlFor="recovery-email">Email address</label>
          <input id="recovery-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" maxLength={254} required />
        </div>
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send reset link"} {!loading && <Icon name="mail" size={18} />}
        </button>
      </form>
      <p className="auth-footer"><Link to="/login">Back to sign in</Link></p>
      <p className="auth-helper">Reset links expire after 30 minutes and can only be used once.</p>
    </AuthShell>
  );
}

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await resetPassword({ token, newPassword, confirmPassword });
      setNewPassword("");
      setConfirmPassword("");
      navigate("/login", { replace: true, state: { notice: response.message } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Create a new password" subtitle="Choose a new password for your StitchFlow account.">
      <Notice type="error">{!token ? "This reset link is missing its token. Please request a new email." : error}</Notice>
      {token && (
        <form className="stack-form" onSubmit={submit}>
          <PasswordInput id="reset-new-password" label="New password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" minLength={8} maxLength={72} placeholder="8 to 72 characters" />
          <PasswordInput id="reset-confirm-password" label="Confirm new password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={8} maxLength={72} placeholder="Repeat new password" />
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset password"} {!loading && <Icon name="lock" size={18} />}
          </button>
        </form>
      )}
      <p className="auth-footer"><Link to="/forgot-password">Request another reset link</Link></p>
    </AuthShell>
  );
}

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerCustomer({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate("/login", { replace: true, state: { notice: "Account created! You can now sign in." } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Create an account" subtitle="Get started as a StitchFlow customer.">
      <Notice type="error">{error}</Notice>
      <form className="stack-form" onSubmit={submit}>
        <div className="field-group">
          <label htmlFor="register-name">Full name</label>
          <input id="register-name" name="fullName" autoComplete="name" value={form.fullName} onChange={update} placeholder="Your full name" required />
        </div>
        <div className="field-group">
          <label htmlFor="register-email">Email address</label>
          <input id="register-email" name="email" type="email" autoComplete="email" value={form.email} onChange={update} placeholder="you@example.com" required />
        </div>
        <PasswordInput id="register-password" label="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" placeholder="At least 8 characters" minLength={8} maxLength={72} />
        <button className="primary-button" type="submit" disabled={loading}>{loading ? "Creating account..." : "Create account"} {!loading && <Icon name="arrow" size={18} />}</button>
      </form>
      <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
    </AuthShell>
  );
}

function Protected({ user, role, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={dashboardPath(user.role)} replace />;
  return children;
}

function CreateTailor() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const created = await createTailorAccount({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      setSuccess(`Tailor account created for ${created.fullName} (${created.email}).`);
      setForm({ fullName: "", email: "", password: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="content">
      <div className="page-heading"><span className="eyebrow">TEAM MANAGEMENT</span><h1>Add a tailor</h1><p>Create a staff account with the TAILOR role.</p></div>
      <section className="surface-card form-card">
        <div className="card-heading"><div className="card-icon"><Icon name="users" /></div><div><h2>Staff registration</h2><p>Only administrators can create these accounts.</p></div></div>
        <Notice type="error">{error}</Notice><Notice>{success}</Notice>
        <form className="stack-form" onSubmit={submit}>
          <div className="field-group"><label htmlFor="staff-name">Full name</label><input id="staff-name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Tailor's full name" required /></div>
          <div className="field-group"><label htmlFor="staff-email">Email address</label><input id="staff-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="staff@example.com" required /></div>
          <PasswordInput id="staff-password" label="Initial password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" minLength={8} maxLength={72} />
          <div className="form-actions"><button className="primary-button" type="submit" disabled={loading}>{loading ? "Creating..." : "Create tailor account"}<Icon name="arrow" size={18} /></button></div>
        </form>
      </section>
    </div>
  );
}

function AccountSettings({ user, onUserChange, onSessionEnd }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ fullName: user.fullName, email: user.email });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    let active = true;
    getProfile()
      .then((result) => {
        if (!active) return;
        setProfile({ fullName: result.fullName, email: result.email });
        onUserChange(result);
      })
      .catch((err) => { if (active) setFetchError(err.message); });
    return () => { active = false; };
    // Load the profile from the server when this page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveProfile(event) {
    event.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setLoadingProfile(true);
    try {
      const result = await updateProfile({
        fullName: profile.fullName.trim(),
        email: profile.email.trim(),
      });
      if (result.requiresLogin) {
        onSessionEnd();
        navigate("/login", { replace: true, state: { notice: result.message } });
        return;
      }
      onUserChange(result.profile);
      setProfile({ fullName: result.profile.fullName, email: result.profile.email });
      setProfileSuccess(result.message);
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setLoadingProfile(false);
    }
  }

  async function savePassword(event) {
    event.preventDefault();
    setPasswordError("");
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError("The new passwords do not match.");
      return;
    }
    if (passwords.currentPassword === passwords.newPassword) {
      setPasswordError("Choose a password different from your current one.");
      return;
    }
    setLoadingPassword(true);
    try {
      const result = await changePassword(passwords);
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      onSessionEnd();
      navigate("/login", { replace: true, state: { notice: result.message } });
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setLoadingPassword(false);
    }
  }

  return (
    <div className="content">
      <div className="page-heading"><span className="eyebrow">ACCOUNT SETTINGS</span><h1>Your profile</h1><p>Keep your information up to date and your account secure.</p></div>
      <Notice type="error">{fetchError}</Notice>
      <div className="settings-grid">
        <section className="surface-card form-card">
          <div className="card-heading"><div className="card-icon"><Icon name="user" /></div><div><h2>Personal information</h2><p>Update the details associated with your account.</p></div></div>
          <Notice type="error">{profileError}</Notice><Notice>{profileSuccess}</Notice>
          <form className="stack-form" onSubmit={saveProfile}>
            <div className="field-group"><label htmlFor="profile-name">Full name</label><input id="profile-name" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} minLength={2} maxLength={100} required /></div>
            <div className="field-group"><label htmlFor="profile-email">Email address</label><input id="profile-email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} maxLength={254} required /></div>
            <div className="field-group"><label>Account role</label><div className="readonly-field"><Icon name="check" size={17} /> {roleNames[user.role]}</div></div>
            <div className="help-text">Changing your email will sign you out. Sign in again with the updated address.</div>
            <div className="form-actions"><button className="primary-button" disabled={loadingProfile} type="submit">{loadingProfile ? "Saving..." : "Save changes"}<Icon name="arrow" size={18} /></button></div>
          </form>
        </section>
        <section className="surface-card form-card">
          <div className="card-heading"><div className="card-icon"><Icon name="lock" /></div><div><h2>Change password</h2><p>Verify your current password to set a new one.</p></div></div>
          <Notice type="error">{passwordError}</Notice>
          <form className="stack-form" onSubmit={savePassword}>
            <PasswordInput id="current-password" label="Current password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} autoComplete="current-password" />
            <PasswordInput id="new-password" label="New password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} autoComplete="new-password" placeholder="8 to 72 characters" minLength={8} maxLength={72} />
            <PasswordInput id="confirm-password" label="Confirm new password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} autoComplete="new-password" placeholder="Repeat new password" minLength={8} maxLength={72} />
            <div className="help-text">Your password is securely hashed. You'll need to sign in again after changing it.</div>
            <div className="form-actions"><button className="primary-button" type="submit" disabled={loadingPassword}>{loadingPassword ? "Changing..." : "Change password"}<Icon name="lock" size={17} /></button></div>
          </form>
        </section>
      </div>
    </div>
  );
}

function Dashboard({ user, onLogout, onUserChange }) {
  const navigate = useNavigate();
  const [section, setSection] = useState("dashboard");
  const [serverMessage, setServerMessage] = useState("");
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;
    getRoleDashboard(user.role)
      .then((result) => { if (active) setServerMessage(result.message); })
      .catch((err) => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [user.role]);

  async function handleLogout() {
    setError("");
    setLoggingOut(true);
    try {
      await logoutUser();
      onLogout();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoggingOut(false);
    }
  }

  const firstName = user.fullName.trim().split(/\s+/)[0];
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Brand light />
        <div className="sidebar-divider" />
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          <button className={`nav-item ${section === "dashboard" ? "nav-active" : ""}`} onClick={() => setSection("dashboard")} type="button"><Icon name="home" size={19} /> Dashboard</button>
          <button className={`nav-item ${section === "profile" ? "nav-active" : ""}`} onClick={() => setSection("profile")} type="button"><Icon name="user" size={19} /> My profile</button>
          {user.role === "ADMIN" && <button className={`nav-item ${section === "staff" ? "nav-active" : ""}`} onClick={() => setSection("staff")} type="button"><Icon name="users" size={19} /> Create tailor</button>}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-identity"><div className="sidebar-avatar">{firstName.charAt(0).toUpperCase()}</div><div className="sidebar-identity-text"><strong>{user.fullName}</strong><span>{roleNames[user.role]}</span></div></div>
          <button className="nav-item logout-item" onClick={handleLogout} disabled={loggingOut} type="button"><Icon name="logout" size={19} /> {loggingOut ? "Signing out..." : "Sign out"}</button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar"><span className="breadcrumb">Workspace <span>/</span> {section === "dashboard" ? "Dashboard" : section === "profile" ? "My profile" : "Create tailor"}</span><div className="topbar-right"><span className="role-tag">{roleNames[user.role]}</span><span className="topbar-avatar">{firstName.charAt(0).toUpperCase()}</span></div></header>
        <Notice type="error">{error}</Notice>
        {section === "dashboard" && (
          <div className="content">
            <div className="welcome-banner"><div className="welcome-copy"><span className="eyebrow eyebrow-light">YOUR STITCHFLOW WORKSPACE</span><h1>Welcome back, {firstName}!</h1><p>Your {roleNames[user.role].toLowerCase()} workspace is ready. Everything you need for your account is right here.</p><button type="button" className="light-button" onClick={() => setSection("profile")}>Manage my profile <Icon name="arrow" size={17} /></button></div><div className="welcome-decor" aria-hidden="true"><span className="welcome-circle"/><span className="welcome-line"/><Icon name="scissors" size={72} /></div></div>
            <div className="section-header"><div><span className="eyebrow">QUICK ACCESS</span><h2>What would you like to do?</h2></div></div>
            <div className="action-grid">
              <button type="button" className="action-card" onClick={() => setSection("profile")}><span className="action-icon"><Icon name="user" size={24}/></span><strong>Edit your profile</strong><span>Update your name and email address.</span><span className="action-footer">Open settings <Icon name="arrow" size={17}/></span></button>
              <button type="button" className="action-card" onClick={() => setSection("profile")}><span className="action-icon action-icon-pink"><Icon name="lock" size={24}/></span><strong>Account security</strong><span>Change your password securely.</span><span className="action-footer">Manage password <Icon name="arrow" size={17}/></span></button>
              {user.role === "ADMIN" && <button type="button" className="action-card" onClick={() => setSection("staff")}><span className="action-icon action-icon-gold"><Icon name="users" size={24}/></span><strong>Tailor accounts</strong><span>Create an account for a staff member.</span><span className="action-footer">Add a tailor <Icon name="arrow" size={17}/></span></button>}
            </div>
            <section className="surface-card access-card"><div className="card-icon"><Icon name="check" size={21}/></div><div><h2>Protected dashboard access</h2><p>{serverMessage || "Checking access with the Spring Boot server..."}</p><span className="security-label">Signed in as {roleNames[user.role]}</span></div></section>
          </div>
        )}
        {section === "profile" && <AccountSettings user={user} onUserChange={onUserChange} onSessionEnd={onLogout} />}
        {section === "staff" && user.role === "ADMIN" && <CreateTailor />}
      </div>
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

  if (!ready) return <div className="loading"><Brand /><p>Preparing your workspace...</p></div>;

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? dashboardPath(user.role) : "/login"} replace />} />
      <Route path="/login" element={user ? <Navigate to={dashboardPath(user.role)} replace /> : <Login onLogin={setUser} />} />
      <Route path="/register" element={user ? <Navigate to={dashboardPath(user.role)} replace /> : <Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      {["CUSTOMER", "TAILOR", "ADMIN"].map((role) => (
        <Route key={role} path={dashboardPath(role)} element={<Protected user={user} role={role}><Dashboard user={user} onLogout={() => setUser(null)} onUserChange={setUser} /></Protected>} />
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
