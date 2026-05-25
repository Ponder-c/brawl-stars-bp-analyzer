import { ShieldBan, Swords } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { createDraftOrder, getActionForStep, getDraftStage, getDraftStageLabel, getStepInfo, normalizeDraftState, sideLabel, updateDraftStep } from '../algorithm/draft';
import { getBrawlerDisplayName, zhCN } from '../data/translations';
import type { Brawler, DraftState, RankMode, TeamSide } from '../types/domain';
import { BrawlerPicker } from './BrawlerPicker';

interface Props {
  brawlers: Brawler[];
  draft: DraftState;
  search: string;
  onDraftChange: (draft: DraftState) => void;
}

export function DraftBoard({ brawlers, draft, search, onDraftChange }: Props) {
  const [history, setHistory] = useState<DraftState[]>([]);
  const normalizedDraft = normalizeDraftState(draft);
  const draftOrder = createDraftOrder(normalizedDraft.rankMode, normalizedDraft.firstPickSide);
  const usedIds = [...normalizedDraft.bluePicks, ...normalizedDraft.redPicks, ...normalizedDraft.blueBans, ...normalizedDraft.redBans];
  const stepInfo = getStepInfo(normalizedDraft.currentStep, normalizedDraft.rankMode, normalizedDraft.firstPickSide);
  const draftStage = getDraftStage(normalizedDraft);
  const activeTeam = stepInfo ? normalizedDraft.currentTeam : null;
  const activePhase = stepInfo ? normalizedDraft.currentPhase : null;
  const activeSideKey = stepInfo ? getTeamListKey(stepInfo.team, stepInfo.phase) : null;
  const activeList = activeSideKey ? normalizedDraft[activeSideKey] : [];
  const poolDisabledIds = stepInfo && activeList.length < 3 ? usedIds : brawlers.map((brawler) => brawler.id);

  const handlePoolToggle = (id: string) => {
    if (!stepInfo || !activeSideKey || usedIds.includes(id) || activeList.length >= 3) return;
    setHistory((current) => [...current, normalizedDraft]);
    onDraftChange(normalizeDraftState({ ...normalizedDraft, [activeSideKey]: [...activeList, id], currentStep: normalizedDraft.currentStep + 1 }));
  };

  const handleUndo = () => {
    setHistory((current) => {
      const previous = current.at(-1);
      if (!previous) return current;
      onDraftChange(previous);
      return current.slice(0, -1);
    });
  };

  const handleResetDraft = () => {
    if (!window.confirm('确定清空当前 BP 吗？')) return;
    setHistory([]);
    onDraftChange(
      normalizeDraftState({
        ...normalizedDraft,
        currentStep: 0,
        blueBans: [],
        redBans: [],
        bluePicks: [],
        redPicks: [],
        allyBans: [],
        enemyBans: [],
        allyPicks: [],
        enemyPicks: []
      })
    );
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

      <div className="mb-4 grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 rounded-lg border border-white/10 bg-black/18 p-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-black text-muted">段位规则</span>
          <select
            className="rounded-md border border-white/10 bg-black/35 px-2 py-2 text-xs font-bold text-ink outline-none"
            value={normalizedDraft.rankMode}
            onChange={(event) => onDraftChange(normalizeDraftState({ ...normalizedDraft, rankMode: event.target.value as RankMode, currentStep: 0 }))}
          >
            <option value="diamond">钻石：禁用后同时选</option>
            <option value="mythic_plus">神话及以上：禁用后轮流选</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-black text-muted">我方阵营</span>
          <select
            className="rounded-md border border-white/10 bg-black/35 px-2 py-2 text-xs font-bold text-ink outline-none"
            value={normalizedDraft.mySide}
            onChange={(event) => onDraftChange(normalizeDraftState({ ...normalizedDraft, mySide: event.target.value as TeamSide }))}
          >
            <option value="blue">我方蓝方</option>
            <option value="red">我方红方</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-black text-muted">先选方</span>
          <select
            className="rounded-md border border-white/10 bg-black/35 px-2 py-2 text-xs font-bold text-ink outline-none"
            value={normalizedDraft.firstPickSide}
            onChange={(event) => onDraftChange(normalizeDraftState({ ...normalizedDraft, firstPickSide: event.target.value as TeamSide }))}
          >
            <option value="blue">蓝方先选</option>
            <option value="red">红方先选</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-black text-muted">当前 BP 步骤</span>
          <select
            className="rounded-md border border-white/10 bg-black/35 px-2 py-2 text-xs font-bold text-ink outline-none"
            value={normalizedDraft.currentStep}
            onChange={(event) => onDraftChange(updateDraftStep(normalizedDraft, Number(event.target.value)))}
          >
            {draftOrder.map((step, index) => (
              <option key={index} value={index}>
                {index + 1}. {step.team === 'blue' ? '蓝方' : '红方'}{step.phase === 'ban' ? '禁用' : `选择 ${step.pickNumber}`}
              </option>
            ))}
            <option value={draftOrder.length}>BP 完成</option>
          </select>
        </label>
        <div className="flex min-w-[150px] flex-col justify-center rounded-md border border-white/10 bg-white/[0.035] px-3">
          <span className="text-[11px] text-muted">{sideLabel(normalizedDraft.teamSide)}</span>
          <span className="mt-1 text-xs font-black text-ink">{getDraftStageLabel(draftStage)}</span>
          <span className="mt-1 text-[11px] text-muted">{formatAction(getActionForStep(stepInfo, normalizedDraft.teamSide))}</span>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[170px_minmax(0,1fr)_170px] gap-3 overflow-hidden">
        <div className="flex min-h-0 flex-col gap-3">
          <SlotGroup title="蓝方 Ban" icon={<ShieldBan size={15} />} tone="cyan" ids={normalizedDraft.blueBans} brawlers={brawlers} active={activeTeam === 'blue' && activePhase === 'ban'} />
          <SlotGroup title="蓝方 Pick" icon={<Swords size={15} />} tone="cyan" ids={normalizedDraft.bluePicks} brawlers={brawlers} active={activeTeam === 'blue' && activePhase === 'pick'} />
        </div>

        <div className="min-h-0 overflow-auto rounded-lg border border-white/10 bg-black/18 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-black text-ink">统一英雄池</span>
            <div className="flex items-center gap-2">
              <button
                className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-bold text-slate-300 transition hover:border-white/25 disabled:opacity-35"
                disabled={history.length === 0}
                onClick={handleUndo}
              >
                撤销上一步
              </button>
              <button className="rounded-md border border-danger/25 bg-danger/10 px-2 py-1 text-[11px] font-bold text-rose-100 transition hover:border-danger/50" onClick={handleResetDraft}>
                清空本局 BP
              </button>
            </div>
          </div>
          <BrawlerPicker brawlers={brawlers} selectedIds={[]} disabledIds={poolDisabledIds} search={search} onToggle={handlePoolToggle} />
        </div>

        <div className="flex min-h-0 flex-col gap-3">
          <SlotGroup title="红方 Ban" icon={<ShieldBan size={15} />} tone="red" ids={normalizedDraft.redBans} brawlers={brawlers} active={activeTeam === 'red' && activePhase === 'ban'} />
          <SlotGroup title="红方 Pick" icon={<Swords size={15} />} tone="red" ids={normalizedDraft.redPicks} brawlers={brawlers} active={activeTeam === 'red' && activePhase === 'pick'} />
        </div>
      </div>
    </section>
  );
}

function getTeamListKey(team: TeamSide, phase: 'ban' | 'pick') {
  const kind = phase === 'ban' ? 'Bans' : 'Picks';
  return `${team}${kind}` as keyof Pick<DraftState, 'bluePicks' | 'redPicks' | 'blueBans' | 'redBans'>;
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

function SlotGroup({ title, icon, tone, ids, brawlers, active = false }: { title: string; icon: ReactNode; tone: 'cyan' | 'red'; ids: string[]; brawlers: Brawler[]; active?: boolean }) {
  const border = tone === 'cyan' ? 'border-neon/25' : 'border-danger/25';
  const activeClass = tone === 'cyan' ? 'border-neon/70 bg-neon/10 shadow-glow' : 'border-danger/70 bg-danger/10';
  return (
    <div className={`rounded-lg border ${active ? activeClass : `${border} bg-white/[0.035]`} p-3`}>
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
