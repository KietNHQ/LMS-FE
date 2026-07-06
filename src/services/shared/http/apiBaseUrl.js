const LOCAL_API_URL_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?\/api\/v1\/?$/i;

export const getApiBaseUrl = () => {
  const rawApiBaseUrl = import.meta.env.VITE_API_URL || "/api/v1";

  if (import.meta.env.PROD && LOCAL_API_URL_PATTERN.test(rawApiBaseUrl)) {
    return "/api/v1";
  }

  return rawApiBaseUrl;
};

export const getSocketBaseUrl = () => {
  const apiUrl = getApiBaseUrl();

  if (apiUrl.startsWith("/")) {
    return window.location.origin;
  }

  return apiUrl.replace(/\/api\/v1\/?$/i, "");
};
