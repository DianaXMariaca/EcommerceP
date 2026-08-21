import { getToken } from "./auth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export async function apiFetch(path: string, options?: RequestInit) {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error ?? `Request failed: ${res.status}`);
  }

  return data;
}
