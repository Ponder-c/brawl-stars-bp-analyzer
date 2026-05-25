import { calculateBanScore, calculatePickScore, analyzeTeam } from './scoring';
import { normalizeDraftState } from './draft';
import type { BanRecommendation, BrawlMap, Brawler, DraftState, KnowledgeEntry, PickRecommendation } from '../types/domain';

function unavailableIds(draft: DraftState) {
  const normalized = normalizeDraftState(draft);
  return new Set([...normalized.allyPicks, ...normalized.enemyPicks, ...normalized.allyBans, ...normalized.enemyBans]);
}

export function recommendPicks(
  brawlers: Brawler[],
  map: BrawlMap,
  draft: DraftState,
  knowledge: KnowledgeEntry[],
  limit = 6
): PickRecommendation[] {
  const normalizedDraft = normalizeDraftState(draft);
  const unavailable = unavailableIds(normalizedDraft);
  return brawlers
    .filter((brawler) => !unavailable.has(brawler.id))
    .map((brawler) => ({
      brawler,
      score: calculatePickScore(brawler, map, normalizedDraft, brawlers, knowledge)
    }))
    .sort((a, b) => b.score.total - a.score.total)
    .slice(0, limit);
}

export function recommendCounterPicks(
  brawlers: Brawler[],
  map: BrawlMap,
  draft: DraftState,
  knowledge: KnowledgeEntry[],
  limit = 4
): PickRecommendation[] {
  const normalizedDraft = normalizeDraftState(draft);
  return recommendPicks(brawlers, map, { ...normalizedDraft, strategyMode: 'aggressive' }, knowledge, brawlers.length)
    .filter((item) => item.score.counter > 0 || item.score.reasons.some((reason) => reason.includes('克制')))
    .slice(0, limit);
}

export function recommendBans(
  brawlers: Brawler[],
  map: BrawlMap,
  draft: DraftState,
  knowledge: KnowledgeEntry[],
  limit = 5
): BanRecommendation[] {
  const normalizedDraft = normalizeDraftState(draft);
  const unavailable = new Set([...normalizedDraft.allyPicks, ...normalizedDraft.enemyPicks, ...normalizedDraft.allyBans, ...normalizedDraft.enemyBans]);
  return brawlers
    .filter((brawler) => !unavailable.has(brawler.id))
    .map((brawler) => ({
      brawler,
      ...calculateBanScore(brawler, map, normalizedDraft, brawlers, knowledge)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function recommendCompositions(picks: PickRecommendation[]) {
  const primary = picks.slice(0, 3).map((item) => item.brawler);
  const control = picks.filter((item) => item.brawler.stats.control >= 7).slice(0, 1).map((item) => item.brawler);
  const damage = picks.filter((item) => item.brawler.stats.dps >= 7 || item.brawler.stats.burst >= 7).slice(0, 1).map((item) => item.brawler);
  const utility = picks.filter((item) => item.brawler.stats.wallBreak >= 6 || item.brawler.stats.sustain >= 7 || item.brawler.stats.engage >= 7).slice(0, 1).map((item) => item.brawler);
  const combo = [...control, ...damage, ...utility];
  const unique = Array.from(new Map((combo.length >= 3 ? combo : primary).map((brawler) => [brawler.id, brawler])).values()).slice(0, 3);

  return {
    name: unique.map((brawler) => brawler.name).join(' + '),
    brawlers: unique,
    reason: '组合优先覆盖控场、输出和功能位，避免只堆单点强度。'
  };
}

export function buildAnalysis(brawlers: Brawler[], map: BrawlMap, draft: DraftState) {
  const normalizedDraft = normalizeDraftState(draft);
  const ally = normalizedDraft.allyPicks.map((id) => brawlers.find((b) => b.id === id)).filter(Boolean) as Brawler[];
  const enemy = normalizedDraft.enemyPicks.map((id) => brawlers.find((b) => b.id === id)).filter(Boolean) as Brawler[];
  return analyzeTeam(ally, enemy, map);
}
