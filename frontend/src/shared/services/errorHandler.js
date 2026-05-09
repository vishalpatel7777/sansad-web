/**
 * Normalized error shape used across all features.
 * @typedef {{ message: string, status: number|null, isNetworkError: boolean, isTimeout: boolean }} AppError
 */

/**
 * Converts any thrown value into a consistent AppError object.
 * Feature hooks receive this instead of raw Error instances.
 */
export function normalizeError(err) {
  if (!err) return { message: "Unknown error", status: null, isNetworkError: false, isTimeout: false };

  const isTimeout = err.name === "AbortError" || /timed out/i.test(err.message ?? "");

  return {
    message: err.message ?? String(err),
    status: err.status ?? null,
    isNetworkError: err.isNetworkError ?? isTimeout,
    isTimeout,
  };
}

/**
 * Returns a user-facing message for an AppError.
 * Components can call this instead of inspecting error fields directly.
 */
export function getErrorMessage(error) {
  if (!error) return null;
  if (error.isTimeout) return "Request timed out. Please try again.";
  if (error.isNetworkError) return "Network error. Check your connection.";
  if (error.status === 404) return "Data not found.";
  if (error.status >= 500) return "Server error. Please try again later.";
  return error.message ?? "Something went wrong.";
}
