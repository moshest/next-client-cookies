'use client';

import React, { FC, ReactNode, useContext, useEffect, useMemo } from 'react';
import { CookieAttributes, Cookies } from './types';
import jsCookies from 'js-cookie';
import { ServerInsertedHTMLContext } from 'next/navigation';
import { ServerInsertedHTMLHook } from 'next/dist/shared/lib/server-inserted-html.shared-runtime';
import { Ctx } from './context';
import { CookieRecord, SecureValueRef, useSecureCookies } from './secure';

type CookieCommand = {
  [key in keyof Cookies]: [key, ...Parameters<Cookies[key]>];
}['set' | 'remove'];

type SerializedValue<T> = {
  [K in keyof T]: Date extends T[K]
    ? string
    : object extends T[K]
      ? SerializedValue<T[K]>
      : T[K];
};

const windowVarName = '__cookies_commands';

declare global {
  interface Window {
    [windowVarName]: SerializedValue<CookieCommand>[];
  }
}

/**
 * @deprecated Use `<CookiesProvider />` from `next-client-cookies/server` instead.
 */
export const CookiesProvider: FC<{
  value: CookieRecord[];
  children: ReactNode;
}> = ({ value, children }) => {
  const cookies = useCookieRecords(value);

  return <Ctx.Provider value={cookies}>{children}</Ctx.Provider>;
};

const EMPTY_COOKIES: CookieRecord[] = [];

export const SecureCookiesProvider: FC<{
  value: SecureValueRef;
  children: ReactNode;
}> = ({ value, children }) => {
  // `<CookiesProvider>` (server) stashes the cookie records in a process-wide
  // map and only passes a reference here, so the values never reach the RSC
  // payload. That lookup can miss when this component renders somewhere that
  // does not share the map with the server component - e.g. the Next.js dev
  // `instant` validator worker thread - or after the entry expired. Degrade to
  // an empty cookie set instead of reporting a missing provider.
  const secureValue = useSecureCookies(value) ?? EMPTY_COOKIES;
  const cookies = useCookieRecords(secureValue);

  return <Ctx.Provider value={cookies}>{children}</Ctx.Provider>;
};

const useCookieRecords = (value: CookieRecord[]): Cookies => {
  const insertedHTML = useContext<ServerInsertedHTMLHook | null>(
    ServerInsertedHTMLContext as never,
  );

  const cookies = useMemo((): Cookies => {
    const map: Partial<Record<string, string>> = Object.fromEntries(
      value.map((c) => [c.name, c.value]),
    );

    return {
      get: (name?: string) => (name == null ? { ...map } : map[name]) as never,
      set: (...args) => {
        insertedHTML?.(() => getCookieCommandHtml('set', ...args));
        map[args[0]] = args[1];
      },
      remove: (...args) => {
        insertedHTML?.(() => getCookieCommandHtml('remove', ...args));
        delete map[args[0]];
      },
    };
  }, [value, insertedHTML]);

  useEffect(() => {
    const commands = window[windowVarName] || [];
    if (!commands.length) return;

    for (const command of commands) {
      runCookieCommand(command);
    }
  }, []);

  return cookies;
};

const getCookieCommandHtml = (...command: CookieCommand) => (
  <script
    dangerouslySetInnerHTML={{
      __html: `window.${windowVarName} = window.${windowVarName} || [];window.${windowVarName}.push(${JSON.stringify(
        command,
      ).replaceAll('</', '<\\/')});`,
    }}
  />
);

const runCookieCommand = (command: SerializedValue<CookieCommand>) => {
  if (typeof window === 'undefined') return;

  switch (command[0]) {
    case 'set': {
      jsCookies.set(
        command[1],
        command[2],
        command[3] && deserializeCookieAttributes(command[3]),
      );
      break;
    }

    case 'remove': {
      jsCookies.remove(
        command[1],
        command[2] && deserializeCookieAttributes(command[2]),
      );
      break;
    }
  }
};

const deserializeCookieAttributes = (
  attributes: SerializedValue<CookieAttributes>,
): CookieAttributes => ({
  ...attributes,
  expires:
    typeof attributes.expires === 'string'
      ? new Date(attributes.expires)
      : attributes.expires,
});
