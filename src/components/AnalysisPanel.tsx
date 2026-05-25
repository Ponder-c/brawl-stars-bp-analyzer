import { Activity, AlertTriangle, Route } from 'lucide-react';
import type { ReactNode } from 'react';
import { translateReason, zhCN } from '../data/translations';
import type { TeamAnalysis } from '../types/domain';

interface Props {
  analysis: TeamAnalysis;
}

export function AnalysisPanel({ analysis }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <AnalysisCard icon={<Activity size={16} />} title={zhCN.ui.strengths} items={analysis.strengths} tone="emerald" />
      <AnalysisCard icon={<AlertTriangle size={16} />} title={zhCN.ui.risks} items={analysis.risks} tone="rose" />
      <AnalysisCard icon={<Route size={16} />} title={zhCN.ui.counterPlan} items={analysis.counterPlan} tone="cyan" />
    </div>
  );
}

function AnalysisCard({ icon, title, items, tone }: { icon: ReactNode; title: string; items: string[]; tone: 'emerald' | 'rose' | 'cyan' }) {
  const toneClass = {
    emerald: 'border-emerald-300/20 text-emerald-200',
    rose: 'border-danger/25 text-rose-100',
    cyan: 'border-neon/25 text-neon'
  }[tone];

  return (
    <div className={`rounded-lg border bg-white/[0.035] p-3 ${toneClass}`}>
      <div className="mb-2 flex items-center gap-2 text-xs font-black">
        {icon}
        {title}
      </div>
      <div className="space-y-2">
        {items.slice(0, 3).map((item) => (
          <div key={item} className="rounded border border-white/10 bg-black/20 px-2 py-2 text-xs leading-5 text-slate-200">
            {translateReason(item)}
          </div>
        ))}
      </div>
    </div>
  );
}
