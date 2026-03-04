import { Metadata } from 'next';
import { CalculatorsPage } from '@/components/calculators/CalculatorsPage';

export const metadata: Metadata = {
  title: 'Free Financial Calculators for Freelancers',
  description:
    'Estimate your quarterly taxes, calculate your ideal hourly rate, and plan your emergency fund with free interactive calculators built for freelancers.',
};

export default function CalculatorsRoute() {
  return <CalculatorsPage />;
}
