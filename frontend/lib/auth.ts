export type UserRole = "student" | "teacher"

export const AUTH_STORAGE_KEYS = {
  token: "auth_token",
  role: "auth_role",
  name: "auth_name",
} as const

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000"
}

export function setAuthSession(token: string, role: UserRole, name: string) {
  localStorage.setItem(AUTH_STORAGE_KEYS.token, token)
  localStorage.setItem(AUTH_STORAGE_KEYS.role, role)
  localStorage.setItem(AUTH_STORAGE_KEYS.name, name)
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEYS.token)
  localStorage.removeItem(AUTH_STORAGE_KEYS.role)
  localStorage.removeItem(AUTH_STORAGE_KEYS.name)
}

export function getStoredToken() {
  return localStorage.getItem(AUTH_STORAGE_KEYS.token)
}

export function getStoredRole() {
  const role = localStorage.getItem(AUTH_STORAGE_KEYS.role)
  if (role === "student" || role === "teacher") {
    return role
  }
  return null
}

export function getAuthHeaders() {
  const token = getStoredToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}
