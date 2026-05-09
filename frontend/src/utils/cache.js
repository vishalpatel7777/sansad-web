import { CACHE_TTL_MS } from "@/shared/constants";

const inflightRequests = new Map();

export function setSessionCache(key, data, ttl = CACHE_TTL_MS) {
  const item = { value: data, expiry: Date.now() + ttl };
  try {
    sessionStorage.setItem(key, JSON.stringify(item));
  } catch (e) {
    console.warn(`Cache write failed for ${key}:`, e);
  }
}

export function getSessionCache(key) {
  try {
    const itemStr = sessionStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);

    if (Date.now() > item.expiry) {
      sessionStorage.removeItem(key);
      return null;
    }

    return item.value;
  } catch (e) {
    console.warn(`Cache read failed for ${key}:`, e);
    return null;
  }
}

export async function cachedAsync(key, asyncFn, ttl) {
  const cached = getSessionCache(key);
  if (cached) return cached;

  if (inflightRequests.has(key)) {
    return inflightRequests.get(key);
  }

  const requestPromise = (async () => {
    try {
      const result = await asyncFn();
      if (result) setSessionCache(key, result, ttl);
      return result;
    } catch (err) {
      console.error(`Async cache operation failed for ${key}:`, err);
      throw err;
    } finally {
      inflightRequests.delete(key);
    }
  })();

  inflightRequests.set(key, requestPromise);
  return requestPromise;
}

export function clearCache(key) {
  sessionStorage.removeItem(key);
  inflightRequests.delete(key);
}
