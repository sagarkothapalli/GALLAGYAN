import { Metadata } from 'next';
import { EducationHub } from '@/components/learn/EducationHub';

export const metadata: Metadata = {
  title: 'Learn — Financial Education for Freelancers',
  description:
    'Free guides, calculators, and courses on taxes, cash flow, pricing, and more. Built specifically for freelancers and micro-business owners.',
  openGraph: {
    title: 'Financial Education Hub | SteadyStack',
    description: 'Free guides, calculators, and courses for freelancers.',
  },
};

export default function LearnPage() {
  return <EducationHub />;
}
