import type { BalanceChangeType, MetaConfidence, MetaTrend, VersionMetaTier } from '../types/domain';

export const metaTierScore: Record<VersionMetaTier, number> = {
  S: 10,
  A: 7,
  B: 4,
  C: 1,
  D: -3,
  unknown: 0
};

export const trendScore: Record<MetaTrend, number> = {
  rising: 4,
  falling: -4,
  stable: 1,
  new: 2,
  reworked: 0,
  unknown: 0
};

export const patchImpactScore: Record<BalanceChangeType, number> = {
  buff: 5,
  nerf: -7,
  rework: 0,
  bugfix: 1,
  none: 0
};

export const confidenceMultiplier: Record<MetaConfidence, number> = {
  high: 1,
  medium: 0.75,
  low: 0.45
};

export const versionScoreWeights = {
  metaScore: 0.9,
  patchImpactScore: 1,
  trendScore: 0.75,
  liveDataScore: 0.5,
  stalenessPenalty: 1
};

