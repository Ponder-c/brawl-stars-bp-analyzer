import type { BrawlerMetaSnapshot, MapMetaSnapshot } from '../types/domain';
import { currentVersionMeta } from './versionMeta';

const officialReleaseNotesUrl = 'https://supercell.com/en/games/brawlstars/blog/release-notes/release-notes-april-2026/';

export const defaultBrawlerMetaSnapshot = {
  metaTier: 'unknown',
  trend: 'unknown',
  confidence: 'low',
  dataSources: ['manual placeholder'] as string[],
  lastUpdated: '2026-04-20'
} as const;

export const brawlerMetaSnapshot: BrawlerMetaSnapshot[] = [
  {
    brawlerId: 'sirius',
    metaTier: 'S',
    previousMetaTier: 'S',
    trend: 'falling',
    lastBalanceChange: {
      patchDate: '2026-05-13',
      type: 'nerf',
      summaryZh: '最近被削弱，生命值、伤害和超级技能相关数值下调。',
      sourceUrl: officialReleaseNotesUrl
    },
    confidence: 'medium',
    dataSources: ['Supercell release notes', 'manual meta review'],
    lastUpdated: '2026-05-13'
  },
  {
    brawlerId: 'mortis',
    metaTier: 'A',
    previousMetaTier: 'S',
    trend: 'falling',
    lastBalanceChange: {
      patchDate: '2026-05-13',
      type: 'nerf',
      summaryZh: '最近被削弱，基础伤害下调，收割稳定性下降。',
      sourceUrl: officialReleaseNotesUrl
    },
    confidence: 'medium',
    dataSources: ['Supercell release notes', 'manual meta review'],
    lastUpdated: '2026-05-13'
  },
  {
    brawlerId: 'maisie',
    metaTier: 'B',
    previousMetaTier: 'C',
    trend: 'rising',
    lastBalanceChange: {
      patchDate: '2026-05-13',
      type: 'buff',
      summaryZh: '最近增强，基础伤害提高，但仍需结合地图和敌方阵容判断。',
      sourceUrl: officialReleaseNotesUrl
    },
    confidence: 'medium',
    dataSources: ['Supercell release notes', 'manual meta review'],
    lastUpdated: '2026-05-13'
  },
  {
    brawlerId: 'draco',
    metaTier: 'B',
    previousMetaTier: 'C',
    trend: 'rising',
    lastBalanceChange: {
      patchDate: '2026-05-13',
      type: 'buff',
      summaryZh: '最近增强，生命值提高，正面抗压能力上升。',
      sourceUrl: officialReleaseNotesUrl
    },
    confidence: 'medium',
    dataSources: ['Supercell release notes', 'manual meta review'],
    lastUpdated: '2026-05-13'
  },
  {
    brawlerId: 'frank',
    metaTier: 'S',
    previousMetaTier: 'S',
    trend: 'stable',
    lastBalanceChange: {
      patchDate: currentVersionMeta.patchDate,
      type: 'none',
      summaryZh: '本快照未记录最近直接调整，强度结论需人工继续核对。',
      sourceUrl: currentVersionMeta.sourceUrl
    },
    confidence: 'low',
    dataSources: ['manual meta review'],
    lastUpdated: '2026-04-20'
  },
  {
    brawlerId: 'angelo',
    metaTier: 'S',
    previousMetaTier: 'S',
    trend: 'stable',
    lastBalanceChange: {
      patchDate: currentVersionMeta.patchDate,
      type: 'none',
      summaryZh: '本快照未记录最近直接调整，强度结论需人工继续核对。',
      sourceUrl: currentVersionMeta.sourceUrl
    },
    confidence: 'low',
    dataSources: ['manual meta review'],
    lastUpdated: '2026-04-20'
  }
];

export const defaultMapMetaSnapshot = {
  mapPoolStatus: 'unknown',
  currentRotation: false,
  dataQuality: 'todo',
  lastUpdated: '2026-04-20'
} as const;

export const mapMetaSnapshot: MapMetaSnapshot[] = [
  {
    mapId: 'hard-rock-mine',
    mapPoolStatus: 'unknown',
    currentRotation: false,
    sourceUrl: 'https://brawlify.com/maps/15000007',
    dataQuality: 'estimated',
    lastUpdated: '2026-04-20'
  },
  {
    mapId: 'shooting-star',
    mapPoolStatus: 'unknown',
    currentRotation: false,
    sourceUrl: 'https://brawlify.com/maps/15000005',
    dataQuality: 'estimated',
    lastUpdated: '2026-04-20'
  },
  {
    mapId: 'deathcap-trap',
    mapPoolStatus: 'archived',
    currentRotation: false,
    dataQuality: 'todo',
    lastUpdated: '2026-04-20'
  }
];

export function getBrawlerMetaSnapshot(brawlerId: string): BrawlerMetaSnapshot {
  return brawlerMetaSnapshot.find((entry) => entry.brawlerId === brawlerId) ?? {
    brawlerId,
    ...defaultBrawlerMetaSnapshot
  };
}

export function getMapMetaSnapshot(mapId: string): MapMetaSnapshot {
  return mapMetaSnapshot.find((entry) => entry.mapId === mapId) ?? {
    mapId,
    ...defaultMapMetaSnapshot
  };
}
