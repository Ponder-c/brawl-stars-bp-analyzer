import type { DraftAction, DraftPhase, DraftState, RankMode, TeamSide } from '../types/domain';

export type DraftTeam = 'blue' | 'red';
export type DraftStage = 'ban' | 'first_pick' | 'middle_pick' | 'last_pick' | 'complete';
export const DEFAULT_BANS_PER_TEAM = 3;
export const PICKS_PER_TEAM = 3;

export interface DraftOrderStep {
  phase: Exclude<DraftPhase, 'complete'>;
  team: DraftTeam;
  slot: number;
  pickNumber?: number;
  mode?: 'snake_pick' | 'simultaneous_pick';
}

export interface CreateDraftOrderOptions {
  rankMode?: RankMode;
  firstPickSide?: TeamSide;
  bansPerTeam?: number;
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

export function createDraftOrder({
  rankMode = 'mythic_plus',
  firstPickSide = 'blue',
  bansPerTeam = DEFAULT_BANS_PER_TEAM
}: CreateDraftOrderOptions = {}): DraftOrderStep[] {
  // Diamond uses bans first, then simultaneous hero picks. Mythic+ uses bans first,
  // then snake picks; firstPickSide is randomly decided by the game for that match.
  const secondPickSide = firstPickSide === 'blue' ? 'red' : 'blue';
  const banSteps = Array.from({ length: bansPerTeam }, (_, index) => {
    const slot = index + 1;
    return [
      { phase: 'ban' as const, team: 'blue' as const, slot },
      { phase: 'ban' as const, team: 'red' as const, slot }
    ];
  }).flat();

  if (rankMode === 'diamond') {
    return [
      ...banSteps,
      { phase: 'pick', team: 'blue', slot: 1, pickNumber: 1, mode: 'simultaneous_pick' },
      { phase: 'pick', team: 'blue', slot: 2, pickNumber: 2, mode: 'simultaneous_pick' },
      { phase: 'pick', team: 'blue', slot: 3, pickNumber: 3, mode: 'simultaneous_pick' },
      { phase: 'pick', team: 'red', slot: 1, pickNumber: 1, mode: 'simultaneous_pick' },
      { phase: 'pick', team: 'red', slot: 2, pickNumber: 2, mode: 'simultaneous_pick' },
      { phase: 'pick', team: 'red', slot: 3, pickNumber: 3, mode: 'simultaneous_pick' }
    ];
  }

  return [
    ...banSteps,
    { phase: 'pick', team: firstPickSide, slot: 1, pickNumber: 1, mode: 'snake_pick' },
    { phase: 'pick', team: secondPickSide, slot: 1, pickNumber: 1, mode: 'snake_pick' },
    { phase: 'pick', team: secondPickSide, slot: 2, pickNumber: 2, mode: 'snake_pick' },
    { phase: 'pick', team: firstPickSide, slot: 2, pickNumber: 2, mode: 'snake_pick' },
    { phase: 'pick', team: firstPickSide, slot: 3, pickNumber: 3, mode: 'snake_pick' },
    { phase: 'pick', team: secondPickSide, slot: 3, pickNumber: 3, mode: 'snake_pick' }
  ];
}

export const rankedDraftOrder = createDraftOrder({ rankMode: 'mythic_plus', firstPickSide: 'blue' });

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
  return side === 'blue' ? '我方：蓝方' : '我方：红方';
}

export function getStepInfo(
  currentStep: number,
  rankMode: RankMode = 'mythic_plus',
  firstPickSide: TeamSide = 'blue',
  bansPerTeam: number = DEFAULT_BANS_PER_TEAM
) {
  const draftOrder = createDraftOrder({ rankMode, firstPickSide, bansPerTeam });
  const step = clampStep(currentStep, draftOrder);
  return draftOrder[step] ?? null;
}

