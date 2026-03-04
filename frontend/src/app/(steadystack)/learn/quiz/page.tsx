import { Metadata } from 'next';
import { QuizPage } from '@/components/quiz/QuizPage';

export const metadata: Metadata = {
  title: 'Financial Health Quiz for Freelancers',
  description:
    'Take a 2-minute quiz to discover your Financial Persona and get a personalized learning path. Are you a New Freelancer, Cash Flow Builder, Tax Optimizer, or Scale-Ready?',
};

export default function QuizRoute() {
  return <QuizPage />;
}
