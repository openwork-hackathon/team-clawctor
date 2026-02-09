type RiskLevel = 'high' | 'medium' | 'low';

interface RiskSummaryCardProps {
  level: RiskLevel;
  count: number;
  description: string;
}

const riskConfig = {
  high: {
    label: 'High Risk',
    icon: 'error',
    borderColor: 'border-l-red-500',
    iconColor: 'text-red-500',
    descriptionColor: 'text-red-600 dark:text-red-400',
  },
  medium: {
    label: 'Medium Risk',
    icon: 'warning',
    borderColor: 'border-l-amber-500',
    iconColor: 'text-amber-500',
    descriptionColor: 'text-amber-600 dark:text-amber-400',
  },
  low: {
    label: 'Low Risk',
    icon: 'check_circle',
    borderColor: 'border-l-emerald-500',
    iconColor: 'text-emerald-500',
    descriptionColor: 'text-emerald-600 dark:text-emerald-400',
  },
};

export function RiskSummaryCard({ level, count, description }: RiskSummaryCardProps) {
  const config = riskConfig[level];
  const formattedCount = count.toString().padStart(2, '0');

  return (
    <div
      className={`flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border-l-4 ${config.borderColor} shadow-sm border-y border-r border-slate-200 dark:border-slate-800`}
    >
      <div className="flex items-center justify-between">
        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">
          {config.label}
        </p>
        <span className={`material-symbols-outlined ${config.iconColor}`}>
          {config.icon}
        </span>
      </div>
      <p className="text-slate-900 dark:text-white text-4xl font-extrabold">
        {formattedCount}
      </p>
      <p className={`text-xs ${config.descriptionColor} mt-1`}>{description}</p>
    </div>
  );
}
