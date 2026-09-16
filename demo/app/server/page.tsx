import { Suspense } from 'react';
import { getCookies } from 'next-client-cookies/server';

const CookieValue = async () => {
  const cookies = await getCookies();

  return <p>My cookie value: {cookies.get('my-cookie')}</p>;
};

const MyComponent = () => (
  <div>
    <Suspense fallback={null}>
      <CookieValue />
    </Suspense>
  </div>
);

// eslint-disable-next-line import/no-default-export
export default MyComponent;
