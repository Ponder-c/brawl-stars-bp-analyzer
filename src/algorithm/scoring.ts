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
import { draftWeights, getDraftStage, getDraftStageReason } from './draft';
import { calculateVersionAwareScore } from './versionScoring';

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

function clampPositiveScore(value: number) {
  return Math.max(0, Math.min(100, value));
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
  const tags = inferBrawlerTags(brawler);
  const weaknessTags = inferWeaknessTags(brawler);
  const reasons: string[] = [];
  const risks: string[] = [];
  let score = 6;
  const s = brawler.stats;
  const openness = map.openness ?? 5;
  const wallDensity = map.wallDensity ?? 5;
  const bushDensity = map.bushDensity ?? 4;
  const chokePoints = map.chokePoints ?? 3;
  const wallBreakValue = map.wallBreakValue ?? Math.max(3, Math.round(wallDensity));
  const openPressure = Math.max(0, openness - Math.max(wallDensity, bushDensity) * 0.45);
  const wallPressure = Math.max(0, wallDensity + wallBreakValue * 0.5 - openness * 0.35);
  const bushPressure = Math.max(0, bushDensity - openness * 0.25);

  score += closeTo(s.range, openness, 0.7);
  score += Math.max(0, 10 - Math.abs(s.control - chokePoints - 3)) * 0.5;

  if (openness >= 7 || map.sniperFriendly) {
    score += openPressure * 2.4 + s.range * 1.5 + s.burst * 0.45 + (hasTag(tags, 'long_range') ? 12 : 0);
    reasons.push('地图适配：该地图开阔，适合长手压制、远程消耗和稳定对线。');
    if (hasTag(tags, 'tank', 'short_range') && bushDensity <= 4 && wallDensity <= 5 && s.mobility < 8) {
      score -= 24;
      risks.push('风险：该地图开阔且缺少草丛/掩体，短手或坦克进场困难。');
    }
  }

  if (wallDensity >= 6 || map.throwerFriendly) {
    score += wallPressure * 2.1 + s.control * 0.9 + s.wallBreak * 1.2;
    if (hasTag(tags, 'thrower')) score += 16;
    if (hasTag(tags, 'wall_break')) score += 12;
    if (hasTag(tags, 'assassin') && bushDensity >= 5) score += 6;
    reasons.push('地图适配：该地图墙体较多，投掷、破墙和绕墙输出价值更高。');
    if (s.wallBreak <= 1 && s.range >= 8 && !hasTag(tags, 'thrower')) {
      score -= 14;
      risks.push('风险：墙多会限制纯长手的输出角度。');
    }
  }

  if (bushDensity >= 6 || map.assassinFriendly || map.tankFriendly) {
    score += bushPressure * 2.4 + s.mobility * 0.9 + s.antiAssassin * 0.7 + s.control * 0.65;
    if (hasTag(tags, 'assassin', 'tank')) score += 14;
    if (hasTag(tags, 'grass_reveal', 'bush_control', 'area_control', 'crowd_control')) score += 10;
    reasons.push('地图适配：该地图草丛较多，需要探草、控草或近身压制能力。');
    if (s.antiAssassin < 5 && hasTag(weaknessTags, 'low_hp', 'poor_escape')) {
      score -= 14;
      risks.push('风险：草多时自保弱的远程英雄容易被突然近身。');
    }
    if (hasTag(tags, 'long_range') && !hasTag(tags, 'grass_reveal', 'area_control', 'crowd_control') && s.antiAssassin < 6) {
      score -= 10;
      risks.push('风险：该英雄偏远程但探草和反突进不足。');
    }
  }

  if (chokePoints >= 5) {
    score += chokePoints * 1.4 + s.control;
    if (hasTag(tags, 'area_control', 'crowd_control', 'thrower')) score += 11;
    reasons.push('地图适配：该地图关键路口多，控场、群控和投掷封锁更有价值。');
  }

  if (wallBreakValue >= 6) {
    if (hasTag(tags, 'wall_break')) {
      score += wallBreakValue * 2.1;
      reasons.push('地图适配：该地图破墙价值高，可以打开关键路线并改变对线空间。');
    }
    if (hasTag(tags, 'thrower') && s.wallBreak <= 1) {
      risks.push('风险：该英雄依赖墙体，遇到高破墙阵容时强度会下降。');
    }
  }

  if (map.laneStructure === 'open' && hasTag(tags, 'long_range')) score += 9;
  if (map.laneStructure === 'three_lane' && hasTag(tags, 'lane_pressure', 'long_range', 'duelist')) {
    score += 9;
    reasons.push('地图适配：三路分明，边路压制、长手对线或单挑能力更重要。');
  }
  if (map.laneStructure === 'center_control' && hasTag(tags, 'mid_control', 'area_control', 'sustain')) {
    score += 10;
    reasons.push('地图适配：中心争夺强，中路控制、区域压制和续航更重要。');
  }
  if (map.laneStructure === 'split' && hasTag(tags, 'mobility', 'lane_pressure', 'duelist')) score += 8;
  if (map.strongBrawlerTags?.some((tag) => hasTag(tags, tag, tag === 'sniper' ? 'long_range' : tag))) score += 8;
  if (map.weakBrawlerTags?.some((tag) => hasTag(tags, tag, tag === 'short_range' ? 'short_range' : tag))) {
    score -= 12;
    risks.push('风险：该英雄的标签命中这张图的弱势类型。');
  }

  return { score: clampPositiveScore(score), reasons: Array.from(new Set(reasons)).slice(0, 3), risks };
}

