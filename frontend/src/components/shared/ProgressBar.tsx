'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'teal' | 'blue' | 'amber' | 'purple';
  className?: string;
}

const colorMap = {
  teal: 'bg-teal-500',
  blue: 'bg-blue-500',
  amber: 'bg-amber-500',
  purple: 'bg-purple-500',
};

const sizeMap = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = true,
  size = 'md',
  color = 'teal',
  className,
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={className}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-body-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>}
          {showPercent && <span className="text-body-sm font-medium text-gray-500">{Math.round(percent)}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-gray-200 dark:bg-navy-700 rounded-full overflow-hidden', sizeMap[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', colorMap[color])}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        />
      </div>
    </div>
  );
}
