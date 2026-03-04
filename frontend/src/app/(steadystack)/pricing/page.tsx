import { Metadata } from 'next';
import { PricingPage } from '@/components/pricing/PricingPage';

export const metadata: Metadata = {
  title: 'Pricing — Plans for Every Stage of Your Freelance Journey',
  description:
    'Start free with basic tools and education. Upgrade to Pro or Premium for unlimited access, personalized coaching, and advanced financial tools.',
};

export default function PricingRoute() {
  return <PricingPage />;
}
