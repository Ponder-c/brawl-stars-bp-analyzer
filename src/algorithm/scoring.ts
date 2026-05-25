import type {
  BrawlMap,
  Brawler,
  BrawlerRole,
  DraftState,
  GameMode,
  KnowledgeEntry,
  MetaTier,
  ScoreBreakdown,
  StrategyMode,
  TeamAnalysis
} from '../types/domain';

const tierScore: Record<MetaTier, number> = {
  S: 10,
  A: 7,
  B: 4,
  C: 1,
  D: -3
};

const strategyWeights: Record<StrategyMode, { map: number; mode: number; synergy: number; counter: number; meta: number; knowledge: number }> = {
  balanced: { map: 1, mode: 1, synergy: 1, counter: 1, meta: 0.8, knowledge: 0.7 },
  safe: { map: 1, mode: 1.1, synergy: 1.25, counter: 0.8, meta: 1, knowledge: 0.8 },
  aggressive: { map: 1, mode: 0.9, synergy: 0.8, counter: 1.35, meta: 0.7, knowledge: 0.5 },
  pro: { map: 1.1, mode: 1, synergy: 1.2, counter: 1.15, meta: 0.9, knowledge: 1.35 },
  ladder: { map: 0.9, mode: 1, synergy: 0.8, counter: 0.9, meta: 1.35, knowledge: 0.45 }
};

function clampScore(value: number) {
  return Math.max(-30, Math.min(100, value));
}

function closeTo(value: number, target: number, weight = 1) {
  return Math.max(0, 10 - Math.abs(value - target)) * weight;
}

function hasRole(brawler: Brawler, role: BrawlerRole) {
  return brawler.roles.includes(role);
}

export function calculateMapFitScore(brawler: Brawler, map: BrawlMap) {
  const reasons: string[] = [];
  const risks: string[] = [];
  let score = 0;

  score += closeTo(brawler.stats.range, map.openness, 1.1);
  if (map.sniperFriendly && brawler.stats.range >= 8) {
    score += 12;
    reasons.push('地图适配度高：地图开阔，长手英雄能利用射程优势压制对手。');
  }
  if (map.throwerFriendly && hasRole(brawler, 'thrower')) {
    score += 14;
    reasons.push('地图适配度高：墙体较多，投掷英雄可以安全封锁关键区域。');
  }
  if (map.assassinFriendly && hasRole(brawler, 'assassin')) {
    score += 9;
    reasons.push('地图适配度高：草丛和近身路线能帮助刺客后手进场。');
  }
  if (map.tankFriendly && hasRole(brawler, 'tank')) {
    score += 10;
    reasons.push('地图适配度高：地形允许坦克压线和主动开团。');
  }
  if (map.wallBreakValue >= 6 && brawler.stats.wallBreak >= 6) {
    score += 13;
    reasons.push('破墙价值高：可以改变对线空间和进攻路线。');
  }
  if (map.wallDensity >= 7 && brawler.stats.wallBreak <= 1 && brawler.stats.range >= 8 && !hasRole(brawler, 'thrower')) {
    risks.push('墙体较多，长手可能被掩体限制输出角度。');
    score -= 5;
  }
  if (map.openness >= 8 && (hasRole(brawler, 'tank') || hasRole(brawler, 'assassin')) && brawler.stats.mobility < 8) {
    risks.push('开阔地图短手进场困难。');
    score -= 10;
  }
  if (map.bushDensity >= 7 && brawler.stats.antiAssassin < 5) {
    risks.push('草丛较多，容易被刺客突然近身。');
    score -= 5;
  }

  return { score: clampScore(score), reasons, risks };
}

