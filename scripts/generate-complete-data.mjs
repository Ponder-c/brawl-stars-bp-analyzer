import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const today = '2026-05-25';

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8').replace(/^\uFEFF/, ''));
}

function slug(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function q(value) {
  return JSON.stringify(value);
}

function pascalInitial(name) {
  const cleaned = String(name).replace(/[^A-Za-z0-9]/g, '');
  return (cleaned[0] ?? '?').toUpperCase();
}

const roleByClass = {
  'Damage Dealer': ['damage', 'lane'],
  Tank: ['tank', 'engage'],
  Marksman: ['sniper', 'lane'],
  Artillery: ['thrower', 'controller'],
  Controller: ['controller', 'mid'],
  Assassin: ['assassin', 'lane'],
  Support: ['support', 'mid'],
  Unknown: ['damage']
};

const statsByClass = {
  'Damage Dealer': { range: 7, mobility: 5, wallBreak: 3, control: 5, burst: 6, sustain: 4, dps: 7, survivability: 5, engage: 3, antiAssassin: 5, ballCarry: 4, zoneHold: 5 },
  Tank: { range: 3, mobility: 5, wallBreak: 5, control: 6, burst: 6, sustain: 8, dps: 6, survivability: 9, engage: 8, antiAssassin: 6, ballCarry: 7, zoneHold: 7 },
  Marksman: { range: 9, mobility: 5, wallBreak: 2, control: 5, burst: 7, sustain: 4, dps: 6, survivability: 5, engage: 2, antiAssassin: 5, ballCarry: 3, zoneHold: 4 },
  Artillery: { range: 8, mobility: 3, wallBreak: 2, control: 9, burst: 5, sustain: 4, dps: 5, survivability: 4, engage: 1, antiAssassin: 3, ballCarry: 2, zoneHold: 8 },
  Controller: { range: 6, mobility: 5, wallBreak: 2, control: 8, burst: 5, sustain: 6, dps: 5, survivability: 6, engage: 5, antiAssassin: 6, ballCarry: 5, zoneHold: 8 },
  Assassin: { range: 3, mobility: 9, wallBreak: 1, control: 3, burst: 8, sustain: 5, dps: 6, survivability: 5, engage: 8, antiAssassin: 4, ballCarry: 7, zoneHold: 3 },
  Support: { range: 7, mobility: 5, wallBreak: 1, control: 6, burst: 4, sustain: 8, dps: 5, survivability: 5, engage: 3, antiAssassin: 5, ballCarry: 5, zoneHold: 7 },
  Unknown: { range: 6, mobility: 5, wallBreak: 2, control: 5, burst: 5, sustain: 5, dps: 5, survivability: 5, engage: 4, antiAssassin: 5, ballCarry: 4, zoneHold: 5 }
};

const strengthsByClass = {
  'Damage Dealer': ['steady damage', 'lane pressure'],
  Tank: ['frontline pressure', 'engage'],
  Marksman: ['long range pressure', 'pick potential'],
  Artillery: ['wall pressure', 'area denial'],
  Controller: ['objective control', 'space denial'],
  Assassin: ['backline threat', 'cleanup'],
  Support: ['team utility', 'sustain'],
  Unknown: ['flex pick']
};

const weaknessesByClass = {
  'Damage Dealer': ['can lack utility'],
  Tank: ['can struggle on open maps'],
  Marksman: ['vulnerable when rushed'],
  Artillery: ['weak to assassins'],
  Controller: ['needs team follow up'],
  Assassin: ['risky into anti-assassin comps'],
  Support: ['can lack solo carry damage'],
  Unknown: ['needs manual review']
};

const goodModesByClass = {
  'Damage Dealer': ['heist', 'brawl_ball'],
  Tank: ['brawl_ball', 'hot_zone'],
  Marksman: ['bounty', 'knockout', 'wipeout'],
  Artillery: ['hot_zone', 'gem_grab'],
  Controller: ['gem_grab', 'hot_zone'],
  Assassin: ['brawl_ball', 'duels'],
  Support: ['gem_grab', 'hot_zone'],
  Unknown: []
};

const manualOverrides = {
  angelo: {
    roles: ['sniper', 'lane', 'damage'],
    type: 'Charge marksman',
    stats: { range: 10, mobility: 8, wallBreak: 1, control: 5, burst: 8, sustain: 4, dps: 6, survivability: 5, engage: 3, antiAssassin: 5, ballCarry: 3, zoneHold: 4 },
    metaTier: 'S',
    counters: [
      { targetId: 'frank', strength: 7, reason: 'Long range poke can pressure tanks before they engage.' },
      { targetId: 'byron', strength: 5, reason: 'Stronger range and burst windows into support lanes.' }
    ],
    counteredBy: [
      { targetId: 'max', strength: 5, reason: 'Speed engage can compress Angelo charge windows.' },
      { targetId: 'mortis', strength: 6, reason: 'Low margin if a dash assassin reaches him.' }
    ]
  },
  piper: {
    roles: ['sniper', 'lane', 'damage'],
    type: 'Long range sniper',
    stats: { range: 10, mobility: 6, wallBreak: 4, control: 4, burst: 9, sustain: 3, dps: 5, survivability: 5, engage: 2, antiAssassin: 6, ballCarry: 2, zoneHold: 3 },
    metaTier: 'A',
    counters: [{ targetId: 'byron', strength: 5, reason: 'High burst can force support picks off angles.' }],
    counteredBy: [{ targetId: 'mortis', strength: 7, reason: 'Assassins can force defensive tools quickly.' }]
  },
  tick: {
    roles: ['thrower', 'controller'],
    type: 'Thrower control',
    stats: { range: 9, mobility: 2, wallBreak: 1, control: 10, burst: 5, sustain: 4, dps: 4, survivability: 3, engage: 1, antiAssassin: 4, ballCarry: 1, zoneHold: 8 },
    metaTier: 'A',
    counters: [{ targetId: 'piper', strength: 5, reason: 'Can use walls to deny sniper movement.' }],
    counteredBy: [{ targetId: 'mortis', strength: 9, reason: 'Very vulnerable to direct assassin dives.' }]
  },
  barley: {
    roles: ['thrower', 'controller'],
    type: 'Area thrower',
    stats: { range: 7, mobility: 3, wallBreak: 0, control: 9, burst: 4, sustain: 7, dps: 5, survivability: 4, engage: 2, antiAssassin: 3, ballCarry: 3, zoneHold: 9 },
    metaTier: 'B'
  },
  max: {
    roles: ['support', 'lane', 'assassin'],
    type: 'Speed support',
    stats: { range: 7, mobility: 10, wallBreak: 0, control: 5, burst: 5, sustain: 5, dps: 6, survivability: 7, engage: 8, antiAssassin: 7, ballCarry: 8, zoneHold: 5 },
    metaTier: 'A'
  },
  frank: {
    roles: ['tank', 'controller', 'engage'],
    type: 'Heavy engage tank',
    stats: { range: 3, mobility: 3, wallBreak: 8, control: 8, burst: 7, sustain: 8, dps: 7, survivability: 10, engage: 9, antiAssassin: 7, ballCarry: 8, zoneHold: 8 },
    metaTier: 'S'
  },
  colt: {
    roles: ['damage', 'wall_breaker', 'lane'],
    type: 'Line damage wall breaker',
    stats: { range: 8, mobility: 6, wallBreak: 9, control: 4, burst: 7, sustain: 3, dps: 10, survivability: 4, engage: 2, antiAssassin: 4, ballCarry: 4, zoneHold: 4 },
    metaTier: 'A'
  },
  byron: {
    roles: ['support', 'sniper', 'mid'],
    type: 'Healing marksman',
    stats: { range: 10, mobility: 4, wallBreak: 0, control: 5, burst: 4, sustain: 10, dps: 5, survivability: 4, engage: 1, antiAssassin: 4, ballCarry: 2, zoneHold: 6 },
    metaTier: 'A'
  },
  mortis: {
    roles: ['assassin', 'lane'],
    type: 'Dash assassin',
    stats: { range: 2, mobility: 10, wallBreak: 0, control: 2, burst: 7, sustain: 6, dps: 5, survivability: 6, engage: 8, antiAssassin: 4, ballCarry: 7, zoneHold: 2 },
    metaTier: 'B'
  },
  sandy: {
    roles: ['controller', 'support', 'mid'],
    type: 'Team control',
    stats: { range: 6, mobility: 5, wallBreak: 0, control: 8, burst: 4, sustain: 7, dps: 5, survivability: 6, engage: 6, antiAssassin: 6, ballCarry: 6, zoneHold: 8 },
    metaTier: 'A'
  },
  belle: {
    roles: ['sniper', 'mid', 'damage'],
    type: 'Marked target sniper',
    stats: { range: 10, mobility: 4, wallBreak: 0, control: 6, burst: 6, sustain: 4, dps: 6, survivability: 5, engage: 2, antiAssassin: 6, ballCarry: 2, zoneHold: 5 },
    metaTier: 'A'
  },
  nita: {
    roles: ['controller', 'damage', 'lane'],
    type: 'Summon pressure',
    stats: { range: 5, mobility: 5, wallBreak: 0, control: 7, burst: 5, sustain: 6, dps: 7, survivability: 6, engage: 5, antiAssassin: 6, ballCarry: 5, zoneHold: 8 },
    metaTier: 'B'
  }
};

function brawlerToTs(brawler) {
  const id = slug(brawler.name);
  const cls = brawler.class?.name ?? 'Unknown';
  const override = manualOverrides[id] ?? {};
  const roles = override.roles ?? roleByClass[cls] ?? roleByClass.Unknown;
  const stats = override.stats ?? statsByClass[cls] ?? statsByClass.Unknown;
  const strengths = strengthsByClass[cls] ?? strengthsByClass.Unknown;
  const weaknesses = weaknessesByClass[cls] ?? weaknessesByClass.Unknown;
  const dataQuality = brawler.released ? 'estimated' : 'todo';
  return `  {
    id: ${q(id)},
    name: ${q(brawler.name)},
    displayNameZh: ${q(brawler.name)},
    avatar: ${q(pascalInitial(brawler.name))},
    roles: ${q(roles)},
    type: ${q(override.type ?? cls)},
    rarity: ${q(brawler.rarity?.name ?? 'Unknown')},
    class: ${q(cls)},
    attackRange: ${q(stats.range >= 8 ? 'long' : stats.range <= 4 ? 'short' : 'medium')},
    movementSpeed: ${q(stats.mobility >= 8 ? 'fast' : stats.mobility <= 3 ? 'slow' : 'normal')},
    healthLevel: ${stats.survivability},
    damageLevel: ${Math.max(stats.dps, stats.burst)},
    superType: ${q(cls === 'Support' ? 'utility' : cls === 'Artillery' ? 'control' : cls === 'Tank' ? 'engage' : 'damage')},
    hypercharge: null,
    strengths: ${q(strengths)},
    weaknesses: ${q(weaknesses)},
    counters: ${q(override.counters ?? [])},
    counteredBy: ${q(override.counteredBy ?? [])},
    goodModes: ${q(goodModesByClass[cls] ?? [])},
    badModes: [],
    mapPreferences: ${q(cls === 'Marksman' ? ['open'] : cls === 'Artillery' ? ['wall_dense'] : cls === 'Tank' || cls === 'Assassin' ? ['bushy'] : ['balanced'])},
    synergyTags: ${q(roles)},
    riskTags: ${q(weaknesses)},
    metaTier: ${q(override.metaTier ?? 'B')},
    balancePatchDate: ${q(today)},
    dataQuality: ${q(dataQuality)},
    sourceNote: ${q(`Brawlify brawlers API (${brawler.link ?? 'https://api.brawlify.com/v1/brawlers'}). Gameplay ratings are estimated placeholders for draft scoring and require manual tuning.`)},
    lastUpdated: ${q(today)},
    gadgets: ${q((brawler.gadgets ?? []).map((item) => item.name))},
    starPowers: ${q((brawler.starPowers ?? []).map((item) => item.name))},
    superSkill: ${q('TODO: add verified Super description from official/localized data')},
    positioning: ${q(cls === 'Marksman' ? 'Long range lane or mid' : cls === 'Artillery' ? 'Behind-wall control' : cls === 'Tank' ? 'Frontline engage' : cls === 'Support' ? 'Team utility' : 'Flexible draft role')},
    stats: ${JSON.stringify(stats)}
  }`;
}

const modeMap = new Map([
  ['Gem Grab', 'gem_grab'],
  ['Brawl Ball', 'brawl_ball'],
  ['Hot Zone', 'hot_zone'],
  ['Bounty', 'bounty'],
  ['Knockout', 'knockout'],
  ['Heist', 'heist'],
  ['Duels', 'duels'],
  ['Wipeout', 'wipeout']
]);

const activeMaps = readJson('external-maps.raw.json').list.filter((map) => modeMap.has(map.gameMode?.name) && !map.disabled);
const byNameMode = new Map();
for (const map of activeMaps) {
  byNameMode.set(`${modeMap.get(map.gameMode.name)}:${slug(map.name)}`, map);
}
const dedupedMaps = [...byNameMode.values()];
const slugCounts = dedupedMaps.reduce((acc, map) => {
  const id = slug(map.name);
  acc[id] = (acc[id] ?? 0) + 1;
  return acc;
}, {});

const existingMapIds = {
  'gem_grab:hard-rock-mine': 'hard-rock-mine',
  'bounty:shooting-star': 'shooting-star',
  'brawl_ball:super-beach': 'super-beach',
  'hot_zone:ring-of-fire': 'ring-of-fire',
  'heist:safe-zone': 'safe-zone',
  'knockout:out-in-the-open': 'out-in-the-open',
  'gem_grab:double-swoosh': 'double-swoosh',
  'hot_zone:dueling-beetles': 'dueling-beetles'
};

function mapShape(mode, name) {
  const lower = name.toLowerCase();
  const openName = /open|deep|shoot|star|goldarm|belle|hideout|dry|bridge|backyard|bowl|plain|phoenix|horizons/.test(lower);
  const wallName = /fort|mine|cave|wall|maze|chutes|beetles|rock|layer|pit|corner|sector|split|catacombs/.test(lower);
  const bushName = /grass|snake|prairie|sneaky|bush|forest|springs|roots|serpent|cactus|vale/.test(lower);
  const modeDefaults = {
    gem_grab: { openness: 5, wallDensity: 5, bushDensity: 4, chokePoints: 4, laneStructure: 'three_lane' },
    brawl_ball: { openness: 5, wallDensity: 5, bushDensity: 4, chokePoints: 5, laneStructure: 'two_lane' },
    hot_zone: { openness: 5, wallDensity: 5, bushDensity: 3, chokePoints: 4, laneStructure: 'center_control' },
    bounty: { openness: 7, wallDensity: 3, bushDensity: 3, chokePoints: 3, laneStructure: 'open' },
    knockout: { openness: 7, wallDensity: 4, bushDensity: 3, chokePoints: 3, laneStructure: 'open' },
    heist: { openness: 6, wallDensity: 4, bushDensity: 3, chokePoints: 3, laneStructure: 'siege_route' },
    duels: { openness: 6, wallDensity: 4, bushDensity: 3, chokePoints: 2, laneStructure: 'split' },
    wipeout: { openness: 7, wallDensity: 3, bushDensity: 3, chokePoints: 3, laneStructure: 'open' }
  };
  const base = { ...modeDefaults[mode] };
  if (openName) base.openness = Math.min(9, base.openness + 2);
  if (wallName) base.wallDensity = Math.min(8, base.wallDensity + 2);
  if (bushName) base.bushDensity = Math.min(9, base.bushDensity + 3);
  return base;
}

function gradientFor(mode) {
  const gradients = {
    gem_grab: 'linear-gradient(135deg, #22304f 0%, #111827 45%, #2c1b45 100%)',
    brawl_ball: 'linear-gradient(135deg, #0f2b33 0%, #183e50 55%, #3b2f17 100%)',
    hot_zone: 'linear-gradient(135deg, #2c1420 0%, #4b1d23 48%, #1f2937 100%)',
    bounty: 'linear-gradient(135deg, #101826 0%, #1a365d 52%, #092f36 100%)',
    knockout: 'linear-gradient(135deg, #111827 0%, #213547 42%, #0f766e 100%)',
    heist: 'linear-gradient(135deg, #142033 0%, #123b4f 46%, #312449 100%)',
    duels: 'linear-gradient(135deg, #2b1d37 0%, #26364d 55%, #1a1d24 100%)',
    wipeout: 'linear-gradient(135deg, #1b263b 0%, #25364f 48%, #111827 100%)'
  };
  return gradients[mode];
}

function mapToTs(map) {
  const mode = modeMap.get(map.gameMode.name);
  const baseSlug = slug(map.name);
  const mapId = existingMapIds[`${mode}:${baseSlug}`] ?? (slugCounts[baseSlug] > 1 ? `${baseSlug}-${mode}` : baseSlug);
  const shape = mapShape(mode, map.name);
  const throwerFriendly = shape.wallDensity >= 6;
  const sniperFriendly = shape.openness >= 7;
  const assassinFriendly = shape.bushDensity >= 6 || mode === 'duels';
  const tankFriendly = shape.bushDensity >= 6 || mode === 'brawl_ball' || mode === 'hot_zone';
  const wallBreakValue = Math.max(3, Math.min(9, Math.round((shape.wallDensity + shape.chokePoints) / 2 + (mode === 'brawl_ball' || mode === 'heist' ? 2 : 0))));
  const tags = [
    mode,
    shape.openness >= 7 ? 'open' : 'balanced',
    shape.wallDensity >= 6 ? 'wall_dense' : 'wall_light',
    shape.bushDensity >= 6 ? 'bushy' : 'low_bush',
    wallBreakValue >= 7 ? 'wall_break_value' : 'standard_routes'
  ];
  return `  {
    mapId: ${q(mapId)},
    mapName: ${q(map.name)},
    displayNameZh: ${q(map.name)},
    gameMode: ${q(mode)},
    mapImage: ${q(gradientFor(mode))},
    imageUrl: ${q(map.imageUrl ?? '')},
    openness: ${shape.openness},
    wallDensity: ${shape.wallDensity},
    bushDensity: ${shape.bushDensity},
    chokePoints: ${shape.chokePoints},
    throwerFriendly: ${throwerFriendly},
    sniperFriendly: ${sniperFriendly},
    assassinFriendly: ${assassinFriendly},
    tankFriendly: ${tankFriendly},
    wallBreakValue: ${wallBreakValue},
    laneStructure: ${q(shape.laneStructure)},
    strongBrawlerTags: ${q([sniperFriendly ? 'sniper' : null, throwerFriendly ? 'thrower' : null, tankFriendly ? 'tank' : null, assassinFriendly ? 'assassin' : null].filter(Boolean))},
    weakBrawlerTags: ${q([sniperFriendly ? 'short_range' : null, assassinFriendly ? 'low_anti_assassin' : null, throwerFriendly ? 'no_wall_break' : null].filter(Boolean))},
    dataQuality: "estimated",
    sourceNote: ${q(`Brawlify active maps API (${map.link ?? 'https://api.brawlify.com/v1/maps'}). Ranked inclusion not independently verified; terrain ratings estimated from mode/name heuristics.`)},
    lastUpdated: ${q(today)},
    mapPoolStatus: "competitive",
    tags: ${q(tags)}
  }`;
}

const rawBrawlers = readJson('external-brawlers.raw.json').list;
const brawlerEntries = rawBrawlers.map(brawlerToTs).join(',\n');
const mapEntries = dedupedMaps.map(mapToTs).join(',\n');

fs.writeFileSync(path.join(root, 'src/data/brawlers.ts'), `import type { Brawler } from '../types/domain';\n\nexport const brawlers: Brawler[] = [\n${brawlerEntries}\n];\n`, 'utf8');
fs.writeFileSync(path.join(root, 'src/data/maps.ts'), `import type { BrawlMap } from '../types/domain';\n\nexport const maps: BrawlMap[] = [\n${mapEntries}\n];\n`, 'utf8');

console.log(JSON.stringify({ brawlers: rawBrawlers.length, maps: dedupedMaps.length }, null, 2));
