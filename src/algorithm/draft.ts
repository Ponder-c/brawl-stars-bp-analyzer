import type { DraftAction, DraftPhase, DraftState, TeamSide } from '../types/domain';

export type DraftTeam = 'blue' | 'red';
export type DraftStage = 'ban' | 'first_pick' | 'middle_pick' | 'last_pick' | 'complete';

export interface DraftOrderStep {
  phase: Exclude<DraftPhase, 'complete'>;
  team: DraftTeam;
  pickNumber?: number;
}

export interface DraftWeightSet {
  mapFit: number;
  modeFit: number;
  meta: number;
  safety: number;
  versatility: number;
  directCounter: number;
  tagCounter: number;
  allyNeed: number;
  synergy: number;
  risk: number;
}

// TODO: Ranked BP order needs manual verification against the current game client.
// This models the common competitive flow: both sides ban, blue first-picks,
// red gets two picks, blue gets two picks, then red closes with last pick.
export const rankedDraftOrder: DraftOrderStep[] = [
  { phase: 'ban', team: 'blue' },
  { phase: 'ban', team: 'red' },
  { phase: 'pick', team: 'blue', pickNumber: 1 },
  { phase: 'pick', team: 'red', pickNumber: 1 },
  { phase: 'pick', team: 'red', pickNumber: 2 },
  { phase: 'pick', team: 'blue', pickNumber: 2 },
  { phase: 'pick', team: 'blue', pickNumber: 3 },
  { phase: 'pick', team: 'red', pickNumber: 3 }
];

export function buildDraftOrder(firstPickSide: TeamSide = 'blue'): DraftOrderStep[] {
  const secondPickSide = firstPickSide === 'blue' ? 'red' : 'blue';
  return [
    { phase: 'ban', team: firstPickSide },
    { phase: 'ban', team: secondPickSide },
    { phase: 'pick', team: firstPickSide, pickNumber: 1 },
    { phase: 'pick', team: secondPickSide, pickNumber: 1 },
    { phase: 'pick', team: secondPickSide, pickNumber: 2 },
    { phase: 'pick', team: firstPickSide, pickNumber: 2 },
    { phase: 'pick', team: firstPickSide, pickNumber: 3 },
    { phase: 'pick', team: secondPickSide, pickNumber: 3 }
  ];
}

export const draftWeights: Record<DraftStage, DraftWeightSet> = {
  first_pick: {
    mapFit: 0.3,
    modeFit: 0.2,
    meta: 0.2,
    safety: 0.15,
    versatility: 0.15,
    directCounter: 0.05,
    tagCounter: 0.05,
    allyNeed: 0.05,
    synergy: 0.08,
    risk: 0.18
  },
  middle_pick: {
    mapFit: 0.25,
    modeFit: 0.15,
    meta: 0.15,
    safety: 0.08,
    versatility: 0.08,
    directCounter: 0.15,
    tagCounter: 0.1,
    allyNeed: 0.15,
    synergy: 0.1,
    risk: 0.1
  },
  last_pick: {
    mapFit: 0.2,
    modeFit: 0.1,
    meta: 0.1,
    safety: 0.04,
    versatility: 0.04,
    directCounter: 0.25,
    tagCounter: 0.2,
    allyNeed: 0.1,
    synergy: 0.08,
    risk: 0.1
  },
  ban: {
    mapFit: 0.2,
    modeFit: 0.1,
    meta: 0.25,
    safety: 0,
    versatility: 0,
    directCounter: 0.2,
    tagCounter: 0.2,
    allyNeed: 0.2,
    synergy: 0,
    risk: 0
  },
  complete: {
    mapFit: 0.22,
    modeFit: 0.12,
    meta: 0.1,
    safety: 0.05,
    versatility: 0.05,
    directCounter: 0.2,
    tagCounter: 0.16,
    allyNeed: 0.1,
    synergy: 0.1,
    risk: 0.1
  }
};

function clampStep(currentStep: number, draftOrder = rankedDraftOrder) {
  return Math.max(0, Math.min(draftOrder.length, currentStep));
}

export function sideLabel(side: TeamSide) {
  return side === 'blue' ? '蓝方 / 先选方' : '红方 / 后选方';
}

export function getStepInfo(currentStep: number, firstPickSide: TeamSide = 'blue') {
  const draftOrder = buildDraftOrder(firstPickSide);
  const step = clampStep(currentStep, draftOrder);
  return draftOrder[step] ?? null;
}