export function calculateModeFitScore(brawler: Brawler, mode: GameMode) {
  const reasons: string[] = [];
  const risks: string[] = [];
  const s = brawler.stats;
  let score = 0;

  if (mode === 'brawl_ball') {
    score += s.engage * 1.2 + s.control + s.wallBreak * 0.9 + s.ballCarry * 1.2;
    if (s.engage >= 7) reasons.push('模式适配度高：具备乱斗足球需要的开团或推进能力。');
    if (s.wallBreak >= 6) reasons.push('模式适配度高：能打开球门前路线，提升进球威胁。');
    if (s.ballCarry < 3) risks.push('控球和终结进球能力偏弱。');
  }
  if (mode === 'gem_grab') {
    score += s.control * 1.2 + s.sustain + s.dps * 0.7 + s.survivability;
    if (hasRole(brawler, 'mid')) reasons.push('模式适配度高：可承担宝石争霸中路控制。');
    if (s.survivability < 5) risks.push('持宝容错偏低。');
  }
  if (mode === 'hot_zone') {
    score += s.zoneHold * 1.4 + s.control * 1.2 + s.sustain + s.dps * 0.6;
    if (s.zoneHold >= 8) reasons.push('模式适配度高：站点和持续控区能力强。');
    if (s.range <= 3 && s.sustain < 7) risks.push('进点容易被消耗。');
  }
  if (mode === 'heist') {
    score += s.dps * 1.6 + s.wallBreak + s.mobility * 0.5 + s.burst;
    if (s.dps >= 8) reasons.push('模式适配度高：金库输出效率高。');
    if (s.dps < 5) risks.push('对金库伤害不足。');
  }
  if (mode === 'bounty' || mode === 'knockout' || mode === 'wipeout') {
    score += s.range * 1.3 + s.survivability * 1.2 + s.burst + s.antiAssassin * 0.8;
    if (s.range >= 8) reasons.push('模式适配度高：远程消耗适合低死亡率模式。');
    if (s.survivability < 5) risks.push('被击杀代价高，容错偏低。');
  }
  if (mode === 'duels') {
    score += s.burst * 1.2 + s.survivability + s.mobility + s.antiAssassin;
    if (s.burst >= 7) reasons.push('模式适配度高：单挑爆发窗口明确。');
  }

  return { score: clampScore(score), reasons, risks };
}

export function calculateSynergyScore(candidate: Brawler, allyBrawlers: Brawler[]) {
  const team = [...allyBrawlers, candidate];
  const reasons: string[] = [];
  const risks: string[] = [];
  let score = 8;

  const totals = team.reduce(
    (acc, b) => {
      acc.control += b.stats.control;
      acc.dps += b.stats.dps;
      acc.wallBreak += b.stats.wallBreak;
      acc.engage += b.stats.engage;
      acc.antiAssassin += b.stats.antiAssassin;
      acc.sustain += b.stats.sustain;
      return acc;
    },
    { control: 0, dps: 0, wallBreak: 0, engage: 0, antiAssassin: 0, sustain: 0 }
  );

  if (!team.some((b) => hasRole(b, 'mid')) && (hasRole(candidate, 'mid') || candidate.stats.control >= 7)) {
    score += 10;
    reasons.push('阵容协同好：补上中路控制点。');
  }
  if (team.filter((b) => hasRole(b, 'lane')).length >= 2) {
    score += 5;
    reasons.push('阵容协同好：边路结构完整。');
  }
  if (totals.control / team.length >= 6.5) reasons.push('阵容控场充足。');
  if (totals.control / team.length < 5) {
    score -= 7;
    risks.push('缺少控场。');
  }
  if (totals.dps / team.length < 5.2) {
    score -= 7;
    risks.push('输出不足。');
  } else {
    score += 5;
    reasons.push('整体输出线稳定。');
  }
  if (totals.wallBreak < 5) risks.push('缺少破墙。');
  if (totals.wallBreak >= 7) {
    score += 5;
    reasons.push('阵容具备改变地形的能力。');
  }
  if (totals.engage < 8) risks.push('缺少开团。');
  if (totals.antiAssassin / team.length < 5) risks.push('反刺客能力不足。');
  if (totals.sustain / team.length >= 6) reasons.push('续航能支撑长回合拉扯。');

  const throwers = team.filter((b) => hasRole(b, 'thrower')).length;
  if (throwers >= 2) {
    score -= 6;
    risks.push('双投掷阵容怕突进。');
  }
  const shortRange = team.filter((b) => b.stats.range <= 4).length;
  if (shortRange >= 2) {
    score -= 6;
    risks.push('短手过多，对线压力大。');
  }

  return { score: clampScore(score), reasons, risks };
}