export function calculateModeFitScore(brawler: Brawler, mode: GameMode) {
  const tags = inferBrawlerTags(brawler);
  const reasons: string[] = [];
  const risks: string[] = [];
  const s = brawler.stats;
  let score = 18;

  if (mode === 'brawl_ball') {
    score += s.control * 1.8 + s.wallBreak * 1.6 + s.engage * 1.5 + s.ballCarry * 1.6 + (hasTag(tags, 'crowd_control') ? 8 : 0);
    if (s.engage >= 7 || s.control >= 7) reasons.push('模式适配：足球需要控场、开团和推进能力。');
    if (s.wallBreak >= 6) reasons.push('模式适配：能打开球门前路线，提升进球威胁。');
    if (s.ballCarry < 3) risks.push('控球和终结进球能力偏弱。');
  }
  if (mode === 'gem_grab') {
    score += s.control * 2 + s.sustain * 1.3 + s.survivability * 1.4 + s.dps + (hasTag(tags, 'mid_control') ? 10 : 0);
    if (hasRole(brawler, 'mid') || s.control >= 7) reasons.push('模式适配：宝石图重视中路控制、生存和持续压制。');
    if (s.survivability < 5) risks.push('持宝容错偏低。');
  }
  if (mode === 'hot_zone') {
    score += s.zoneHold * 2.1 + s.control * 1.7 + s.sustain * 1.4 + s.dps * 0.9 + (hasTag(tags, 'area_control', 'objective_control') ? 10 : 0);
    if (s.zoneHold >= 7 || s.control >= 7) reasons.push('模式适配：热区需要控场、AOE、续航和站点能力。');
    if (s.range <= 3 && s.sustain < 7) risks.push('进点容易被消耗。');
  }
  if (mode === 'heist') {
    score += s.dps * 2.4 + s.burst * 1.4 + s.wallBreak * 1.5 + s.mobility + (hasTag(tags, 'safe_dps', 'wall_break') ? 10 : 0);
    if (s.dps >= 8 || s.wallBreak >= 6) reasons.push('模式适配：金库需要高 DPS、爆发、破墙和进攻路线能力。');
    if (s.dps < 5) risks.push('对金库伤害不足。');
  }
  if (mode === 'bounty' || mode === 'knockout' || mode === 'wipeout') {
    score += s.range * 2 + s.survivability * 1.6 + s.antiAssassin * 1.2 + s.burst * 1.2 + (hasTag(tags, 'long_range') ? 12 : 0);
    if (s.range >= 8 || s.survivability >= 7) reasons.push('模式适配：淘汰/赏金重视射程、生存和反刺客能力。');
    if (s.survivability < 5) risks.push('被击杀代价高，容错偏低。');
  }
  if (mode === 'duels') {
    score += s.burst * 1.6 + s.survivability * 1.5 + s.mobility * 1.2 + s.antiAssassin * 1.2;
    if (s.burst >= 7) reasons.push('模式适配：单挑爆发窗口明确。');
  }

  return { score: clampPositiveScore(score), reasons, risks };
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
  const tags = inferBrawlerTags(candidate);
  const weaknessTags = inferWeaknessTags(candidate);
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

    const enemyTags = inferBrawlerTags(enemy);
    const enemyWeaknessTags = inferWeaknessTags(enemy);
    if (hasTag(enemyTags, 'tank') && hasTag(tags, 'anti_tank', 'safe_dps', 'area_control', 'crowd_control')) {
      score += 18;
      reasons.push(`克制了敌方 ${displayName(enemy)}：反坦克、控制或持续输出能限制前排推进。`);
    }
    if (hasTag(enemyTags, 'assassin') && hasTag(tags, 'anti_assassin', 'crowd_control', 'sustain', 'shield')) {
      score += 18;
      reasons.push(`克制了敌方 ${displayName(enemy)}：反刺客、控制或高生存能降低被切入风险。`);
    }
    if (hasTag(enemyTags, 'thrower') && hasTag(tags, 'assassin', 'mobility', 'wall_break')) {
      score += 20;
      reasons.push(`克制了敌方 ${displayName(enemy)}：突进、绕后或破墙能处理墙后投掷威胁。`);
    }
    if (hasTag(enemyTags, 'long_range') && hasTag(tags, 'assassin', 'mobility', 'wall_break', 'lane_pressure')) {
      score += 12;
      reasons.push(`克制了敌方 ${displayName(enemy)}：能压缩长手站位或打破远程输出环境。`);
    }
    if (hasTag(enemyWeaknessTags, 'weak_to_assassin') && hasTag(tags, 'assassin', 'mobility')) {
      score += 10;
      reasons.push(`克制了敌方 ${displayName(enemy)}：对方怕突进，该英雄可作为后手切入点。`);
    }
    if (hasTag(enemyWeaknessTags, 'weak_to_long_range', 'short_range') && hasTag(tags, 'long_range')) {
      score += 10;
      reasons.push(`克制了敌方 ${displayName(enemy)}：可以利用射程差持续消耗。`);
    }
    if (hasTag(enemyTags, 'assassin') && hasTag(weaknessTags, 'weak_to_assassin', 'poor_escape', 'low_hp')) {
      score -= 16;
      risks.push(`风险：敌方 ${displayName(enemy)} 能威胁该英雄，自保不足时容易被切。`);
    }
    if (hasTag(enemyTags, 'thrower') && hasTag(weaknessTags, 'weak_to_thrower')) {
      score -= 10;
      risks.push(`风险：敌方 ${displayName(enemy)} 的投掷压制会限制该英雄输出角度。`);
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
    score += 24;
    reasons.push('针对敌方已选坦克英雄，该英雄具备反坦克、控制或持续输出能力，能限制敌方正面推进。');
  }
  if (enemyProfile.hasTank && !hasTag(tags, 'anti_tank', 'safe_dps', 'area_control', 'crowd_control')) {
    score -= 10;
    risks.push('敌方已有坦克，但该英雄处理前排能力有限，不能只靠版本强度优先。');
  }
  if (enemyProfile.hasAssassin && hasTag(tags, 'anti_assassin', 'crowd_control', 'shield', 'sustain')) {
    score += 24;
    reasons.push('敌方已经选择刺客英雄，该英雄具备反刺客、控制或高生存能力，能降低我方后排被切入的风险。');
  }
  if (enemyProfile.hasThrower && hasTag(tags, 'assassin', 'mobility', 'wall_break')) {
    score += 28;
    reasons.push('敌方已经选择投掷英雄，我方选择高机动或破墙英雄可以绕开墙体压制后排。');
  }
  if (enemyProfile.hasLongRange && hasTag(tags, 'assassin', 'mobility', 'wall_break', 'lane_pressure')) {
    score += 16;
    reasons.push('针对敌方长手阵容，该英雄能通过突进、绕后或破墙压缩敌方输出空间。');
  }
  if (enemyProfile.hasHealer && hasTag(tags, 'burst_damage', 'safe_dps', 'area_control', 'crowd_control')) {
    score += 12;
    reasons.push('敌方有治疗或续航能力，该英雄可以用爆发、高 DPS 或控制压制敌方持续作战。');
  }
  if (enemyProfile.hasWallBreak && hasTag(tags, 'mobility', 'sustain', 'mid_control')) {
    score += 8;
    reasons.push('敌方具备破墙能力，该英雄机动性、续航或中路控制较好，能适应地形被打开后的对线。');
  }
  if (hasTag(enemyProfile.weaknessTags, 'weak_to_assassin') && hasTag(tags, 'assassin', 'mobility')) {
    score += 14;
    reasons.push('敌方阵容缺少反刺客能力，该英雄可以作为后手切入点。');
  }
  if (hasTag(enemyProfile.weaknessTags, 'weak_to_long_range') && hasTag(tags, 'long_range')) {
    score += 16;
    reasons.push('敌方阵容射程压力不足，该英雄可以用长手消耗建立对线优势。');
  }

  if (enemyProfile.hasAssassin && hasTag(inferWeaknessTags(candidate), 'weak_to_assassin', 'poor_escape', 'low_hp')) {
    score -= 18;
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
    score += 16;
    reasons.push('我方目前缺少射程，该英雄可以补足远程消耗和对线压制。');
  }
  if (allyProfile.lacksControl && hasTag(tags, 'area_control', 'mid_control', 'crowd_control')) {
    score += 16;
    reasons.push('我方目前缺少控场，该英雄能补中路控制和区域压制。');
  }
  if (allyProfile.lacksWallBreak && hasTag(tags, 'wall_break')) {
    score += map && map.wallBreakValue >= 6 ? 20 : 15;
    reasons.push(map && map.wallBreakValue >= 6 ? '我方目前缺少破墙能力，而这张图墙体价值较高，因此该英雄能改善阵容结构。' : '我方目前缺少破墙能力，该英雄能打开关键路线。');
  }
  if (allyProfile.lacksAntiTank && hasTag(tags, 'anti_tank', 'safe_dps')) {
    score += 16;
    reasons.push('我方目前缺少反坦克和持续输出，该英雄能补足处理前排的能力。');
  }
  if (allyProfile.lacksAntiAssassin && hasTag(tags, 'anti_assassin', 'crowd_control', 'shield')) {
    score += 16;
    reasons.push('我方目前缺少反刺客能力，该英雄能保护后排并限制敌方切入。');
  }
  if (allyProfile.lacksDamage && hasTag(tags, 'burst_damage', 'safe_dps')) {
    score += 13;
    reasons.push('我方目前输出不足，该英雄能补充爆发或稳定伤害。');
  }
  if (allyProfile.lacksSurvivability && hasTag(tags, 'sustain', 'shield', 'healer')) {
    score += 12;
    reasons.push('我方目前生存和续航偏弱，该英雄能提高长回合容错。');
  }
  if (allyProfile.lacksObjectivePressure && hasTag(tags, 'objective_control', 'safe_dps')) {
    score += 12;
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
  if (allyProfile.brawlers.length && allyProfile.lacksWallBreak && hasTag(tags, 'wall_break')) {
    reasons.push(`我方缺少破墙能力，${displayName(candidate)} 能补足地形处理。`);
  }
  if (allyProfile.brawlers.length && allyProfile.lacksControl && hasTag(tags, 'area_control', 'mid_control', 'crowd_control')) {
    reasons.push(`我方缺少控场，${displayName(candidate)} 能补充中路和关键区域压制。`);
  }
  if (allyProfile.brawlers.length && allyProfile.lacksDamage && hasTag(tags, 'burst_damage', 'safe_dps')) {
    reasons.push(`我方输出不足，${displayName(candidate)} 能补稳定伤害或爆发窗口。`);
  }

  return reasons;
}

export function generateRecommendationReasons(
  candidate: Brawler,
  context: {
    map: BrawlMap;
    mapFit: ReturnType<typeof calculateMapFitScore>;
    modeFit: ReturnType<typeof calculateModeFitScore>;
    directCounter: ReturnType<typeof calculateDirectCounterScore>;
    tagCounter: ReturnType<typeof calculateTagCounterScore>;
    allyNeed: ReturnType<typeof calculateAllyNeedScore>;
    synergy: ReturnType<typeof calculateSynergyScore>;
    enemyBrawlers: Brawler[];
    allyProfile: CompositionProfile;
  }
) {
  const reasons: string[] = [];
  const tags = inferBrawlerTags(candidate);
  const enemyNames = context.enemyBrawlers.map(displayName);

  if (context.mapFit.reasons.length) {
    reasons.push(context.mapFit.reasons[0]);
  } else if (context.map.openness >= 7 && hasTag(tags, 'long_range')) {
    reasons.push('地图理由：这张图较开阔，该英雄能用射程和消耗建立优势。');
  } else if (context.map.wallDensity >= 6 && hasTag(tags, 'thrower', 'wall_break')) {
    reasons.push('地图理由：这张图墙体较多，该英雄能利用投掷或破墙创造空间。');
  } else if (context.map.bushDensity >= 6 && hasTag(tags, 'assassin', 'tank', 'area_control')) {
    reasons.push('地图理由：这张图草丛较多，该英雄适合控草、切入或正面压制。');
  }

  if (enemyNames.length && (context.directCounter.reasons.length || context.tagCounter.reasons.length)) {
    reasons.push((context.directCounter.reasons[0] ?? context.tagCounter.reasons[0]).replace('针对敌方已选', `针对敌方 ${enemyNames.join('、')}：`));
  }

  if (context.allyProfile.brawlers.length && context.allyNeed.reasons.length) {
    reasons.push(context.allyNeed.reasons[0]);
  }

  const risk = [...context.mapFit.risks, ...context.modeFit.risks, ...context.directCounter.risks, ...context.tagCounter.risks, ...context.synergy.risks][0];
  if (risk) reasons.push(`风险提示：${risk.replace(/^风险：/, '')}`);

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
  return considerMeta ? calculateVersionAwareScore(brawler, { map: {} as BrawlMap }).metaScore : 0;
}

function calculateSafetyScore(candidate: Brawler, enemyProfile: CompositionProfile) {
  let score = candidate.stats.survivability + candidate.stats.antiAssassin + candidate.stats.sustain;
  const weaknessTags = inferWeaknessTags(candidate);
  if (enemyProfile.hasAssassin && hasTag(weaknessTags, 'weak_to_assassin', 'poor_escape', 'low_hp')) score -= 10;
  if (enemyProfile.hasLongRange && hasTag(weaknessTags, 'weak_to_long_range', 'short_range')) score -= 6;
  if (enemyProfile.hasThrower && hasTag(weaknessTags, 'weak_to_thrower')) score -= 5;
  if (candidate.stats.range >= 6 && candidate.stats.survivability >= 5) score += 4;
  return clampScore(score);
}

function calculateVersatilityScore(candidate: Brawler) {
  const tags = inferBrawlerTags(candidate);
  const modeFlex = candidate.goodModes?.length ?? 0;
  const roleFlex = candidate.roles.length;
  const utilityTags = ['wall_break', 'area_control', 'mid_control', 'safe_dps', 'sustain', 'anti_assassin', 'anti_tank'];
  const utility = utilityTags.filter((tag) => tags.has(tag)).length;
  return clampScore(roleFlex * 5 + modeFlex * 3 + utility * 4 + (candidate.mapPreferences?.length ?? 0) * 2);
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
  const versionScore = calculateVersionAwareScore(candidate, { map });
  const meta = draft.considerMeta ? versionScore.metaScore : 0;
  const patchImpact = draft.considerMeta ? versionScore.patchImpact : 0;
  const trend = draft.considerMeta ? versionScore.trend : 0;
  const liveData = draft.considerMeta ? versionScore.liveData : 0;
  const stalenessPenalty = versionScore.stalenessPenalty;
  const safety = calculateSafetyScore(candidate, enemyProfile);
  const versatility = calculateVersatilityScore(candidate);
  const generatedCounterReasons = generateCounterReasons(candidate, enemyBrawlers, enemyProfile, allyProfile);
  const counterScore = directCounter.score + tagCounter.score;
  const riskScore = Math.max(0, -directCounter.score) + directCounter.risks.length * 6 + tagCounter.risks.length * 6 + mapFit.risks.length * 3 + modeFit.risks.length * 3;
  const strategy = strategyWeights[draft.strategyMode];
  const stage = getDraftStage(draft);
  const recommendationReasons = generateRecommendationReasons(candidate, {
    map,
    mapFit,
    modeFit,
    directCounter,
    tagCounter,
    allyNeed,
    synergy,
    enemyBrawlers,
    allyProfile
  });
  const total = clampPositiveScore(
    8 +
      mapFit.score * 0.35 * strategy.map +
      modeFit.score * 0.2 * strategy.mode +
      meta * 0.15 * strategy.meta +
      Math.max(0, counterScore) * 0.15 * strategy.directCounter +
      allyNeed.score * 0.1 * strategy.allyNeed +
      synergy.score * 0.05 * strategy.synergy +
      safety * 0.05 +
      versatility * 0.04 +
      patchImpact * 0.28 +
      trend * 0.18 +
      liveData * 0.16 -
      stalenessPenalty * 0.35 +
      knowledgeScore.score * strategy.knowledge * 0.3 -
      riskScore * 0.1 * strategy.risk
  );
  const reasons = [
    ...recommendationReasons,
    getDraftStageReason(draft),
    ...versionScore.reasons,
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
    safety: Math.round(safety),
    versatility: Math.round(versatility),
    draftStage: stage,
    meta: Math.round(meta),
    patchImpact: Math.round(patchImpact),
    trend: Math.round(trend),
    liveData: Math.round(liveData),
    stalenessPenalty: Math.round(stalenessPenalty),
    metaTierLabel: versionScore.brawlerMeta.metaTier,
    metaTrendLabel: versionScore.brawlerMeta.trend,
    metaConfidence: versionScore.freshness.confidence,
    metaStale: versionScore.freshness.stale,
    knowledge: Math.round(knowledgeScore.score),
    total: Math.round(total),
    reasons: reasons.length ? Array.from(new Set(reasons)).slice(0, 6) : ['该英雄在当前地图和模式下综合适配度较高，可作为稳定补位选择。'],
    risks: [...mapFit.risks, ...modeFit.risks, ...synergy.risks, ...directCounter.risks, ...tagCounter.risks].slice(0, 6),
    tags: [...inferBrawlerTags(candidate), candidate.metaTier].slice(0, 5)
  };
}

export function calculateBanScore(candidate: Brawler, map: BrawlMap, draft: DraftState, allBrawlers: Brawler[], knowledge: KnowledgeEntry[]) {
  const pseudoDraft: DraftState = { ...draft, allyPicks: [], enemyPicks: draft.allyPicks };
  const baseScore = calculatePickScore(candidate, map, pseudoDraft, allBrawlers, knowledge);
  const versionScore = calculateVersionAwareScore(candidate, { map });
  const allyBrawlers = draft.allyPicks.map((id) => allBrawlers.find((b) => b.id === id)).filter(Boolean) as Brawler[];
  const reasons: string[] = [];
  const protectsAgainst: string[] = [];
  let allyWeaknessThreat = 0;
  for (const ally of allyBrawlers) {
    const enemyAnswer = calculateTagCounterScore(candidate, buildCompositionProfile([ally]));
    allyWeaknessThreat += Math.max(0, enemyAnswer.score);
  }
  const weights = draftWeights.ban;
  let threat =
    baseScore.meta * weights.meta +
    versionScore.patchImpact * 0.8 +
    versionScore.trend * 0.5 -
    versionScore.stalenessPenalty * 0.4 +
    baseScore.mapFit * weights.mapFit +
    baseScore.modeFit * weights.modeFit +
    baseScore.counter * weights.directCounter +
    allyWeaknessThreat * weights.allyNeed +
    baseScore.safety * 0.08;

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
  if (versionScore.brawlerMeta.metaTier === 'S' || versionScore.brawlerMeta.metaTier === 'A') reasons.push('该英雄当前版本强度较高，且在这张地图上适配度高，适合作为优先禁用目标。');
  if (versionScore.brawlerMeta.lastBalanceChange?.type === 'buff') reasons.push('该英雄近期增强，敌方可能优先抢用，可以考虑禁用。');
  if (versionScore.brawlerMeta.lastBalanceChange?.type === 'nerf') reasons.push('该英雄近期被削弱，禁用优先级已相应下调。');
  if (baseScore.mapFit > 55) reasons.push('地图适配度高。');
  if (baseScore.modeFit > 55) reasons.push('模式收益高。');
  if (draft.nextAction.endsWith('_ban')) reasons.unshift(getDraftStageReason(draft));
  if (allyWeaknessThreat > 0) reasons.push('该英雄可能克制我方已选体系，禁用可以降低后续 BP 风险。');
  if (baseScore.counter > 15) reasons.push('该英雄在当前对局中具备明显威胁，适合作为拒抢或防克制禁用。');
  if (versionScore.freshness.stale) reasons.push('该推荐使用的数据可能过期，请结合当前版本实际环境确认。');
  if (draft.teamSide === 'red') reasons.push('对方作为先选方可能优先抢该英雄，因此我方可以考虑禁用。');
  if (!reasons.length) reasons.push('禁用建议基于当前地图适配、模式收益和潜在首抢威胁综合计算。');
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
