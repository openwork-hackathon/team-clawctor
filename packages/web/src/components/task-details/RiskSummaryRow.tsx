import { RiskSummaryCard } from './RiskSummaryCard';

interface RiskData {
  high: { count: number; description: string };
  medium: { count: number; description: string };
  low: { count: number; description: string };
}

interface RiskSummaryRowProps {
  data: RiskData;
}

export function RiskSummaryRow({ data }: RiskSummaryRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <RiskSummaryCard
        level="high"
        count={data.high.count}
        description={data.high.description}
      />
      <RiskSummaryCard
        level="medium"
        count={data.medium.count}
        description={data.medium.description}
      />
      <RiskSummaryCard
        level="low"
        count={data.low.count}
        description={data.low.description}
      />
    </div>
  );
}
