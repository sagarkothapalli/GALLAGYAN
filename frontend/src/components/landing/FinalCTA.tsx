import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="section-padding">
      <div className="container-narrow">
        <div className="gradient-bg rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl" />

          <div className="relative">
            <h2 className="text-heading-xl md:text-display font-heading mb-4">
              Ready to take control of your freelance finances?
            </h2>
            <p className="text-body-lg text-gray-300 mb-8 max-w-xl mx-auto">
              Join thousands of freelancers who stopped guessing and started growing.
              Free plan, no credit card, 5 minutes to set up.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register" className="btn-primary text-lg !px-8 !py-4 w-full sm:w-auto">
                Start free — takes 5 minutes
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link href="/learn/quiz" className="btn-ghost !text-gray-300 hover:!text-white hover:!bg-white/10 w-full sm:w-auto">
                Take the Financial Health Quiz
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