export function calculateCounterScore(candidate: Brawler, enemyBrawlers: Brawler[]) {
  const reasons: string[] = [];
  const risks: string[] = [];
  let score = 0;

  for (const enemy of enemyBrawlers) {
    const counter = candidate.counters.find((item) => item.targetId === enemy.id);
    if (counter) {
      score += counter.strength * 3;
      reasons.push(`克制 ${enemy.name}：${counter.reason}`);
    }
    const punishedByEnemy = candidate.counteredBy.find((item) => item.targetId === enemy.id);
    if (punishedByEnemy) {
      score -= punishedByEnemy.strength * 2.5;
      risks.push(`被 ${enemy.name} 针对：${punishedByEnemy.reason}`);
    }
  }

  return { score: clampScore(score), reasons, risks };
}

export function calculateKnowledgeScore(candidate: Brawler, map: BrawlMap, knowledge: KnowledgeEntry[]) {
  let score = 0;
  const reasons: string[] = [];
  for (const entry of knowledge) {
    if (entry.mapName !== map.mapName || entry.mode !== map.gameMode) continue;
    if (entry.recommendedBrawlers.includes(candidate.id)) {
      score += 10 * entry.confidence;
      reasons.push(`知识库推荐：${entry.sourceTitle}`);
    }
    if (entry.bans.includes(candidate.id)) {
      score -= 3 * entry.confidence;
    }
  }
  return { score, reasons };
}

export function calculateMetaScore(brawler: Brawler, considerMeta: boolean) {
  return considerMeta ? tierScore[brawler.metaTier] : 0;
}

export function calculatePickScore(
  candidate: Brawler,
  map: BrawlMap,
  draft: DraftState,
  allBrawlers: Brawler[],
  knowledge: KnowledgeEntry[]
): ScoreBreakdown {
  const allyBrawlers = draft.allyPicks.map((id) => allBrawlers.find((b) => b.id === id)).filter(Boolean) as Brawler[];
  const enemyBrawlers = draft.enemyPicks.map((id) => allBrawlers.find((b) => b.id === id)).filter(Boolean) as Brawler[];
  const mapFit = calculateMapFitScore(candidate, map);
  const modeFit = calculateModeFitScore(candidate, map.gameMode);
  const synergy = calculateSynergyScore(candidate, allyBrawlers);
  const counter = calculateCounterScore(candidate, enemyBrawlers);
  const knowledgeScore = calculateKnowledgeScore(candidate, map, knowledge);
  const meta = calculateMetaScore(candidate, draft.considerMeta);
  const weights = strategyWeights[draft.strategyMode];
  const total = clampScore(
    mapFit.score * weights.map +
      modeFit.score * weights.mode +
      synergy.score * weights.synergy +
      counter.score * weights.counter +
      meta * weights.meta +
      knowledgeScore.score * weights.knowledge
  );

  return {
    mapFit: Math.round(mapFit.score),
    modeFit: Math.round(modeFit.score),
    synergy: Math.round(synergy.score),
    counter: Math.round(counter.score),
    meta: Math.round(meta),
    knowledge: Math.round(knowledgeScore.score),
    total: Math.round(total),
    reasons: [...mapFit.reasons, ...modeFit.reasons, ...synergy.reasons, ...counter.reasons, ...knowledgeScore.reasons].slice(0, 6),
    risks: [...mapFit.risks, ...modeFit.risks, ...synergy.risks, ...counter.risks].slice(0, 6),
    tags: [...candidate.roles, candidate.metaTier].slice(0, 5)
  };
}

