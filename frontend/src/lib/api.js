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
  // auth 
  loginEmail: (email, password) => request("/login", { method: "POST", body: { email, password } }),
  register: (payload) => request("/users", { method: "POST", body: payload }),
  meByEmail: (email) => request(`/user?email=${encodeURIComponent(email)}`),

  // projects
  listProjectsByUser: (userId) => request(`/projects/user/${encodeURIComponent(userId)}`),
  getProject: (projectId) => request(`/projects/${encodeURIComponent(projectId)}`),
  createProject: ({ name, description, user_id }) =>
    request("/projects", { method: "POST", body: { name, description, user_id } }),
  updateProject: (projectId, patch) =>
    request(`/projects/${encodeURIComponent(projectId)}`, { method: "PUT", body: patch }),
  deleteProject: (projectId) =>
    request(`/projects/${encodeURIComponent(projectId)}`, { method: "DELETE" }),

  // conversations
  listConversations: ({ project_id, skip = 0, limit = 100, sort_asc = false }) =>
    request(`/conversations/${encodeURIComponent(project_id)}?skip=${skip}&limit=${limit}&sort_asc=${sort_asc}`),
  createConversation: ({ project_id, role, message }) =>
    request("/conversations", { method: "POST", body: { project_id, role, message } }),
  deleteConversation: (conversation_id) =>
    request(`/conversations/${encodeURIComponent(conversation_id)}`, { method: "DELETE" }),
};