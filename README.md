# Next.js Client Cookies

Client cookies with support for SSR on the newest Next.js 13 (app directory).

SSR are **client components** that can be render both on the client and server side. Server components are **server only** components that can only be render on the server side. This library can support all 3 cases and will give you everything you need to work with cookies on the client and server side.

Interface and client side implementation based on [js-cookie](https://www.npmjs.com/package/js-cookie).

## Install

1. Install the package:

```
yarn add next-client-cookies
```

2. Create a `client only` component provider:

```jsx
'use client';

import { CookiesProvider } from 'next-client-cookies';

export const ClientCookiesProvider: typeof Provider = (props) => (
  <Provider {...props} />
);
```

3. On your `app/layout.tsx` file, add the `CookiesProvider`:

```jsx
import { cookies } from 'next/headers';
import { ClientCookiesProvider } from './provider';

export default function RootLayout({ children }) {
  return (
    <ClientCookiesProvider value={cookies().getAll()}>
      {children}
    </ClientCookiesProvider>
  );
}
```

## Usage

### Within a client side component

This will work both on the client and server side for SSR.

```jsx
'use client';

import { useCookies } from 'next-client-cookies';

const MyComponent = () => {
  const cookies = useCookies();

  return (
    <div>
      <p>My cookie value: {cookies.get('my-cookie')}</p>

      <button onClick={() => cookies.set('my-cookie', 'my-value')}>
        Set cookie
      </button>
      {' | '}
      <button onClick={() => cookies.delete('my-cookie')}>Delete cookie</button>
    </div>
  );
};
```

### Within a server only component

Will produce the same `Cookies` interfaces using Next.js's `cookies()` helper.

```jsx
import { getCookies } from 'next-client-cookies/server';

const MyComponent = () => {
  const cookies = useCookies();

  return (
    <div>
      <p>My cookie value: {cookies.get('my-cookie')}</p>
    </div>
  );
};
```

Next.js currently [does NOT support](https://nextjs.org/docs/app/api-reference/functions/cookies) update cookies on the server component (only on Actions or Routes). If you need to update cookies on the server please switch to a client component which will be render ALSO on the server.

## License

MIT
