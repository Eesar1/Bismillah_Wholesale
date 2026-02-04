const readApiBaseUrl = () => {
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/$/, "");

  if (!apiBaseUrl) {
    throw new Error("Missing VITE_API_BASE_URL. Add it in app/.env.");
  }

  return apiBaseUrl;
};

export const getApiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${readApiBaseUrl()}${normalizedPath}`;
};

export const parseApiError = async (response: Response, fallback: string) => {
  try {
    const data = (await response.json()) as { message?: string };
    if (data?.message) {
      return data.message;
    }
  } catch {
    // Ignore parse failures and use fallback message.
  }

  return fallback;
};
