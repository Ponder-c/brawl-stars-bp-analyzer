import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const brawlersText = fs.readFileSync(path.join(root, 'src/data/brawlers.ts'), 'utf8');
const mapsText = fs.readFileSync(path.join(root, 'src/data/maps.ts'), 'utf8');
function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8').replace(/^\uFEFF/, ''));
}

const rawBrawlers = readJson('external-brawlers.raw.json').list;
const rawMaps = readJson('external-maps.raw.json').list;

const supportedModes = new Map([
  ['Gem Grab', 'gem_grab'],
  ['Brawl Ball', 'brawl_ball'],
  ['Hot Zone', 'hot_zone'],
  ['Bounty', 'bounty'],
  ['Knockout', 'knockout'],
  ['Heist', 'heist'],
  ['Duels', 'duels'],
  ['Wipeout', 'wipeout']
]);

function slug(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function uniqueBy(items, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

const projectHeroIds = [...brawlersText.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]);
const projectMapIds = [...mapsText.matchAll(/mapId:\s*'([^']+)'/g)].map((m) => m[1]);
const projectMapModes = [...mapsText.matchAll(/gameMode:\s*'([^']+)'/g)].map((m) => m[1]);
const projectMapModeCounts = projectMapModes.reduce((acc, mode) => {
  acc[mode] = (acc[mode] ?? 0) + 1;
  return acc;
}, {});

const externalHeroCatalog = rawBrawlers.map((brawler) => ({
  id: slug(brawler.name),
  brawlifyId: brawler.id,
  name: brawler.name,
  rarity: brawler.rarity?.name ?? 'Unknown',
  class: brawler.class?.name ?? 'Unknown',
  released: Boolean(brawler.released),
  dataQuality: brawler.released ? 'verified' : 'todo',
  sourceNote: `Brawlify brawlers API: ${brawler.link ?? 'https://api.brawlify.com/v1/brawlers'}`
}));

const relevantMaps = rawMaps.filter((map) => supportedModes.has(map.gameMode?.name));
const activeRelevantMaps = relevantMaps.filter((map) => !map.disabled);
const archivedRelevantMaps = relevantMaps.filter((map) => map.disabled);

const activeNameMode = uniqueBy(activeRelevantMaps, (map) => `${supportedModes.get(map.gameMode.name)}:${slug(map.name)}`);
const nameCounts = activeNameMode.reduce((acc, map) => {
  const id = slug(map.name);
  acc[id] = (acc[id] ?? 0) + 1;
  return acc;
}, {});

const externalMapCatalog = activeNameMode.map((map) => {
  const mode = supportedModes.get(map.gameMode.name);
  const baseSlug = slug(map.name);
  return {
    mapId: nameCounts[baseSlug] > 1 ? `${baseSlug}-${mode}` : baseSlug,
    brawlifyId: map.id,
    mapName: map.name,
    gameMode: mode,
    disabled: Boolean(map.disabled),
    mapPoolStatus: 'competitive',
    dataQuality: 'estimated',
    sourceNote: `Brawlify maps API active map. Ranked pool not independently verified. ${map.link ?? ''}`.trim()
  };
});

const archivedExternalMaps = archivedRelevantMaps.map((map) => ({
  mapName: map.name,
  gameMode: supportedModes.get(map.gameMode.name),
  brawlifyId: map.id,
  mapPoolStatus: 'archived'
}));

const externalHeroIds = new Set(externalHeroCatalog.map((item) => item.id));
const missingHeroes = externalHeroCatalog.filter((hero) => !projectHeroIds.includes(hero.id));
const externalMapIds = new Set(externalMapCatalog.map((item) => item.mapId));
const missingMaps = externalMapCatalog.filter((map) => !projectMapIds.includes(map.mapId));

const externalMapModeCounts = externalMapCatalog.reduce((acc, map) => {
  acc[map.gameMode] = (acc[map.gameMode] ?? 0) + 1;
  return acc;
}, {});

const missingMapModeNames = missingMaps.reduce((acc, map) => {
  (acc[map.gameMode] ??= []).push(map.mapName);
  return acc;
}, {});

const report = {
  generatedAt: new Date().toISOString(),
  source: {
    heroes: 'https://api.brawlify.com/v1/brawlers',
    maps: 'https://api.brawlify.com/v1/maps',
    note: 'Official Brawl Stars API requires an API token and does not provide this local run with a token-backed catalog.'
  },
  currentProject: {
    heroCount: projectHeroIds.length,
    heroIds: projectHeroIds,
    mapCount: projectMapIds.length,
    mapIds: projectMapIds,
    mapModeCounts: projectMapModeCounts
  },
  external: {
    heroCount: externalHeroCatalog.length,
    mapCount: externalMapCatalog.length,
    mapModeCounts: externalMapModeCounts,
    archivedSupportedModeMapCount: archivedExternalMaps.length
  },
  missingHeroes: missingHeroes.map((hero) => hero.name),
  missingMapsByMode: missingMapModeNames,
  uncertainHeroes: externalHeroCatalog.filter((hero) => hero.dataQuality !== 'verified').map((hero) => hero.name),
  archivedOrNonRankedMaps: archivedExternalMaps.slice(0, 200).map((map) => `${map.mapName} (${map.gameMode})`),
  archivedOrNonRankedMapsTruncated: archivedExternalMaps.length > 200,
  externalHeroCatalog,
  externalMapCatalog
};

function tsConst(name, value) {
  return `export const ${name} = ${JSON.stringify(value, null, 2)} as const;\n`;
}

fs.writeFileSync(path.join(root, 'src/data/externalHeroCatalog.ts'), tsConst('externalHeroCatalog', externalHeroCatalog), 'utf8');
fs.writeFileSync(path.join(root, 'src/data/externalMapCatalog.ts'), tsConst('externalMapCatalog', externalMapCatalog), 'utf8');
fs.writeFileSync(path.join(root, 'DATA_DIFF_REPORT.json'), JSON.stringify(report, null, 2), 'utf8');

console.log(JSON.stringify({
  currentHeroCount: report.currentProject.heroCount,
  externalHeroCount: report.external.heroCount,
  missingHeroCount: missingHeroes.length,
  currentMapCount: report.currentProject.mapCount,
  currentMapModeCounts: report.currentProject.mapModeCounts,
  externalMapCount: report.external.mapCount,
  externalMapModeCounts: report.external.mapModeCounts,
  missingMapCount: missingMaps.length,
  missingMapModeCounts: Object.fromEntries(Object.entries(missingMapModeNames).map(([mode, names]) => [mode, names.length])),
  uncertainHeroes: report.uncertainHeroes,
  archivedSupportedModeMapCount: archivedRelevantMaps.length
}, null, 2));
