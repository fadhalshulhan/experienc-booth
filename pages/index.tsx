import Head from 'next/head';
import BoothSelector from '@/components/BoothSelector';
import PasswordProtection from '@/components/PasswordProtection';

export default function IndexPage() {
  return (
    <PasswordProtection>
      <Head>
        <title>Experience Booth Cekat Innova</title>
        <link rel="icon" href="/logos/cekat.png" />
      </Head>
      <BoothSelector />
    </PasswordProtection>
  );
}
