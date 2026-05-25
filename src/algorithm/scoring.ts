import type {
  BrawlMap,
  Brawler,
  BrawlerRole,
  CounterReference,
  DraftState,
  GameMode,
  KnowledgeEntry,
  MetaTier,
  ScoreBreakdown,
  StrategyMode,
  TeamAnalysis
} from '../types/domain';

type RoleFlag =
  | 'tank'
  | 'assassin'
  | 'thrower'
  | 'longRange'
  | 'healer'
  | 'wallBreak'
  | 'control'
  | 'burst'
  | 'highDps'
  | 'antiTank'
  | 'antiAssassin'
  | 'mobility'
  | 'sustain'
  | 'objective';

export interface CompositionProfile {
  brawlers: Brawler[];
  tags: Set<string>;
  weaknessTags: Set<string>;
  hasTank: boolean;
  hasAssassin: boolean;
  hasThrower: boolean;
  hasLongRange: boolean;
  hasHealer: boolean;
  hasWallBreak: boolean;
  hasControl: boolean;
  hasBurst: boolean;
  hasHighDps: boolean;
  lacksRange: boolean;
  lacksControl: boolean;
  lacksWallBreak: boolean;
  lacksAntiTank: boolean;
  lacksAntiAssassin: boolean;
  lacksDamage: boolean;
  lacksSurvivability: boolean;
  lacksObjectivePressure: boolean;
}

const tierScore: Record<MetaTier, number> = {
  S: 10,
  A: 7,
  B: 4,
  C: 1,
  D: -3
};

const strategyWeights: Record<
  StrategyMode,
  { map: number; mode: number; synergy: number; directCounter: number; tagCounter: number; allyNeed: number; meta: number; knowledge: number; risk: number }
