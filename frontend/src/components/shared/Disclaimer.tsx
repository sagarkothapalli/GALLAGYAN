import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface DisclaimerProps {
  variant?: 'inline' | 'banner' | 'footer';
  className?: string;
}

export function Disclaimer({ variant = 'footer', className }: DisclaimerProps) {
  if (variant === 'banner') {
    return (
      <div className={cn('bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4', className)}>
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-body-sm font-medium text-amber-800 dark:text-amber-300 mb-1">Educational Content Only</p>
            <p className="text-caption text-amber-700 dark:text-amber-400">
              This content is for informational purposes only and does not constitute financial, tax, or legal advice.
              Consult a qualified professional for advice specific to your situation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <p className={cn('text-caption text-gray-400 dark:text-gray-500 italic', className)}>
        For educational purposes only. Not financial advice. Consult a CPA for your specific situation.
      </p>
    );
  }

  return (
    <div className={cn('border-t border-gray-200 dark:border-navy-700 pt-6 mt-8', className)}>
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
        <p className="text-caption text-gray-400 dark:text-gray-500">
          <strong>Disclaimer:</strong> The information provided on this page is for general educational and informational
          purposes only. It does not constitute personalized financial, tax, legal, or investment advice. All calculations
          are estimates based on simplified tax models and may not reflect your actual tax liability. Tax laws change
          frequently and vary by jurisdiction. Always consult with a qualified CPA, tax advisor, or financial professional
          before making financial decisions. SteadyStack is not a registered financial advisor.
        </p>
      </div>
    </div>
  );
}
