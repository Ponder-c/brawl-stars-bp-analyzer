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
export type VersionMetaTier = MetaTier | 'unknown';
export type MetaTrend = 'rising' | 'falling' | 'stable' | 'new' | 'reworked' | 'unknown';
export type BalanceChangeType = 'buff' | 'nerf' | 'rework' | 'bugfix' | 'none';
export type MetaConfidence = 'high' | 'medium' | 'low';
export type VersionSource = 'official' | 'brawlify' | 'manual' | 'mixed';
export type MapPoolStatus = 'ranked' | 'competitive' | 'casual' | 'archived' | 'unknown';
export type MapMetaQuality = 'verified' | 'estimated' | 'todo';
export type TeamSide = 'blue' | 'red';
export type RankMode = 'diamond' | 'mythic_plus';
export type DraftPhase = 'ban' | 'pick' | 'complete';
export type DraftAction = 'ally_ban' | 'enemy_ban' | 'ally_pick' | 'enemy_pick' | 'complete';
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

export type CounterReference = CounterRelation | string;

export interface Brawler {
  id: string;
  name: string;
  displayNameZh?: string;
  aliasZh?: string[];
  translationQuality?: 'official' | 'community' | 'estimated' | 'todo';
  translationSource?: string;
  translationSourceUrl?: string;
  translationCheckedAt?: string;
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
  tags?: string[];
  weaknessTags?: string[];
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
  counters?: CounterReference[];
  counteredBy?: CounterReference[];
  notes?: string;
}

export interface BrawlMap {
  mapId: string;
  mapName: string;
  displayNameZh?: string;
  aliasZh?: string[];
  translationQuality?: 'official' | 'community' | 'estimated' | 'todo';
  translationSource?: string;
  translationSourceUrl?: string;
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
  mapPoolStatus?: MapPoolStatus;
  tags: string[];
}

export interface CurrentVersionMeta {
  versionName: string;
  patchDate: string;
  seasonName?: string;
  source: VersionSource;
  sourceUrl?: string;
  lastCheckedAt: string;
  confidence: MetaConfidence;
  notes: string;
}

export interface BrawlerMetaSnapshot {
  brawlerId: string;
  metaTier: VersionMetaTier;
  previousMetaTier?: VersionMetaTier;
  trend: MetaTrend;
  lastBalanceChange?: {
    patchDate: string;
    type: BalanceChangeType;
    summaryZh: string;
    sourceUrl?: string;
  };
  winRate?: number;
  useRate?: number;
  banRate?: number;
  pickRate?: number;
  confidence: MetaConfidence;
  dataSources: string[];
  lastUpdated: string;
}

export interface MapMetaSnapshot {
  mapId: string;
  mapPoolStatus: MapPoolStatus;
  currentRotation: boolean;
  lastSeenAt?: string;
  sourceUrl?: string;
  dataQuality: MapMetaQuality;
  lastUpdated: string;
}

export interface FreshnessStatus {
  stale: boolean;
  veryStale: boolean;
  unknown: boolean;
  confidence: MetaConfidence;
  messages: string[];
  ageDays?: number;
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
  teamSide: TeamSide;
  rankMode: RankMode;
  mySide: TeamSide;
  firstPickSide: TeamSide;
  currentPhase: DraftPhase;
  currentTeam: TeamSide;
  currentStep: number;
  blueBans: string[];
  redBans: string[];
  bluePicks: string[];
  redPicks: string[];
  allyPicks: string[];
  enemyPicks: string[];
  allyBans: string[];
  enemyBans: string[];
  nextAction: DraftAction;
  considerMeta: boolean;
  strategyMode: StrategyMode;
}

export interface ScoreBreakdown {
  mapFit: number;
  modeFit: number;
  synergy: number;
  counter: number;
  directCounter: number;
  tagCounter: number;
  allyNeed: number;
  risk: number;
  safety: number;
  versatility: number;
  draftStage: string;
  meta: number;
  patchImpact: number;
  trend: number;
  liveData: number;
  stalenessPenalty: number;
  metaTierLabel: string;
  metaTrendLabel: string;
  metaConfidence: MetaConfidence;
  metaStale: boolean;
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
