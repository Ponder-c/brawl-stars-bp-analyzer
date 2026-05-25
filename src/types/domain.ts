export type GameMode =
  | 'gem_grab'
  | 'brawl_ball'
  | 'hot_zone'
  | 'bounty'
  | 'knockout'
  | 'heist'
  | 'duels'
  | 'wipeout';

export type StrategyMode = 'balanced' | 'safe' | 'aggressive' | 'pro' | 'ladder';
export type MetaTier = 'S' | 'A' | 'B' | 'C' | 'D';
export type BrawlerRole =
  | 'mid'
  | 'lane'
  | 'thrower'
  | 'sniper'
  | 'assassin'
  | 'tank'
  | 'support'
  | 'controller'
  | 'damage'
  | 'wall_breaker'
  | 'engage';

export interface BrawlerStats {
  range: number;
  mobility: number;
  wallBreak: number;
  control: number;
  burst: number;
  sustain: number;
  dps: number;
  survivability: number;
  engage: number;
  antiAssassin: number;
  ballCarry: number;
  zoneHold: number;
}

export interface CounterRelation {
  targetId: string;
  strength: number;
  reason: string;
}

export interface Brawler {
  id: string;
  name: string;
  displayNameZh?: string;
  avatar: string;
  roles: BrawlerRole[];
  type: string;
  rarity?: string;
  class?: string;
  attackRange?: string;
  movementSpeed?: string;
  healthLevel?: number;
  damageLevel?: number;
  superType?: string;
  hypercharge?: string | null;
  strengths?: string[];
  weaknesses?: string[];
  goodModes?: GameMode[];
  badModes?: GameMode[];
  mapPreferences?: string[];
  synergyTags?: string[];
  riskTags?: string[];
  dataQuality?: 'verified' | 'estimated' | 'todo';
  sourceNote?: string;
  lastUpdated?: string;
  gadgets: string[];
  starPowers: string[];
  superSkill: string;
  positioning: string;
  stats: BrawlerStats;
  metaTier: MetaTier;
  balancePatchDate: string;
  counters: CounterRelation[];
  counteredBy: CounterRelation[];
  notes?: string;
}

export interface BrawlMap {
  mapId: string;
  mapName: string;
  displayNameZh?: string;
  translationQuality?: 'official' | 'community' | 'estimated' | 'todo';
  translationSource?: string;
  translationCheckedAt?: string;
  gameMode: GameMode;
  mapImage: string;
  imageUrl?: string;
  openness: number;
  wallDensity: number;
  bushDensity: number;
  chokePoints: number;
  throwerFriendly: boolean;
  sniperFriendly: boolean;
  assassinFriendly: boolean;
  tankFriendly: boolean;
  wallBreakValue: number;
  laneStructure: 'three_lane' | 'two_lane' | 'center_control' | 'open' | 'split' | 'siege_route';
  strongBrawlerTags?: string[];
  weakBrawlerTags?: string[];
  dataQuality?: 'verified' | 'estimated' | 'todo';
  sourceNote?: string;
  lastUpdated?: string;
  mapPoolStatus?: 'ranked' | 'competitive' | 'casual' | 'archived' | 'unknown';
  tags: string[];
}

export interface KnowledgeEntry {
  id: string;
  sourceType: 'pro_match' | 'guide' | 'personal_note';
  sourceTitle: string;
  sourceUrl?: string;
  mapName: string;
  mode: GameMode;
  recommendedBrawlers: string[];
  bans: string[];
  draftReason: string;
  counterRelations: string[];
  versionDate: string;
  confidence: number;
}

export interface DraftState {
  allyPicks: string[];
  enemyPicks: string[];
  allyBans: string[];
  enemyBans: string[];
  considerMeta: boolean;
  strategyMode: StrategyMode;
}

export interface ScoreBreakdown {
  mapFit: number;
  modeFit: number;
  synergy: number;
  counter: number;
  meta: number;
  knowledge: number;
  total: number;
  reasons: string[];
  risks: string[];
  tags: string[];
}

export interface PickRecommendation {
  brawler: Brawler;
  score: ScoreBreakdown;
}

export interface BanRecommendation {
  brawler: Brawler;
  score: number;
  reasons: string[];
  protectsAgainst: string[];
}

export interface TeamAnalysis {
  strengths: string[];
  risks: string[];
  counterPlan: string[];
}
