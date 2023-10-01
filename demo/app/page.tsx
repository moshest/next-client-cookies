import Link from 'next/link';

const Home = () => (
  <main className="flex flex-col space-y-4 mx-auto w-40 my-10">
    <Link href="/client">Client component</Link>
    <Link href="/server">Server component</Link>
  </main>
);

// eslint-disable-next-line import/no-default-export
export default Home;