export function getActionForStep(step: DraftOrderStep | null, teamSide: TeamSide): DraftAction {
  if (!step) return 'complete';
  const isAlly = step.team === teamSide;
  if (step.phase === 'ban') return isAlly ? 'ally_ban' : 'enemy_ban';
  return isAlly ? 'ally_pick' : 'enemy_pick';
}

export function getDraftStage(draft: Pick<DraftState, 'currentStep' | 'currentPhase' | 'nextAction' | 'rankMode' | 'firstPickSide' | 'bansPerTeam'>): DraftStage {
  if (draft.currentPhase === 'complete' || draft.nextAction === 'complete') return 'complete';
  if (draft.currentPhase === 'ban' || draft.nextAction.endsWith('_ban')) return 'ban';
  const draftOrder = createDraftOrder({ rankMode: draft.rankMode, firstPickSide: draft.firstPickSide, bansPerTeam: draft.bansPerTeam });
  const pickStepsBeforeOrAt = draftOrder.slice(0, clampStep(draft.currentStep, draftOrder) + 1).filter((step) => step.phase === 'pick').length;
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
  if (stage === 'first_pick') return `${draft.firstPickSide === 'blue' ? '蓝方' : '红方'}先选，推荐优先选择地图适配高、稳定性强、不容易被针对的英雄。`;
  if (stage === 'middle_pick') return '当前处于中段选择，需要在地图强势、Counter Pick 和阵容补位之间平衡。';
  if (stage === 'last_pick') return '当前接近尾选，可针对敌方完整阵容选择强克制英雄，但需要注意阵容风险。';
  return '当前 BP 已接近完成，推荐以阵容结构和风险修正为主。';
}

export function normalizeDraftState(draft: DraftState): DraftState {
  const rankMode = draft.rankMode ?? 'mythic_plus';
  const firstPickSide = draft.firstPickSide ?? 'blue';
  const bansPerTeam = draft.bansPerTeam ?? DEFAULT_BANS_PER_TEAM;
  const draftOrder = createDraftOrder({ rankMode, firstPickSide, bansPerTeam });
  const requestedStep = clampStep(draft.currentStep ?? 0, draftOrder);
  const mySide = draft.mySide ?? draft.teamSide ?? 'blue';
  const teamSide = mySide;
  const bluePicks = draft.bluePicks ?? (teamSide === 'blue' ? draft.allyPicks : draft.enemyPicks) ?? [];
  const redPicks = draft.redPicks ?? (teamSide === 'red' ? draft.allyPicks : draft.enemyPicks) ?? [];
  const blueBans = draft.blueBans ?? (teamSide === 'blue' ? draft.allyBans : draft.enemyBans) ?? [];
  const redBans = draft.redBans ?? (teamSide === 'red' ? draft.allyBans : draft.enemyBans) ?? [];
  const bansComplete = blueBans.length >= bansPerTeam && redBans.length >= bansPerTeam;
  const nextIncompleteBanStep = draftOrder.findIndex((draftStep) => {
    if (draftStep.phase !== 'ban') return false;
    const bans = draftStep.team === 'blue' ? blueBans : redBans;
    return bans.length < draftStep.slot;
  });
  const currentStep = !bansComplete && nextIncompleteBanStep >= 0
    ? nextIncompleteBanStep
    : requestedStep;
  const step = getStepInfo(currentStep, rankMode, firstPickSide, bansPerTeam);
  const currentTeam = step?.team ?? draft.currentTeam ?? mySide;
  const currentPhase = step?.phase ?? 'complete';
  const nextAction = getActionForStep(step, mySide);

  return {
    ...draft,
    teamSide,
    rankMode,
    mySide,
    firstPickSide,
    bansPerTeam,
    currentStep,
    currentPhase,
    currentTeam,
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
  return normalizeDraftState({ ...draft, teamSide, mySide: teamSide });
}

export function updateDraftStep(draft: DraftState, currentStep: number) {
  return normalizeDraftState({ ...draft, currentStep });
}
