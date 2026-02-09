import { ReportOutlineItem } from './ReportOutlineItem';
import { ConfidenceScore } from './ConfidenceScore';

interface OutlineSection {
  icon: string;
  label: string;
  isActive?: boolean;
  isLocked?: boolean;
}

interface ReportOutlineProps {
  sections: OutlineSection[];
  confidenceScore: number;
  dataPoints: number;
}

export function ReportOutline({
  sections,
  confidenceScore,
  dataPoints,
}: ReportOutlineProps) {
  return (
    <div className="lg:col-span-1">
      <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-4 px-1">
        Report Outline
      </h3>
      <div className="space-y-1">
        {sections.map((section, index) => (
          <ReportOutlineItem
            key={index}
            icon={section.icon}
            label={section.label}
            isActive={section.isActive}
            isLocked={section.isLocked}
          />
        ))}
      </div>
      <ConfidenceScore score={confidenceScore} dataPoints={dataPoints} />
    </div>
  );
}
