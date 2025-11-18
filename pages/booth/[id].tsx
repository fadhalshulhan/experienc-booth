import { GetServerSideProps } from 'next';
import ExperienceBooth from '@/components/ExperienceBooth';
import PasswordProtection from '@/components/PasswordProtection';
import { isValidBoothId } from '@/config/booths';

interface BoothPageProps {
  boothId: string;
}

export default function BoothPage({ boothId }: BoothPageProps) {
  return (
    <PasswordProtection>
      <ExperienceBooth boothId={boothId} />
    </PasswordProtection>
  );
}

export const getServerSideProps: GetServerSideProps<BoothPageProps> = async ({ params }) => {
  const boothParam = params?.id;
  const boothId = Array.isArray(boothParam) ? boothParam[0] : boothParam;

  // Redirect to home page if booth ID is invalid
  if (!isValidBoothId(boothId)) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      boothId,
    },
  };
};

