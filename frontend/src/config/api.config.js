// Centralized API configuration.
// All API-related constants live here; import from this file, not from utils/api.js directly.

export const API_BASE_URL = "/api";

// Hardcoded key — move to .env (VITE_API_KEY) if this ever becomes sensitive
export const API_KEY = import.meta.env.VITE_API_KEY ?? "321";

// Timeout in ms for fetch requests (not yet wired — placeholder for future use)
export const API_TIMEOUT_MS = 15_000;
