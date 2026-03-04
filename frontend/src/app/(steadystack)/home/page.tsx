import { Metadata } from 'next';
import { Hero } from '@/components/landing/Hero';
import { SocialProof } from '@/components/landing/SocialProof';
import { Features } from '@/components/landing/Features';
import { EducationTeaser } from '@/components/landing/EducationTeaser';
import { CalculatorPreview } from '@/components/landing/CalculatorPreview';
import { PricingPreview } from '@/components/landing/PricingPreview';
import { FinalCTA } from '@/components/landing/FinalCTA';

export const metadata: Metadata = {
  title: 'SteadyStack — Stop Overpaying Taxes. Start Getting Paid on Time.',
  description:
    'Financial tools built for how freelancers actually work. Tax calculators, income smoothing, education, and banking — all in one place.',
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <SocialProof />
      <Features />
      <EducationTeaser />
      <CalculatorPreview />
      <PricingPreview />
      <FinalCTA />
    </>
  );
}
