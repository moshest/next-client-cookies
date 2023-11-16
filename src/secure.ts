export interface CookieRecord {
  name: string;
  value: string;
}

declare let global: {
  __COOKIES_STORAGE__?: SecureCookiesMap;
};

type SecureCookiesMap = Map<
  SecureValueRef,
  { value: CookieRecord[]; time: number }
>;

const storage: SecureCookiesMap | null =
  typeof global === 'object'
    ? (global.__COOKIES_STORAGE__ = global.__COOKIES_STORAGE__ || new Map())
    : null;

export type SecureValueRef = number;

export const storeSecureCookies = (secureValue: CookieRecord[]) => {
  let value;
  do {
    value = Math.random();
  } while (storage?.has(value));

  if (storage) {
    storage.set(value, { value: secureValue, time: Date.now() });
    setCleanupTimeout();
  }

  return value;
};

export const useSecureCookies = (
  value: SecureValueRef,
): CookieRecord[] | undefined => storage?.get(value)?.value;

//
// storage cleanup
//

let timeout: NodeJS.Timeout | null = null;

const CLEANUP_TTL_MS = 5e3; // 5 seconds

const setCleanupTimeout = () => {
  if (timeout) {
    return;
  }

  timeout = setTimeout(cleanup, CLEANUP_TTL_MS * 2);
};

const cleanup = () => {
  clearTimeout(timeout!);
  timeout = null;

  if (!storage) return;

  const now = Date.now();

  for (const [key, { time }] of storage.entries()) {
    if (now - time > CLEANUP_TTL_MS) {
      storage.delete(key);
    }
  }

  if (storage.size) {
    setCleanupTimeout();
  }
};
