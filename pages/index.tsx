import Head from 'next/head';
import BoothSelector from '@/components/BoothSelector';

export default function IndexPage() {
  return (
    <>
      <Head>
        <title>Experience Booth Cekat Innova</title>
        <link rel="icon" href="/logos/cekat.png" />
      </Head>
      <BoothSelector />
    </>
  );
}
