type AttemptEntry = {
  count: number;
  expiresAt: number;
};

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const store = new Map<string, AttemptEntry>();

export function registerAttempt(key: string, now = Date.now()) {
  const current = store.get(key);

  if (!current || current.expiresAt < now) {
    store.set(key, {
      count: 1,
      expiresAt: now + WINDOW_MS
    });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  current.count += 1;
  store.set(key, current);

  return {
    allowed: current.count <= MAX_ATTEMPTS,
    remaining: Math.max(MAX_ATTEMPTS - current.count, 0)
  };
}

export function resetAttempts(key: string) {
  store.delete(key);
}
