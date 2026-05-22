const TOKEN_KEY = 'jwt_token';
const USER_ID_KEY = 'user_id';
const USERNAME_KEY = 'username';
const ROLE_KEY = 'role';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY);
}

export function setUserId(id: string): void {
  localStorage.setItem(USER_ID_KEY, id);
}

export function removeUserId(): void {
  localStorage.removeItem(USER_ID_KEY);
}

export function getUsername(): string | null {
  return localStorage.getItem(USERNAME_KEY);
}

export function setUsername(name: string): void {
  localStorage.setItem(USERNAME_KEY, name);
}

export function removeUsername(): void {
  localStorage.removeItem(USERNAME_KEY);
}

export function getRole(): string | null {
  return localStorage.getItem(ROLE_KEY);
}

export function setRole(role: string): void {
  localStorage.setItem(ROLE_KEY, role);
}

export function removeRole(): void {
  localStorage.removeItem(ROLE_KEY);
}

export function clearAuth(): void {
  removeToken();
  removeUserId();
  removeUsername();
  removeRole();
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