> = {
  balanced: { map: 0.9, mode: 0.9, synergy: 0.75, directCounter: 1, tagCounter: 0.95, allyNeed: 0.95, meta: 0.7, knowledge: 0.6, risk: 1 },
  safe: { map: 0.95, mode: 1, synergy: 1.05, directCounter: 0.9, tagCounter: 0.85, allyNeed: 1.1, meta: 0.9, knowledge: 0.7, risk: 1.2 },
  aggressive: { map: 0.8, mode: 0.8, synergy: 0.6, directCounter: 1.25, tagCounter: 1.2, allyNeed: 0.8, meta: 0.55, knowledge: 0.45, risk: 0.8 },
  pro: { map: 1, mode: 0.9, synergy: 1, directCounter: 1.05, tagCounter: 1, allyNeed: 1.1, meta: 0.8, knowledge: 1.25, risk: 1 },
  ladder: { map: 0.8, mode: 0.95, synergy: 0.65, directCounter: 0.9, tagCounter: 0.85, allyNeed: 0.8, meta: 1.25, knowledge: 0.4, risk: 0.85 }
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

function displayName(brawler: Brawler) {
  return brawler.displayNameZh?.trim() || brawler.name;
}

function relationTargetId(relation: CounterReference) {
  return typeof relation === 'string' ? relation : relation.targetId;
}

function relationStrength(relation: CounterReference) {
  return typeof relation === 'string' ? 6 : relation.strength;
}

function relationReason(relation: CounterReference) {
  return typeof relation === 'string' ? '' : relation.reason;
}

function hasTag(tags: Set<string>, ...candidates: string[]) {
  return candidates.some((tag) => tags.has(tag));
}

function inferBrawlerTags(brawler: Brawler) {
  const tags = new Set<string>([...(brawler.tags ?? []), ...(brawler.synergyTags ?? []), ...brawler.roles]);
  const s = brawler.stats;

  if (s.range >= 8 || hasRole(brawler, 'sniper')) tags.add('long_range');
  if (hasRole(brawler, 'thrower')) tags.add('thrower');
  if (hasRole(brawler, 'assassin')) tags.add('assassin');
  if (hasRole(brawler, 'tank')) tags.add('tank');
  if (hasRole(brawler, 'support') || s.sustain >= 8) tags.add('healer');
  if (s.wallBreak >= 6 || hasRole(brawler, 'wall_breaker')) tags.add('wall_break');
  if (s.burst >= 7) tags.add('burst_damage');
  if (s.dps >= 7) tags.add('safe_dps');
  if (s.control >= 7 || hasRole(brawler, 'controller')) tags.add('area_control');
  if (s.control >= 7 || hasRole(brawler, 'mid')) tags.add('mid_control');
  if (s.mobility >= 8 || s.engage >= 7) tags.add('mobility');
  if (s.sustain >= 7) tags.add('sustain');
  if (s.zoneHold >= 7) tags.add('objective_control');
  if (s.dps >= 7 || s.control >= 7) tags.add('anti_tank');
  if (s.antiAssassin >= 7 || s.control >= 7 || s.survivability >= 8) tags.add('anti_assassin');
  if (s.control >= 8) tags.add('crowd_control');
  if (s.survivability >= 8) tags.add('shield');
  if (s.ballCarry >= 7 || hasRole(brawler, 'lane')) tags.add('lane_pressure');

  return tags;
}

function inferWeaknessTags(brawler: Brawler) {
  const tags = new Set<string>([...(brawler.weaknessTags ?? []), ...(brawler.riskTags ?? [])]);
  const s = brawler.stats;

  if (s.range <= 4) tags.add('short_range');
  if (s.survivability <= 4) tags.add('low_hp');
  if (s.mobility <= 4 && s.survivability <= 5) tags.add('poor_escape');
  if (s.burst <= 4) tags.add('low_burst');
  if (s.range <= 5) tags.add('weak_to_long_range');
  if (s.wallBreak <= 1 && s.range >= 8) tags.add('weak_to_thrower');
  if (s.antiAssassin <= 4 || hasRole(brawler, 'thrower')) tags.add('weak_to_assassin');
  if (s.dps <= 5 && s.control <= 5) tags.add('weak_to_tank');
  if (s.wallBreak <= 1 && (hasRole(brawler, 'sniper') || hasRole(brawler, 'thrower'))) tags.add('weak_to_wall_break');
  if (s.mobility <= 4) tags.add('weak_to_crowd_control');
  if (brawler.weaknesses?.some((item) => item.includes('reload'))) tags.add('reload_dependent');

  return tags;
}

function getFlag(profile: CompositionProfile, flag: RoleFlag) {
  const value = {
    tank: profile.hasTank,
    assassin: profile.hasAssassin,
    thrower: profile.hasThrower,
    longRange: profile.hasLongRange,
    healer: profile.hasHealer,
    wallBreak: profile.hasWallBreak,
    control: profile.hasControl,
    burst: profile.hasBurst,
    highDps: profile.hasHighDps,
    antiTank: hasTag(profile.tags, 'anti_tank'),
    antiAssassin: hasTag(profile.tags, 'anti_assassin'),
    mobility: hasTag(profile.tags, 'mobility'),
    sustain: hasTag(profile.tags, 'sustain'),
    objective: hasTag(profile.tags, 'objective_control')
  }[flag];
  return value;
}

function buildCompositionProfile(brawlers: Brawler[]): CompositionProfile {
  const tags = new Set<string>();
  const weaknessTags = new Set<string>();
  for (const brawler of brawlers) {
    inferBrawlerTags(brawler).forEach((tag) => tags.add(tag));
    inferWeaknessTags(brawler).forEach((tag) => weaknessTags.add(tag));
  }

  const avg = (selector: (brawler: Brawler) => number) => (brawlers.length ? brawlers.reduce((sum, brawler) => sum + selector(brawler), 0) / brawlers.length : 0);

  return {
    brawlers,
    tags,
    weaknessTags,
    hasTank: hasTag(tags, 'tank'),
    hasAssassin: hasTag(tags, 'assassin'),
    hasThrower: hasTag(tags, 'thrower'),
    hasLongRange: hasTag(tags, 'long_range'),
    hasHealer: hasTag(tags, 'healer', 'sustain'),
    hasWallBreak: hasTag(tags, 'wall_break'),
    hasControl: hasTag(tags, 'area_control', 'mid_control', 'crowd_control'),
    hasBurst: hasTag(tags, 'burst_damage'),
    hasHighDps: hasTag(tags, 'safe_dps'),
    lacksRange: brawlers.length > 0 && avg((b) => b.stats.range) < 6,
    lacksControl: brawlers.length > 0 && avg((b) => b.stats.control) < 6,
    lacksWallBreak: !hasTag(tags, 'wall_break'),
    lacksAntiTank: !hasTag(tags, 'anti_tank'),
    lacksAntiAssassin: !hasTag(tags, 'anti_assassin'),
    lacksDamage: brawlers.length > 0 && avg((b) => Math.max(b.stats.dps, b.stats.burst)) < 6,
    lacksSurvivability: brawlers.length > 0 && avg((b) => b.stats.survivability) < 6,
    lacksObjectivePressure: brawlers.length > 0 && !hasTag(tags, 'objective_control', 'safe_dps')
  };
}

export function analyzeEnemyComposition(enemyPicks: string[], heroes: Brawler[]) {
  return buildCompositionProfile(enemyPicks.map((id) => heroes.find((hero) => hero.id === id)).filter(Boolean) as Brawler[]);
}

export function analyzeAllyComposition(allyPicks: string[], heroes: Brawler[]) {
  return buildCompositionProfile(allyPicks.map((id) => heroes.find((hero) => hero.id === id)).filter(Boolean) as Brawler[]);
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

export function calculateDirectCounterScore(candidate: Brawler, enemyPicks: string[], heroes: Brawler[]) {
  const reasons: string[] = [];
  const risks: string[] = [];
  let score = 0;
  const enemyBrawlers = enemyPicks.map((id) => heroes.find((hero) => hero.id === id)).filter(Boolean) as Brawler[];

  for (const enemy of enemyBrawlers) {
    const directCounter = candidate.counters?.find((item) => relationTargetId(item) === enemy.id);
    if (directCounter) {
      const strength = relationStrength(directCounter);
      score += strength * 4;
      reasons.push(`直接克制 ${displayName(enemy)}：${displayName(candidate)} 对该英雄有明确对位优势，可以限制敌方核心发挥。`);
    }

    const punishedByEnemy = candidate.counteredBy?.find((item) => relationTargetId(item) === enemy.id);
    const enemyCountersCandidate = enemy.counters?.find((item) => relationTargetId(item) === candidate.id);
    const threat = punishedByEnemy ?? enemyCountersCandidate;
    if (threat) {
      const strength = relationStrength(threat);
      score -= strength * 3;
      risks.push(`敌方 ${displayName(enemy)} 可能反制 ${displayName(candidate)}，这个选择需要队友保护。`);
    }
  }

  return { score: clampScore(score), reasons, risks };
}

export function calculateCounterScore(candidate: Brawler, enemyBrawlers: Brawler[]) {
  return calculateDirectCounterScore(candidate, enemyBrawlers.map((brawler) => brawler.id), enemyBrawlers);
}

export function calculateTagCounterScore(candidate: Brawler, enemyProfile: CompositionProfile) {
  const tags = inferBrawlerTags(candidate);
  const reasons: string[] = [];
  const risks: string[] = [];
  let score = 0;

  if (!enemyProfile.brawlers.length) return { score, reasons, risks };

  if (enemyProfile.hasTank && hasTag(tags, 'anti_tank', 'safe_dps', 'area_control', 'crowd_control')) {
    score += 14;
    reasons.push('针对敌方已选坦克英雄，该英雄具备反坦克、控制或持续输出能力，能限制敌方正面推进。');
  }
  if (enemyProfile.hasAssassin && hasTag(tags, 'anti_assassin', 'crowd_control', 'shield', 'sustain')) {
    score += 14;
    reasons.push('敌方已经选择刺客英雄，该英雄具备反刺客、控制或高生存能力，能降低我方后排被切入的风险。');
  }
  if (enemyProfile.hasThrower && hasTag(tags, 'assassin', 'mobility', 'wall_break')) {
    score += 16;
    reasons.push('敌方已经选择投掷英雄，我方选择高机动或破墙英雄可以绕开墙体压制后排。');
  }
  if (enemyProfile.hasLongRange && hasTag(tags, 'assassin', 'mobility', 'wall_break', 'lane_pressure')) {
    score += 10;
    reasons.push('针对敌方长手阵容，该英雄能通过突进、绕后或破墙压缩敌方输出空间。');
  }
  if (enemyProfile.hasHealer && hasTag(tags, 'burst_damage', 'safe_dps', 'area_control', 'crowd_control')) {
    score += 8;
    reasons.push('敌方有治疗或续航能力，该英雄可以用爆发、高 DPS 或控制压制敌方持续作战。');
  }
  if (enemyProfile.hasWallBreak && hasTag(tags, 'mobility', 'sustain', 'mid_control')) {
    score += 8;
    reasons.push('敌方具备破墙能力，该英雄机动性、续航或中路控制较好，能适应地形被打开后的对线。');
  }
  if (hasTag(enemyProfile.weaknessTags, 'weak_to_assassin') && hasTag(tags, 'assassin', 'mobility')) {
    score += 8;
    reasons.push('敌方阵容缺少反刺客能力，该英雄可以作为后手切入点。');
  }
  if (hasTag(enemyProfile.weaknessTags, 'weak_to_long_range') && hasTag(tags, 'long_range')) {
    score += 10;
    reasons.push('敌方阵容射程压力不足，该英雄可以用长手消耗建立对线优势。');
  }

  if (enemyProfile.hasAssassin && hasTag(inferWeaknessTags(candidate), 'weak_to_assassin', 'poor_escape', 'low_hp')) {
    score -= 12;
    risks.push('敌方已有刺客，而该英雄自保偏弱，容易成为切入目标。');
  }
  if (enemyProfile.hasThrower && hasTag(inferWeaknessTags(candidate), 'weak_to_thrower')) {
    score -= 8;
    risks.push('敌方投掷能限制该英雄输出角度，需要谨慎选择。');
  }

  return { score: clampScore(score), reasons, risks };
}

export function calculateAllyNeedScore(candidate: Brawler, allyProfile: CompositionProfile, map?: BrawlMap) {
  const tags = inferBrawlerTags(candidate);
  const reasons: string[] = [];
  let score = 0;

  if (!allyProfile.brawlers.length) return { score, reasons };

  if (allyProfile.lacksRange && hasTag(tags, 'long_range')) {
    score += 10;
    reasons.push('我方目前缺少射程，该英雄可以补足远程消耗和对线压制。');
  }
  if (allyProfile.lacksControl && hasTag(tags, 'area_control', 'mid_control', 'crowd_control')) {
    score += 10;
    reasons.push('我方目前缺少控场，该英雄能补中路控制和区域压制。');
  }
  if (allyProfile.lacksWallBreak && hasTag(tags, 'wall_break')) {
    score += map && map.wallBreakValue >= 6 ? 14 : 10;
    reasons.push(map && map.wallBreakValue >= 6 ? '我方目前缺少破墙能力，而这张图墙体价值较高，因此该英雄能改善阵容结构。' : '我方目前缺少破墙能力，该英雄能打开关键路线。');
  }
  if (allyProfile.lacksAntiTank && hasTag(tags, 'anti_tank', 'safe_dps')) {
    score += 10;
    reasons.push('我方目前缺少反坦克和持续输出，该英雄能补足处理前排的能力。');
  }
  if (allyProfile.lacksAntiAssassin && hasTag(tags, 'anti_assassin', 'crowd_control', 'shield')) {
    score += 10;
    reasons.push('我方目前缺少反刺客能力，该英雄能保护后排并限制敌方切入。');
  }
  if (allyProfile.lacksDamage && hasTag(tags, 'burst_damage', 'safe_dps')) {
    score += 8;
    reasons.push('我方目前输出不足，该英雄能补充爆发或稳定伤害。');
  }
  if (allyProfile.lacksSurvivability && hasTag(tags, 'sustain', 'shield', 'healer')) {
    score += 8;
    reasons.push('我方目前生存和续航偏弱，该英雄能提高长回合容错。');
  }
  if (allyProfile.lacksObjectivePressure && hasTag(tags, 'objective_control', 'safe_dps')) {
    score += 8;
    reasons.push('我方目前目标压制不足，该英雄能提升站点、金库或中路目标处理能力。');
  }

  return { score: clampScore(score), reasons };
}

export function generateCounterReasons(candidate: Brawler, enemyPicks: Brawler[], enemyProfile: CompositionProfile, allyProfile: CompositionProfile) {
  const tags = inferBrawlerTags(candidate);
  const reasons: string[] = [];
  const enemyNames = enemyPicks.map(displayName);

  if (enemyNames.length && hasTag(tags, 'anti_tank') && enemyProfile.hasTank) {
    reasons.push(`针对敌方 ${enemyNames.join('、')} 的前排压力，${displayName(candidate)} 可以用持续输出或控制限制推进。`);
  }
  if (enemyNames.length && hasTag(tags, 'anti_assassin') && enemyProfile.hasAssassin) {
    reasons.push(`敌方已选刺客，${displayName(candidate)} 的反刺客能力能保护我方关键位置。`);
  }
  if (enemyProfile.hasThrower && hasTag(tags, 'assassin', 'mobility', 'wall_break')) {
    reasons.push(`敌方有投掷英雄，${displayName(candidate)} 可以通过突进、绕后或破墙处理墙后威胁。`);
  }
  if (enemyProfile.hasLongRange && hasTag(tags, 'assassin', 'mobility', 'wall_break')) {
    reasons.push(`敌方长手较多，${displayName(candidate)} 能压缩敌方站位，减少被远程白白消耗。`);
  }
  if (enemyProfile.hasHealer && hasTag(tags, 'burst_damage', 'safe_dps', 'crowd_control')) {
    reasons.push(`敌方有续航点，${displayName(candidate)} 可以用爆发、持续伤害或控制打断敌方节奏。`);
  }
  if (allyProfile.lacksWallBreak && hasTag(tags, 'wall_break')) {
    reasons.push(`我方缺少破墙能力，${displayName(candidate)} 能补足地形处理。`);
  }
  if (allyProfile.lacksControl && hasTag(tags, 'area_control', 'mid_control', 'crowd_control')) {
    reasons.push(`我方缺少控场，${displayName(candidate)} 能补充中路和关键区域压制。`);
  }
  if (allyProfile.lacksDamage && hasTag(tags, 'burst_damage', 'safe_dps')) {
    reasons.push(`我方输出不足，${displayName(candidate)} 能补稳定伤害或爆发窗口。`);
  }

  return reasons;
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
  const enemyProfile = analyzeEnemyComposition(draft.enemyPicks, allBrawlers);
  const allyProfile = analyzeAllyComposition(draft.allyPicks, allBrawlers);
  const mapFit = calculateMapFitScore(candidate, map);
  const modeFit = calculateModeFitScore(candidate, map.gameMode);
  const synergy = calculateSynergyScore(candidate, allyBrawlers);
  const directCounter = calculateDirectCounterScore(candidate, draft.enemyPicks, allBrawlers);
  const tagCounter = calculateTagCounterScore(candidate, enemyProfile);
  const allyNeed = calculateAllyNeedScore(candidate, allyProfile, map);
  const knowledgeScore = calculateKnowledgeScore(candidate, map, knowledge);
  const meta = calculateMetaScore(candidate, draft.considerMeta);
  const generatedCounterReasons = generateCounterReasons(candidate, enemyBrawlers, enemyProfile, allyProfile);
  const counterScore = directCounter.score + tagCounter.score;
  const riskScore = Math.max(0, -directCounter.score) + directCounter.risks.length * 4 + tagCounter.risks.length * 4;
  const weights = strategyWeights[draft.strategyMode];
  const total = clampScore(
    mapFit.score * weights.map +
      modeFit.score * weights.mode +
      synergy.score * weights.synergy +
      directCounter.score * weights.directCounter +
      tagCounter.score * weights.tagCounter +
      allyNeed.score * weights.allyNeed +
      meta * weights.meta +
      knowledgeScore.score * weights.knowledge -
      riskScore * weights.risk
  );
  const reasons = [
    ...directCounter.reasons,
    ...tagCounter.reasons,
    ...generatedCounterReasons,
    ...allyNeed.reasons,
    ...mapFit.reasons,
    ...modeFit.reasons,
    ...synergy.reasons,
    ...knowledgeScore.reasons
  ];

  return {
    mapFit: Math.round(mapFit.score),
    modeFit: Math.round(modeFit.score),
    synergy: Math.round(synergy.score),
    counter: Math.round(counterScore),
    directCounter: Math.round(directCounter.score),
    tagCounter: Math.round(tagCounter.score),
    allyNeed: Math.round(allyNeed.score),
    risk: Math.round(riskScore),
    meta: Math.round(meta),
    knowledge: Math.round(knowledgeScore.score),
    total: Math.round(total),
    reasons: reasons.length ? Array.from(new Set(reasons)).slice(0, 6) : ['该英雄在当前地图和模式下综合适配度较高，可作为稳定补位选择。'],
    risks: [...mapFit.risks, ...modeFit.risks, ...synergy.risks, ...directCounter.risks, ...tagCounter.risks].slice(0, 6),
    tags: [...candidate.roles, candidate.metaTier].slice(0, 5)
  };
}

export function calculateBanScore(candidate: Brawler, map: BrawlMap, draft: DraftState, allBrawlers: Brawler[], knowledge: KnowledgeEntry[]) {
  const pseudoDraft: DraftState = { ...draft, allyPicks: [], enemyPicks: draft.allyPicks };
  const baseScore = calculatePickScore(candidate, map, pseudoDraft, allBrawlers, knowledge);
  const allyBrawlers = draft.allyPicks.map((id) => allBrawlers.find((b) => b.id === id)).filter(Boolean) as Brawler[];
  const reasons: string[] = [];
  const protectsAgainst: string[] = [];
  let threat = baseScore.mapFit * 0.35 + baseScore.modeFit * 0.35 + baseScore.meta * 1.2 + baseScore.counter * 0.35;

  for (const ally of allyBrawlers) {
    const relation = candidate.counters?.find((item) => relationTargetId(item) === ally.id);
    if (relation) {
      threat += relationStrength(relation) * 4;
      protectsAgainst.push(`${displayName(candidate)} 克制我方 ${displayName(ally)}`);
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
    const answers = allyBrawlers.filter((ally) => ally.counters?.some((counter) => relationTargetId(counter) === enemy.id));
    if (answers.length) {
      counterPlan.push(`用 ${answers.map(displayName).join('/')} 处理 ${displayName(enemy)}。`);
    } else {
      counterPlan.push(`敌方 ${displayName(enemy)} 暂无明确克制点，后手优先补克制选择。`);
    }
  }

  return {
    strengths: strengths.length ? strengths : ['当前阵容信息不足，建议先补稳定中路或强势边路。'],
    risks: risks.length ? risks : ['暂无明显结构性风险。'],
    counterPlan: counterPlan.length ? counterPlan : ['等待敌方更多选择后生成克制计划。']
  };
}
