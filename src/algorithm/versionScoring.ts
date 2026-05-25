import type { BrawlMap, Brawler, BrawlerMetaSnapshot, CurrentVersionMeta } from '../types/domain';
import { checkDataFreshness } from '../data/freshness';
import { getBrawlerMetaSnapshot } from '../data/metaSnapshot';
import { currentVersionMeta } from '../data/versionMeta';
import { confidenceMultiplier, metaTierScore, patchImpactScore, trendScore, versionScoreWeights } from '../data/versionWeights';

export function getCurrentVersionMeta(): CurrentVersionMeta {
  return currentVersionMeta;
}

export function getBrawlerMetaScore(brawler: Brawler, versionMeta = currentVersionMeta) {
  const brawlerMeta = getBrawlerMetaSnapshot(brawler.id);
  const freshness = checkDataFreshness(brawlerMeta, versionMeta);
  const confidence = freshness.confidence;
  const baseScore = metaTierScore[brawlerMeta.metaTier] ?? 0;
  return baseScore * confidenceMultiplier[confidence];
}

export function calculatePatchImpactScore(brawlerMeta: BrawlerMetaSnapshot) {
  return patchImpactScore[brawlerMeta.lastBalanceChange?.type ?? 'none'] ?? 0;
}

export function calculateTrendScore(brawlerMeta: BrawlerMetaSnapshot) {
  return trendScore[brawlerMeta.trend] ?? 0;
}

export function calculateLiveDataScore(brawlerMeta: BrawlerMetaSnapshot) {
  const values = [brawlerMeta.winRate, brawlerMeta.useRate, brawlerMeta.banRate, brawlerMeta.pickRate].filter((value): value is number => typeof value === 'number');
  if (!values.length) return 0;
  const winRateScore = typeof brawlerMeta.winRate === 'number' ? (brawlerMeta.winRate - 50) * 0.4 : 0;
  const presenceScore = ((brawlerMeta.useRate ?? 0) + (brawlerMeta.pickRate ?? 0) + (brawlerMeta.banRate ?? 0)) * 0.08;
  return Math.max(-8, Math.min(8, winRateScore + presenceScore));
}

export function calculateStalenessPenalty(brawlerMeta: BrawlerMetaSnapshot, versionMeta = currentVersionMeta) {
  const freshness = checkDataFreshness(brawlerMeta, versionMeta);
  if (freshness.veryStale) return 8;
  if (freshness.stale) return 4;
  return 0;
}

export function generateVersionReasons(candidate: Brawler, brawlerMeta: BrawlerMetaSnapshot, versionMeta = currentVersionMeta) {
  const reasons: string[] = [];
  const freshness = checkDataFreshness(brawlerMeta, versionMeta);

  if (brawlerMeta.metaTier === 'S' || brawlerMeta.metaTier === 'A') {
    reasons.push(`该英雄当前版本强度为 ${brawlerMeta.metaTier} 级，但仍需结合地图、阵容和 Counter 判断。`);
  }
  if (brawlerMeta.metaTier === 'unknown') {
    reasons.push('该英雄当前版本强度未知，不能按旧版本强度无脑优先推荐。');
  }
  if (brawlerMeta.lastBalanceChange?.type === 'nerf') {
    reasons.push(`该英雄近期被削弱，推荐分已下调：${brawlerMeta.lastBalanceChange.summaryZh}`);
  }
  if (brawlerMeta.lastBalanceChange?.type === 'buff') {
    reasons.push(`该英雄近期增强，但仍需结合地图和敌方阵容判断：${brawlerMeta.lastBalanceChange.summaryZh}`);
  }
  if (brawlerMeta.lastBalanceChange?.type === 'rework') {
    reasons.push(`该英雄近期重做或机制调整，强度需要重新观察：${brawlerMeta.lastBalanceChange.summaryZh}`);
  }
  if (brawlerMeta.confidence === 'low') {
    reasons.push('当前 Meta 数据可信度较低，推荐结果仅供参考。');
  }
  if (freshness.messages.length) {
    reasons.push(...freshness.messages.map((message) => `该推荐使用的数据可能过期：${message}`));
  }
  if (!reasons.length) {
    reasons.push(`${candidate.displayNameZh ?? candidate.name} 暂无明确版本变动记录，按当前手动 Meta 快照参与评分。`);
  }

  return reasons;
}

export function calculateVersionAwareScore(candidate: Brawler, context: { map: BrawlMap; versionMeta?: CurrentVersionMeta }) {
  const versionMeta = context.versionMeta ?? currentVersionMeta;
  const brawlerMeta = getBrawlerMetaSnapshot(candidate.id);
  const freshness = checkDataFreshness(brawlerMeta, versionMeta);
  const metaScore = getBrawlerMetaScore(candidate, versionMeta);
  const patchImpact = calculatePatchImpactScore(brawlerMeta) * confidenceMultiplier[freshness.confidence];
  const trend = calculateTrendScore(brawlerMeta) * confidenceMultiplier[freshness.confidence];
  const liveData = calculateLiveDataScore(brawlerMeta) * confidenceMultiplier[freshness.confidence];
  const stalenessPenalty = calculateStalenessPenalty(brawlerMeta, versionMeta);
  const total =
    metaScore * versionScoreWeights.metaScore +
    patchImpact * versionScoreWeights.patchImpactScore +
    trend * versionScoreWeights.trendScore +
    liveData * versionScoreWeights.liveDataScore -
    stalenessPenalty * versionScoreWeights.stalenessPenalty;

  return {
    total,
    metaScore,
    patchImpact,
    trend,
    liveData,
    stalenessPenalty,
    brawlerMeta,
    freshness,
    reasons: generateVersionReasons(candidate, brawlerMeta, versionMeta)
  };
}

