import { API_BASE_URL, API_KEY, API_TIMEOUT_MS } from "@/config/api.config";

const DEFAULT_HEADERS = {
  accept: "application/json",
  "x-api-key": API_KEY,
};

/**
 * Normalized error shape produced by all failed requests.
 * @typedef {{ message: string, status: number|null, isNetworkError: boolean }} HttpError
 */

/**
 * Core HTTP GET. Throws an HttpError-shaped object on failure.
 * All feature API modules should call this instead of raw fetch.
 */
export async function httpGet(endpoint) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: DEFAULT_HEADERS,
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}: ${res.statusText}`);
      err.status = res.status;
      err.isNetworkError = false;
      throw err;
    }

    return await res.json();
  } catch (err) {
    if (err.name === "AbortError") {
      const timeout = new Error(`Request timed out after ${API_TIMEOUT_MS}ms: ${endpoint}`);
      timeout.status = null;
      timeout.isNetworkError = true;
      throw timeout;
    }
    // Re-throw structured errors from above; wrap bare network errors
    if (err.status !== undefined) throw err;
    const network = new Error(`Network error: ${err.message}`);
    network.status = null;
    network.isNetworkError = true;
    throw network;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const getProxyImageUrl = (url) => {
  if (!url) return "";
  if (!url.startsWith("http://") && !url.startsWith("https://")) return url;
  return `${API_BASE_URL}/proxy/image?url=${encodeURIComponent(url)}`;
};
