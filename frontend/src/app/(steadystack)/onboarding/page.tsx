import { Metadata } from 'next';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';

export const metadata: Metadata = {
  title: 'Welcome — Set Up Your Account',
  description: 'Set up your SteadyStack account in 5 easy steps.',
};

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
