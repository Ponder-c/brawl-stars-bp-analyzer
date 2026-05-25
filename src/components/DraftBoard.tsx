import { ShieldBan, Swords } from 'lucide-react';
import type { ReactNode } from 'react';
import { getBrawlerDisplayName, zhCN } from '../data/translations';
import type { Brawler, DraftState } from '../types/domain';
import { BrawlerPicker } from './BrawlerPicker';

interface Props {
  brawlers: Brawler[];
  draft: DraftState;
  search: string;
  onDraftChange: (draft: DraftState) => void;
}

export function DraftBoard({ brawlers, draft, search, onDraftChange }: Props) {
  const usedIds = [...draft.allyPicks, ...draft.enemyPicks, ...draft.allyBans, ...draft.enemyBans];

  const toggleList = (key: keyof Pick<DraftState, 'allyPicks' | 'enemyPicks' | 'allyBans' | 'enemyBans'>, id: string, limit: number) => {
    const current = draft[key];
    const next = current.includes(id) ? current.filter((item) => item !== id) : current.length < limit ? [...current, id] : current;
    onDraftChange({ ...draft, [key]: next });
  };

  return (
    <section className="panel flex h-full flex-col rounded-lg p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-ink">{zhCN.ui.draftBoard}</h2>
          <p className="mt-1 text-xs text-muted">{zhCN.ui.draftSubtitle}</p>
        </div>
        <Swords className="text-ember" size={20} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SlotGroup title={zhCN.ui.allyBan} icon={<ShieldBan size={15} />} tone="cyan" ids={draft.allyBans} brawlers={brawlers} />
        <SlotGroup title={zhCN.ui.enemyBan} icon={<ShieldBan size={15} />} tone="red" ids={draft.enemyBans} brawlers={brawlers} />
        <SlotGroup title={zhCN.ui.allyPick} icon={<Swords size={15} />} tone="cyan" ids={draft.allyPicks} brawlers={brawlers} />
        <SlotGroup title={zhCN.ui.enemyPick} icon={<Swords size={15} />} tone="red" ids={draft.enemyPicks} brawlers={brawlers} />
      </div>

      <div className="mt-4 grid flex-1 grid-cols-2 gap-4 overflow-hidden">
        <PickerColumn title={zhCN.ui.selectAllyPick} subtitle={zhCN.ui.maxThree}>
          <BrawlerPicker brawlers={brawlers} selectedIds={draft.allyPicks} disabledIds={usedIds.filter((id) => !draft.allyPicks.includes(id))} search={search} onToggle={(id) => toggleList('allyPicks', id, 3)} />
        </PickerColumn>
        <PickerColumn title={zhCN.ui.selectEnemyPick} subtitle={zhCN.ui.maxThree}>
          <BrawlerPicker brawlers={brawlers} selectedIds={draft.enemyPicks} disabledIds={usedIds.filter((id) => !draft.enemyPicks.includes(id))} search={search} onToggle={(id) => toggleList('enemyPicks', id, 3)} />
        </PickerColumn>
        <PickerColumn title={zhCN.ui.allyBan} subtitle={zhCN.ui.maxThree}>
          <BrawlerPicker brawlers={brawlers} selectedIds={draft.allyBans} disabledIds={usedIds.filter((id) => !draft.allyBans.includes(id))} search={search} onToggle={(id) => toggleList('allyBans', id, 3)} />
        </PickerColumn>
        <PickerColumn title={zhCN.ui.enemyBan} subtitle={zhCN.ui.maxThree}>
          <BrawlerPicker brawlers={brawlers} selectedIds={draft.enemyBans} disabledIds={usedIds.filter((id) => !draft.enemyBans.includes(id))} search={search} onToggle={(id) => toggleList('enemyBans', id, 3)} />
        </PickerColumn>
      </div>
    </section>
  );
}

function PickerColumn({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="min-h-0 overflow-auto rounded-lg border border-white/10 bg-black/18 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-black text-ink">{title}</span>
        <span className="text-[11px] text-muted">{subtitle}</span>
      </div>
      {children}
    </div>
  );
}

function SlotGroup({ title, icon, tone, ids, brawlers }: { title: string; icon: ReactNode; tone: 'cyan' | 'red'; ids: string[]; brawlers: Brawler[] }) {
  const border = tone === 'cyan' ? 'border-neon/25' : 'border-danger/25';
  return (
    <div className={`rounded-lg border ${border} bg-white/[0.035] p-3`}>
      <div className="mb-2 flex items-center gap-2 text-xs font-black text-ink">
        {icon}
        {title}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((index) => {
          const brawler = brawlers.find((item) => item.id === ids[index]);
          return (
            <div key={index} className="flex h-12 items-center justify-center rounded-md border border-white/10 bg-black/25 text-xs text-muted">
              {brawler ? (
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded bg-white/10 font-black text-ink">{brawler.avatar}</span>
                  <span className="font-bold text-slate-200">{getBrawlerDisplayName(brawler)}</span>
                </div>
              ) : (
                `${zhCN.ui.slot} ${index + 1}`
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
