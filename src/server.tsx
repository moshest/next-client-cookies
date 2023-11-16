import { cookies } from 'next/headers';
import { CookieAttributes, Cookies } from './types';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import React, { FC, ReactNode } from 'react';
import { SecureCookiesProvider } from './provider';
import { storeSecureCookies } from './secure';

export const CookiesProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const secretValue = cookies().getAll();

  return (
    <SecureCookiesProvider value={storeSecureCookies(secretValue)}>
      {children}
    </SecureCookiesProvider>
  );
};

export const getCookies = (): Cookies => {
  const org = cookies();

  return {
    get: (name?: string) =>
      (name == null
        ? Object.fromEntries(org.getAll().map((c) => [c.name, c.value]))
        : org.get(name)?.value) as never,

    set: (name, value, options) => {
      const pre = org.get(name)?.value;
      org.set(name, value, options && convertCookieAttributes(options));
      return pre;
    },

    remove: (name) => org.delete(name),
  };
};

const convertCookieAttributes = (
  options: CookieAttributes,
): Partial<ResponseCookie> => ({
  expires:
    typeof options.expires === 'number'
      ? options.expires * 864e5
      : options.expires,
  path: options.path,
  domain: options.domain,
  secure: options.secure,
  sameSite: options.sameSite?.toLowerCase() as
    | 'strict'
    | 'lax'
    | 'none'
    | undefined,
});
