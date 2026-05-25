import { zhCN } from '../data/translations';
import type { StrategyMode } from '../types/domain';

const modes: StrategyMode[] = ['safe', 'aggressive', 'pro', 'ladder', 'balanced'];

interface Props {
  value: StrategyMode;
  onChange: (value: StrategyMode) => void;
}

export function StrategyToggle({ value, onChange }: Props) {
  return (
    <div className="flex rounded-md border border-white/10 bg-white/[0.04] p-1">
      {modes.map((mode) => (
        <button
          key={mode}
          className={`rounded px-3 py-2 text-xs font-semibold transition ${
            value === mode ? 'bg-neon text-slate-950 shadow-glow' : 'text-slate-300 hover:bg-white/10'
          }`}
          onClick={() => onChange(mode)}
        >
          {zhCN.strategy[mode]}
        </button>
      ))}
    </div>
  );
}
