
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
    throw new Error(
      response.status === 401
        ? "Invalid credentials or session expired."
        : response.status === 403
          ? "You do not have permission to access this page."
          : data.detail || data.message || data.error ||
            "Request failed."
    );
  }

  return data;
}

async function getCsrf() {
  const response = await fetch(`${API_URL}/api/auth/csrf`, {
    credentials: "include"
  });

  return readResponse(response);
}

export async function registerCustomer(values) {
  const csrf = await getCsrf();

  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      [csrf.headerName]: csrf.token
    },
    body: JSON.stringify(values)
  });

  return readResponse(response);
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
      [csrf.headerName]: csrf.token
    },
    body: form.toString()
  });

  return readResponse(response);
}

export async function getCurrentUser() {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    credentials: "include"
  });

  return readResponse(response);
}

export async function logoutUser() {
  const csrf = await getCsrf();

  const response = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: {
      [csrf.headerName]: csrf.token
    }
  });

  return readResponse(response);
}

export async function getRoleDashboard(role) {
  const paths = {
    CUSTOMER: "/api/customer/dashboard",
    TAILOR: "/api/tailor/dashboard",
    ADMIN: "/api/admin/dashboard"
  };

  if (!paths[role]) {
    throw new Error("Invalid user role.");
  }

  const response = await fetch(
    `${API_URL}${paths[role]}`,
    { credentials: "include" }
  );

  return readResponse(response);
}
