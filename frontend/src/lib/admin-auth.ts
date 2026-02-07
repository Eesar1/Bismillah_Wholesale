import { getApiUrl, parseApiError } from "@/lib/api";

const ADMIN_TOKEN_KEY = "bismillah_admin_token";

export const getAdminToken = () => {
  return window.localStorage.getItem(ADMIN_TOKEN_KEY);
};

export const setAdminToken = (token: string) => {
  window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

export const clearAdminToken = () => {
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
};

export const loginAdmin = async (email: string, password: string) => {
  const response = await fetch(getApiUrl("/api/admin/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to login.");
    throw new Error(message);
  }

  return (await response.json()) as { token: string };
};
