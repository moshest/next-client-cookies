import { useContext, useMemo, useState } from 'react';
import { Cookies } from './types';
import jsCookies from 'js-cookie';
import { Ctx } from './context';

export const useCookies = (): Cookies => {
  const ctx = useContext(Ctx);
  const [, refresh] = useState(0);

  return useMemo((): Cookies => {
    const org = typeof window === 'undefined' ? ctx : jsCookies;

    if (!org) {
      throw new Error(
        'Missing `<CookiesProvider>` from "next-client-cookies/server"',
      );
    }

    return {
      get: org.get.bind(org),

      set: (...args) => {
        org.set(...args);
        refresh((v) => v + 1);
      },

      remove: (...args) => {
        org.remove(...args);
        refresh((v) => v + 1);
      },
    };
  }, [ctx]);
};
