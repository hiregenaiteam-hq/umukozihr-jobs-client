const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "An error occurred" }));
    throw new Error(error.detail || "An error occurred");
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, token?: string) =>
    fetchApi<T>(endpoint, { method: "GET", token }),

  post: <T>(endpoint: string, data: unknown, token?: string) =>
    fetchApi<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  patch: <T>(endpoint: string, data: unknown, token?: string) =>
    fetchApi<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
      token,
    }),

  delete: <T>(endpoint: string, token?: string) =>
    fetchApi<T>(endpoint, { method: "DELETE", token }),
};
