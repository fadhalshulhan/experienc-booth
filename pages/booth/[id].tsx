import { GetServerSideProps } from 'next';
import ExperienceBooth from '@/components/ExperienceBooth';

interface BoothPageProps {
  boothId?: string;
}

export default function BoothPage({ boothId }: BoothPageProps) {
  return <ExperienceBooth boothId={boothId} />;
}

export const getServerSideProps: GetServerSideProps<BoothPageProps> = async ({ params }) => {
  const boothParam = params?.id;
  const boothId = Array.isArray(boothParam) ? boothParam[0] : boothParam;

  return {
    props: {
      boothId,
    },
  };
};

