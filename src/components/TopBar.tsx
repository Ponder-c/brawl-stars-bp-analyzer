import { Search, SlidersHorizontal, Zap } from 'lucide-react';
import { zhCN } from '../data/translations';
import type { StrategyMode } from '../types/domain';
import { StrategyToggle } from './StrategyToggle';

interface Props {
  currentVersion: string;
  dataUpdatedAt: string;
  search: string;
  onSearchChange: (value: string) => void;
  strategyMode: StrategyMode;
  onStrategyChange: (mode: StrategyMode) => void;
  considerMeta: boolean;
  onConsiderMetaChange: (value: boolean) => void;
}

export function TopBar({ currentVersion, dataUpdatedAt, search, onSearchChange, strategyMode, onStrategyChange, considerMeta, onConsiderMetaChange }: Props) {
  return (
    <header className="panel scanline flex items-center justify-between gap-4 rounded-lg px-5 py-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-md border border-neon/30 bg-neon/10 text-neon shadow-glow">
          <Zap size={24} />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-normal text-ink">荒野乱斗 BP 分析器</h1>
          <div className="mt-1 flex gap-3 text-xs text-muted">
            <span>{zhCN.ui.currentVersion} {currentVersion}</span>
            <span>{zhCN.ui.dataUpdated} {dataUpdatedAt}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <label className="flex h-10 min-w-64 items-center gap-2 rounded-md border border-white/10 bg-black/20 px-3 text-sm text-slate-300">
          <Search size={16} className="text-muted" />
          <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder={zhCN.ui.searchBrawler} className="w-full bg-transparent text-sm outline-none placeholder:text-muted" />
        </label>
        <button
          className={`flex h-10 items-center gap-2 rounded-md border px-3 text-xs font-semibold transition ${
            considerMeta ? 'border-emerald-300/40 bg-emerald-300/10 text-emerald-200' : 'border-white/10 bg-white/[0.04] text-slate-300'
          }`}
          onClick={() => onConsiderMetaChange(!considerMeta)}
        >
          <SlidersHorizontal size={15} />
          {zhCN.ui.metaStrength}
        </button>
        <StrategyToggle value={strategyMode} onChange={onStrategyChange} />
      </div>
    </header>
  );
}
