import type { BrawlerMetaSnapshot, CurrentVersionMeta, FreshnessStatus, MapMetaSnapshot, MetaConfidence } from '../types/domain';

const DAY_MS = 24 * 60 * 60 * 1000;
const referenceDate = '2026-05-25';

function parseDate(value?: string) {
  if (!value) return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : new Date(time);
}

function daysBetween(from?: string, to = referenceDate) {
  const fromDate = parseDate(from);
  const toDate = parseDate(to);
  if (!fromDate || !toDate) return undefined;
  return Math.max(0, Math.floor((toDate.getTime() - fromDate.getTime()) / DAY_MS));
}

function downgradeConfidence(confidence: MetaConfidence): MetaConfidence {
  if (confidence === 'high') return 'medium';
  return 'low';
}

export function checkDataFreshness(meta: Pick<BrawlerMetaSnapshot, 'lastUpdated' | 'confidence'> | undefined, currentVersion: CurrentVersionMeta, today = referenceDate): FreshnessStatus {
  if (!meta?.lastUpdated) {
    return {
      stale: true,
      veryStale: false,
      unknown: true,
      confidence: 'low',
      messages: ['Meta 数据更新时间缺失，可信度未知。']
    };
  }

  const ageDays = daysBetween(meta.lastUpdated, today);
  const currentVersionDate = parseDate(currentVersion.patchDate);
  const lastUpdatedDate = parseDate(meta.lastUpdated);
  const stale = ageDays === undefined || ageDays > 14 || Boolean(currentVersionDate && lastUpdatedDate && currentVersionDate > lastUpdatedDate);
  const veryStale = ageDays !== undefined && ageDays > 30;
  const messages: string[] = [];
  let confidence = meta.confidence ?? 'low';

  if (ageDays === undefined) {
    messages.push('Meta 数据更新时间无法解析，需人工核对。');
    confidence = 'low';
  } else if (ageDays > 30) {
    messages.push('Meta 数据已超过 30 天未更新，可信度已降低。');
    confidence = downgradeConfidence(confidence);
  } else if (ageDays > 14) {
    messages.push('Meta 数据已超过 14 天未更新，可能过期。');
  }

  if (currentVersionDate && lastUpdatedDate && currentVersionDate > lastUpdatedDate) {
    messages.push('当前版本补丁日期晚于该英雄 Meta 更新时间，推荐结果可能过期。');
  }

  return {
    stale,
    veryStale,
    unknown: false,
    confidence,
    messages,
    ageDays
  };
}

export function checkMapFreshness(meta: Pick<MapMetaSnapshot, 'lastUpdated' | 'dataQuality'> | undefined, today = referenceDate): FreshnessStatus {
  if (!meta?.lastUpdated) {
    return {
      stale: true,
      veryStale: false,
      unknown: true,
      confidence: 'low',
      messages: ['地图池数据更新时间缺失，地图池状态未知。']
    };
  }

  const ageDays = daysBetween(meta.lastUpdated, today);
  const veryStale = ageDays !== undefined && ageDays > 30;
  const stale = ageDays === undefined || ageDays > 14;
  const messages: string[] = [];

  if (ageDays === undefined) messages.push('地图池数据更新时间无法解析，需人工核对。');
  else if (ageDays > 30) messages.push('地图池数据已超过 30 天未更新，当前轮换状态可能过期。');
  else if (ageDays > 14) messages.push('地图池数据已超过 14 天未更新，可能过期。');

  if (meta.dataQuality === 'todo') messages.push('地图池状态未确认。');

  return {
    stale,
    veryStale,
    unknown: meta.dataQuality === 'todo',
    confidence: meta.dataQuality === 'verified' ? 'high' : meta.dataQuality === 'estimated' ? 'medium' : 'low',
    messages,
    ageDays
  };
}

