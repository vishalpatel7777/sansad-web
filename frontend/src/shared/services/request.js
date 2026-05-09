import { useEffect, useState } from "react";
import { cachedAsync } from "@utils/cache";
import { normalizeError } from "./errorHandler";

/**
 * Wraps an async loader in the session cache and returns a promise.
 * This is the standard way feature preload functions should be written.
 *
 * @param {string} cacheKey
 * @param {() => Promise<unknown>} loader
 * @returns {Promise<unknown>}
 */
export function cachedRequest(cacheKey, loader) {
  return cachedAsync(cacheKey, loader);
}

/**
 * React hook that executes a preload function and tracks { data, loading, error }.
 * Features that need a simple "fetch once on mount" pattern can use this instead
 * of writing their own useEffect boilerplate.
 *
 * @param {() => Promise<unknown>} preload - async function that returns the data
 * @param {unknown[]} deps - dependency array (re-fetches when these change)
 * @returns {{ data: unknown, loading: boolean, error: import('./errorHandler').AppError|null }}
 */
export function useRequest(preload, deps) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const result = await preload();
        if (isActive) setData(result);
      } catch (err) {
        if (isActive) {
          setError(normalizeError(err));
          setData(null);
        }
      } finally {
        if (isActive) setLoading(false);
      }
    }

    run();

    return () => { isActive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
