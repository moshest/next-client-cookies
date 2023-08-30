'use client';

import React, {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { CookieAttributes, Cookies } from './types';
import jsCookies from 'js-cookie';
import { ServerInsertedHTMLContext } from 'next/navigation';
import { ServerInsertedHTMLHook } from 'next/dist/shared/lib/server-inserted-html';

// Context

const Ctx = createContext<Cookies | null>(null);

export const useCookies = (): Cookies => {
  const cookies = useContext(Ctx);

  if (typeof window !== 'undefined') {
    return jsCookies;
  }

  if (!cookies) {
    throw new Error('Missing <CookiesProvider>');
  }

  return cookies;
};

// SSR Provider

interface CookieRecord {
  name: string;
  value: string;
}

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

export const CookiesProvider: FC<{
  value: CookieRecord[];
  children: ReactNode;
}> = ({ value, children }) => {
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

        const prev = map[args[0]];
        map[args[0]] = args[1];

        return prev;
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

  return <Ctx.Provider value={cookies}>{children}</Ctx.Provider>;
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
