import { api } from "./api";

export interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  is_station_master?: boolean;
}

export async function login(email: string, password: string): Promise<string> {
  const res = await api.post("/accounts/api/auth/backoffice-login/", { email, password });
  const token = res.data?.access ?? res.data?.tokens?.access;
  const user = res.data?.user as AdminUser | undefined;
  if (!token) throw new Error("No token in response");
  if (!user?.is_staff && !user?.is_superuser) {
    throw new Error("Super admin access required");
  }
  localStorage.setItem("sa_token", token);
  return token;
}

export function logout() {
  localStorage.removeItem("sa_token");
}

export function isAuthenticated(): boolean {
  return Boolean(localStorage.getItem("sa_token"));
}

export async function getCurrentUser(): Promise<AdminUser> {
  const res = await api.get("/api/auth/me/");
  return res.data;
}
