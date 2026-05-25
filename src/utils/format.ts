import type { GameMode, StrategyMode } from '../types/domain';
import { zhCN } from '../data/translations';

export const gameModeLabels: Record<GameMode, string> = zhCN.modes;
export const strategyLabels: Record<StrategyMode, string> = zhCN.strategy;

export function scoreTone(score: number) {
  if (score >= 75) return 'text-emerald-300';
  if (score >= 55) return 'text-neon';
  if (score >= 35) return 'text-ember';
  return 'text-danger';
}
