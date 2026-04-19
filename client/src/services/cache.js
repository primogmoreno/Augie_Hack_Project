// services/cache.js
const TTL = 10 * 60 * 1000; // 10 minutes

export function cacheSet(key, data) {
  sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
}

export function cacheGet(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > TTL) return null; // expired
    return data;
  } catch {
    return null;
  }
}

export function cacheDel(...keys) {
  keys.forEach(k => sessionStorage.removeItem(k));
}

export function cacheClearAll() {
  ['accounts', 'transactions', 'summary', 'spending_analysis'].forEach(k =>
    sessionStorage.removeItem(k)
  );
}