export function getActionForStep(step: DraftOrderStep | null, teamSide: TeamSide): DraftAction {
  if (!step) return 'complete';
  const isAlly = step.team === teamSide;
  if (step.phase === 'ban') return isAlly ? 'ally_ban' : 'enemy_ban';
  return isAlly ? 'ally_pick' : 'enemy_pick';
}

export function getDraftStage(draft: Pick<DraftState, 'currentStep' | 'currentPhase' | 'nextAction'>): DraftStage {
  if (draft.currentPhase === 'complete' || draft.nextAction === 'complete') return 'complete';
  if (draft.currentPhase === 'ban' || draft.nextAction.endsWith('_ban')) return 'ban';
  const pickStepsBeforeOrAt = rankedDraftOrder.slice(0, clampStep(draft.currentStep) + 1).filter((step) => step.phase === 'pick').length;
  if (pickStepsBeforeOrAt <= 1) return 'first_pick';
  if (pickStepsBeforeOrAt >= 6) return 'last_pick';
  return 'middle_pick';
}

export function getDraftStageLabel(stage: DraftStage) {
  return {
    ban: '禁用阶段',
    first_pick: '先手首选',
    middle_pick: '中段选择',
    last_pick: '尾选克制',
    complete: 'BP 已完成'
  }[stage];
}

export function getDraftStageReason(draft: DraftState) {
  const stage = getDraftStage(draft);
  if (stage === 'ban') return '当前处于禁用阶段，建议优先禁用这张地图上强势、敌方可能首抢且我方难以处理的英雄。';
  if (stage === 'first_pick') return draft.teamSide === 'blue'
    ? '当前为蓝方先选，推荐优先选择地图适配高、稳定性强、不容易被针对的英雄。'
    : '当前为红方观察蓝方首选前后的选择，推荐更重视稳健补位，避免过早暴露高风险体系。';
  if (stage === 'middle_pick') return draft.teamSide === 'red'
    ? '当前为红方后手选择，敌方已经暴露核心英雄，因此推荐优先考虑 Counter Pick 和阵容补位。'
    : '当前为蓝方中段选择，需要在地图强势和补位之间平衡，避免阵容被后手克制。';
  if (stage === 'last_pick') return '当前接近尾选，可针对敌方完整阵容选择强克制英雄，但需要注意阵容风险。';
  return '当前 BP 已接近完成，推荐以阵容结构和风险修正为主。';
}

export function normalizeDraftState(draft: DraftState): DraftState {
  const firstPickSide = draft.firstPickSide ?? 'blue';
  const currentStep = clampStep(draft.currentStep ?? 0, buildDraftOrder(firstPickSide));
  const step = getStepInfo(currentStep, firstPickSide);
  const teamSide = draft.teamSide ?? 'blue';
  const mySide = draft.mySide ?? teamSide;
  const bluePicks = draft.bluePicks ?? (teamSide === 'blue' ? draft.allyPicks : draft.enemyPicks) ?? [];
  const redPicks = draft.redPicks ?? (teamSide === 'red' ? draft.allyPicks : draft.enemyPicks) ?? [];
  const blueBans = draft.blueBans ?? (teamSide === 'blue' ? draft.allyBans : draft.enemyBans) ?? [];
  const redBans = draft.redBans ?? (teamSide === 'red' ? draft.allyBans : draft.enemyBans) ?? [];
  const currentPhase = step?.phase ?? 'complete';
  const nextAction = getActionForStep(step, teamSide);

  return {
    ...draft,
    teamSide,
    mySide,
    firstPickSide,
    currentStep,
    currentPhase,
    nextAction,
    bluePicks,
    redPicks,
    blueBans,
    redBans,
    allyPicks: teamSide === 'blue' ? bluePicks : redPicks,
    enemyPicks: teamSide === 'blue' ? redPicks : bluePicks,
    allyBans: teamSide === 'blue' ? blueBans : redBans,
    enemyBans: teamSide === 'blue' ? redBans : blueBans
  };
}

export function updateDraftSide(draft: DraftState, teamSide: TeamSide) {
  return normalizeDraftState({ ...draft, teamSide });
}

export function updateDraftStep(draft: DraftState, currentStep: number) {
  return normalizeDraftState({ ...draft, currentStep });
}
