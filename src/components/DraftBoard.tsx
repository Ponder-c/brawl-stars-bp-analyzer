import { ShieldBan, Swords } from 'lucide-react';
import type { ReactNode } from 'react';
import { getActionForStep, getDraftStage, getDraftStageLabel, getStepInfo, normalizeDraftState, rankedDraftOrder, sideLabel, updateDraftSide, updateDraftStep } from '../algorithm/draft';
import { getBrawlerDisplayName, zhCN } from '../data/translations';
import type { Brawler, DraftState, TeamSide } from '../types/domain';
import { BrawlerPicker } from './BrawlerPicker';

interface Props {
  brawlers: Brawler[];
  draft: DraftState;
  search: string;
  onDraftChange: (draft: DraftState) => void;
}

export function DraftBoard({ brawlers, draft, search, onDraftChange }: Props) {
  const normalizedDraft = normalizeDraftState(draft);
  const usedIds = [...normalizedDraft.bluePicks, ...normalizedDraft.redPicks, ...normalizedDraft.blueBans, ...normalizedDraft.redBans];
  const stepInfo = getStepInfo(normalizedDraft.currentStep);
  const draftStage = getDraftStage(normalizedDraft);

  const toggleList = (key: keyof Pick<DraftState, 'allyPicks' | 'enemyPicks' | 'allyBans' | 'enemyBans'>, id: string, limit: number) => {
    const sideKey = getSideKey(normalizedDraft.teamSide, key);
    const current = normalizedDraft[sideKey];
    const next = current.includes(id) ? current.filter((item) => item !== id) : current.length < limit ? [...current, id] : current;
    onDraftChange(normalizeDraftState({ ...normalizedDraft, [sideKey]: next }));
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

      <div className="mb-4 grid grid-cols-[1fr_1fr_auto] gap-2 rounded-lg border border-white/10 bg-black/18 p-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-black text-muted">我方阵营</span>
          <select
            className="rounded-md border border-white/10 bg-black/35 px-2 py-2 text-xs font-bold text-ink outline-none"
            value={normalizedDraft.teamSide}
            onChange={(event) => onDraftChange(updateDraftSide(normalizedDraft, event.target.value as TeamSide))}
          >
            <option value="blue">蓝方 / 先选方</option>
            <option value="red">红方 / 后选方</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-black text-muted">当前 BP 步骤</span>
          <select
            className="rounded-md border border-white/10 bg-black/35 px-2 py-2 text-xs font-bold text-ink outline-none"
            value={normalizedDraft.currentStep}
            onChange={(event) => onDraftChange(updateDraftStep(normalizedDraft, Number(event.target.value)))}
          >
            {rankedDraftOrder.map((step, index) => (
              <option key={index} value={index}>
                {index + 1}. {step.team === 'blue' ? '蓝方' : '红方'}{step.phase === 'ban' ? '禁用' : `选择 ${step.pickNumber}`}
              </option>
            ))}
            <option value={rankedDraftOrder.length}>BP 完成</option>
          </select>
        </label>
        <div className="flex min-w-[150px] flex-col justify-center rounded-md border border-white/10 bg-white/[0.035] px-3">
          <span className="text-[11px] text-muted">{sideLabel(normalizedDraft.teamSide)}</span>
          <span className="mt-1 text-xs font-black text-ink">{getDraftStageLabel(draftStage)}</span>
          <span className="mt-1 text-[11px] text-muted">{formatAction(getActionForStep(stepInfo, normalizedDraft.teamSide))}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SlotGroup title={zhCN.ui.allyBan} icon={<ShieldBan size={15} />} tone="cyan" ids={normalizedDraft.allyBans} brawlers={brawlers} />
        <SlotGroup title={zhCN.ui.enemyBan} icon={<ShieldBan size={15} />} tone="red" ids={normalizedDraft.enemyBans} brawlers={brawlers} />
        <SlotGroup title={zhCN.ui.allyPick} icon={<Swords size={15} />} tone="cyan" ids={normalizedDraft.allyPicks} brawlers={brawlers} />
        <SlotGroup title={zhCN.ui.enemyPick} icon={<Swords size={15} />} tone="red" ids={normalizedDraft.enemyPicks} brawlers={brawlers} />
      </div>

      <div className="mt-4 grid flex-1 grid-cols-2 gap-4 overflow-hidden">
        <PickerColumn title={zhCN.ui.selectAllyPick} subtitle={zhCN.ui.maxThree}>
          <BrawlerPicker brawlers={brawlers} selectedIds={normalizedDraft.allyPicks} disabledIds={usedIds.filter((id) => !normalizedDraft.allyPicks.includes(id))} search={search} onToggle={(id) => toggleList('allyPicks', id, 3)} />
        </PickerColumn>
        <PickerColumn title={zhCN.ui.selectEnemyPick} subtitle={zhCN.ui.maxThree}>
          <BrawlerPicker brawlers={brawlers} selectedIds={normalizedDraft.enemyPicks} disabledIds={usedIds.filter((id) => !normalizedDraft.enemyPicks.includes(id))} search={search} onToggle={(id) => toggleList('enemyPicks', id, 3)} />
        </PickerColumn>
        <PickerColumn title={zhCN.ui.allyBan} subtitle={zhCN.ui.maxThree}>
          <BrawlerPicker brawlers={brawlers} selectedIds={normalizedDraft.allyBans} disabledIds={usedIds.filter((id) => !normalizedDraft.allyBans.includes(id))} search={search} onToggle={(id) => toggleList('allyBans', id, 3)} />
        </PickerColumn>
        <PickerColumn title={zhCN.ui.enemyBan} subtitle={zhCN.ui.maxThree}>
          <BrawlerPicker brawlers={brawlers} selectedIds={normalizedDraft.enemyBans} disabledIds={usedIds.filter((id) => !normalizedDraft.enemyBans.includes(id))} search={search} onToggle={(id) => toggleList('enemyBans', id, 3)} />
        </PickerColumn>
      </div>
    </section>
  );
}

function getSideKey(teamSide: TeamSide, key: keyof Pick<DraftState, 'allyPicks' | 'enemyPicks' | 'allyBans' | 'enemyBans'>) {
  const allySide = teamSide;
  const enemySide = teamSide === 'blue' ? 'red' : 'blue';
  const side = key.startsWith('ally') ? allySide : enemySide;
  const kind = key.endsWith('Picks') ? 'Picks' : 'Bans';
  return `${side}${kind}` as keyof Pick<DraftState, 'bluePicks' | 'redPicks' | 'blueBans' | 'redBans'>;
}

function formatAction(action: DraftState['nextAction']) {
  return {
    ally_ban: '下一步：我方禁用',
    enemy_ban: '下一步：敌方禁用',
    ally_pick: '下一步：我方选择',
    enemy_pick: '下一步：敌方选择',
    complete: '下一步：已完成'
  }[action];
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
