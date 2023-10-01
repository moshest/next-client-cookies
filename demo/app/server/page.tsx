import { getCookies } from 'next-client-cookies/server';

const MyComponent = () => {
  const cookies = getCookies();

  return (
    <div>
      <p>My cookie value: {cookies.get('my-cookie')}</p>
    </div>
  );
};

// eslint-disable-next-line import/no-default-export
export default MyComponent;
