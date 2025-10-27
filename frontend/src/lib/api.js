export const API_BASE = "https://analytics-endpoints-885186858021.us-central1.run.app";

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || res.statusText || "Request failed");
  return data;
}

export const api = {
  loginEmail: (email, password) => request("/login", { method: "POST", body: { email, password } }),
  register: (payload) => request("/users", { method: "POST", body: payload }),
  meByEmail: (email) => request(`/user?email=${encodeURIComponent(email)}`),
  getUser: (id) => request(`/users/${id}`),
  deleteUser: (id) => request(`/users/${id}`, { method: "DELETE" }),
  updateUser: (id, payload) => request(`/users/${id}`, { method: "PUT", body: payload }),
};