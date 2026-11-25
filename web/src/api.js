const API_URL = "http://localhost:8080";

async function readResponse(response) {
  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Incorrect login information or your session has expired.");
    }
    if (response.status === 403) {
      throw new Error("Access denied. Please refresh the page and try again.");
    }
    if (response.status === 409) {
      throw new Error(data.detail || "That email address is already registered.");
    }

    throw new Error(
      data.detail || data.message || data.error || "Something went wrong. Please try again."
    );
  }

  return data;
}

async function getCsrf() {
  const response = await fetch(`${API_URL}/api/auth/csrf`, {
    credentials: "include",
  });
  return readResponse(response);
}

async function writeJson(path, method, values) {
  const csrf = await getCsrf();
  const response = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      [csrf.headerName]: csrf.token,
    },
    body: JSON.stringify(values),
  });
  return readResponse(response);
}

export function registerCustomer(values) {
  return writeJson("/api/auth/register", "POST", values);
}

export async function loginUser(email, password) {
  const csrf = await getCsrf();
  const form = new URLSearchParams();
  form.set("email", email);
  form.set("password", password);

  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      [csrf.headerName]: csrf.token,
    },
    body: form.toString(),
  });
  return readResponse(response);
}

export async function getCurrentUser() {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    credentials: "include",
  });
  return readResponse(response);
}

export async function logoutUser() {
  const csrf = await getCsrf();
  const response = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: { [csrf.headerName]: csrf.token },
  });
  return readResponse(response);
}

export async function getRoleDashboard(role) {
  const paths = {
    CUSTOMER: "/api/customer/dashboard",
    TAILOR: "/api/tailor/dashboard",
    ADMIN: "/api/admin/dashboard",
  };

  if (!paths[role]) {
    throw new Error("Unknown account role.");
  }

  const response = await fetch(`${API_URL}${paths[role]}`, {
    credentials: "include",
  });
  return readResponse(response);
}

export function createTailorAccount(values) {
  return writeJson("/api/admin/staff", "POST", values);
}

// Increment 2: These routes require an authenticated session.
export async function getProfile() {
  const response = await fetch(`${API_URL}/api/profile`, {
    credentials: "include",
  });
  return readResponse(response);
}

export function updateProfile(values) {
  return writeJson("/api/profile", "PUT", values);
}

export function changePassword(values) {
  return writeJson("/api/profile/change-password", "POST", values);
}

// Public, CSRF-protected password recovery endpoints.
export function forgotPassword(values) {
  return writeJson("/api/auth/forgot-password", "POST", values);
}

export function resetPassword(values) {
  return writeJson("/api/auth/reset-password", "POST", values);
}