export function calculateBanScore(candidate: Brawler, map: BrawlMap, draft: DraftState, allBrawlers: Brawler[], knowledge: KnowledgeEntry[]) {
  const pseudoDraft: DraftState = { ...draft, allyPicks: [], enemyPicks: draft.allyPicks };
  const baseScore = calculatePickScore(candidate, map, pseudoDraft, allBrawlers, knowledge);
  const allyBrawlers = draft.allyPicks.map((id) => allBrawlers.find((b) => b.id === id)).filter(Boolean) as Brawler[];
  const reasons: string[] = [];
  const protectsAgainst: string[] = [];
  let threat = baseScore.mapFit * 0.35 + baseScore.modeFit * 0.35 + baseScore.meta * 1.2;

  for (const ally of allyBrawlers) {
    const relation = candidate.counters.find((item) => item.targetId === ally.id);
    if (relation) {
      threat += relation.strength * 4;
      protectsAgainst.push(`${candidate.name} 克制我方 ${ally.name}`);
    }
  }

  for (const entry of knowledge) {
    if (entry.mapName === map.mapName && entry.mode === map.gameMode && entry.bans.includes(candidate.id)) {
      threat += 8 * entry.confidence;
      reasons.push(`知识库禁用倾向：${entry.sourceTitle}`);
    }
  }

  if (candidate.metaTier === 'S') reasons.push('当前版本强度高，容易被首抢。');
  if (baseScore.mapFit > 55) reasons.push('地图适配度高。');
  if (baseScore.modeFit > 55) reasons.push('模式收益高。');
  reasons.push(...protectsAgainst);

  return { score: Math.round(clampScore(threat)), reasons: reasons.slice(0, 5), protectsAgainst };
}

export function analyzeTeam(allyBrawlers: Brawler[], enemyBrawlers: Brawler[], map: BrawlMap): TeamAnalysis {
  const strengths: string[] = [];
  const risks: string[] = [];
  const counterPlan: string[] = [];
  const avg = (selector: (b: Brawler) => number) => (allyBrawlers.length ? allyBrawlers.reduce((sum, b) => sum + selector(b), 0) / allyBrawlers.length : 0);

  if (avg((b) => b.stats.control) >= 6.5) strengths.push('控场能力足，适合争夺关键路口。');
  if (avg((b) => b.stats.dps) >= 6.5) strengths.push('持续输出稳定，可处理前排或目标点。');
  if (avg((b) => b.stats.sustain) >= 6) strengths.push('续航好，能打长回合拉扯。');
  if (allyBrawlers.some((b) => b.stats.wallBreak >= 7)) strengths.push('有破墙点，可以主动改变地图结构。');

  if (!allyBrawlers.some((b) => b.stats.wallBreak >= 6) && map.wallBreakValue >= 6) risks.push('缺少破墙。');
  if (avg((b) => b.stats.antiAssassin) < 5) risks.push('怕刺客。');
  if (avg((b) => b.stats.control) < 5) risks.push('缺少控场。');
  if (avg((b) => b.stats.dps) < 5) risks.push('输出不足。');
  if (map.throwerFriendly && !allyBrawlers.some((b) => b.roles.includes('assassin') || b.stats.wallBreak >= 6)) risks.push('怕投掷。');
  if (map.openness >= 8 && allyBrawlers.filter((b) => b.stats.range <= 4).length >= 2) risks.push('开阔图短手过多，对线压力大。');

  for (const enemy of enemyBrawlers) {
    const answers = allyBrawlers.filter((ally) => ally.counters.some((c) => c.targetId === enemy.id));
    if (answers.length) {
      counterPlan.push(`用 ${answers.map((b) => b.name).join('/')} 处理 ${enemy.name}。`);
    } else {
      counterPlan.push(`敌方 ${enemy.name} 暂无明确克制点，后手优先补克制选择。`);
    }
  }

  return {
    strengths: strengths.length ? strengths : ['当前阵容信息不足，建议先补稳定中路或强势边路。'],
    risks: risks.length ? risks : ['暂无明显结构性风险。'],
    counterPlan: counterPlan.length ? counterPlan : ['等待敌方更多选择后生成克制计划。']
  };
}
