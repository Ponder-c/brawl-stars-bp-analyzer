import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const today = new Date().toISOString();

function readText(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

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

function allMatches(text, regex) {
  return [...text.matchAll(regex)].map((match) => match[1]);
}

function duplicates(values) {
  const seen = new Set();
  const dupes = new Set();
  for (const value of values) {
    if (seen.has(value)) dupes.add(value);
    seen.add(value);
  }
  return [...dupes];
}

function countMissingBlocks(text, requiredFields) {
  const blocks = text.split(/\n  \{/).slice(1);
  const missing = [];
  blocks.forEach((block, index) => {
    const absent = requiredFields.filter((field) => !new RegExp(`\\b${field}\\s*:`).test(block));
    if (absent.length) missing.push({ index: index + 1, absent });
  });
  return missing;
}

const brawlersText = readText('src/data/brawlers.ts');
const mapsText = readText('src/data/maps.ts');
const externalHeroCatalog = readText('src/data/externalHeroCatalog.ts');
const externalMapCatalog = readText('src/data/externalMapCatalog.ts');

const heroIds = allMatches(brawlersText, /\bid:\s*"([^"]+)"/g);
const heroNames = allMatches(brawlersText, /\bname:\s*"([^"]+)"/g);
const externalHeroIds = allMatches(externalHeroCatalog, /\bid":\s*"([^"]+)"/g);
const remainingMissingHeroes = externalHeroIds.filter((id) => !heroIds.includes(id));
const metaTiers = allMatches(brawlersText, /\bmetaTier:\s*"([^"]+)"/g);
const heroQualities = allMatches(brawlersText, /\bdataQuality:\s*"([^"]+)"/g);
const roleValues = [...brawlersText.matchAll(/\broles:\s*\[([^\]]*)\]/g)]
  .flatMap((match) => [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1]));

const allowedRoles = new Set(['mid', 'lane', 'thrower', 'sniper', 'assassin', 'tank', 'support', 'controller', 'damage', 'wall_breaker', 'engage']);
const allowedMeta = new Set(['S', 'A', 'B', 'C', 'D']);
const allowedQuality = new Set(['verified', 'estimated', 'todo']);

const mapIds = allMatches(mapsText, /\bmapId:\s*"([^"]+)"/g);
const mapNames = allMatches(mapsText, /\bmapName:\s*"([^"]+)"/g);
const mapModes = allMatches(mapsText, /\bgameMode:\s*"([^"]+)"/g);
const mapQualities = allMatches(mapsText, /\bdataQuality:\s*"([^"]+)"/g);
const mapStatuses = allMatches(mapsText, /\bmapPoolStatus:\s*"([^"]+)"/g);
const externalMapIds = allMatches(externalMapCatalog, /\bmapId":\s*"([^"]+)"/g);
const remainingMissingMaps = externalMapIds.filter((id) => !mapIds.includes(id));
const mapNameModePairs = mapNames.map((name, index) => `${name}::${mapModes[index] ?? 'unknown'}`);
const mapModeCounts = mapModes.reduce((acc, mode) => {
  acc[mode] = (acc[mode] ?? 0) + 1;
  return acc;
}, {});

const allowedModes = new Set(['gem_grab', 'brawl_ball', 'hot_zone', 'bounty', 'knockout', 'heist', 'duels', 'wipeout']);
const allowedStatuses = new Set(['ranked', 'competitive', 'casual', 'archived', 'unknown']);
const missingMapImages = mapsText.split(/\n  \{/).slice(1).flatMap((block, index) => {
  if (!/\bmapImage:\s*"[^"]*"/.test(block)) return [index + 1];
  return [];
});

const report = {
  generatedAt: today,
  heroes: {
    count: heroIds.length,
    remainingMissingHeroes,
    duplicateIds: duplicates(heroIds),
    duplicateNames: duplicates(heroNames),
    fieldMissing: countMissingBlocks(brawlersText, ['id', 'name', 'avatar', 'roles', 'type', 'stats', 'metaTier', 'balancePatchDate', 'counters', 'counteredBy', 'gadgets', 'starPowers', 'dataQuality', 'sourceNote', 'lastUpdated']),
    invalidRoles: [...new Set(roleValues.filter((role) => !allowedRoles.has(role)))],
    invalidMetaTiers: [...new Set(metaTiers.filter((tier) => !allowedMeta.has(tier)))],
    invalidDataQuality: [...new Set(heroQualities.filter((quality) => !allowedQuality.has(quality)))],
    estimatedOrTodo: heroNames.filter((_, index) => (heroQualities[index] ?? '') !== 'verified')
  },
  maps: {
    count: mapIds.length,
    modeCounts: mapModeCounts,
    remainingMissingMaps,
    duplicateMapIds: duplicates(mapIds),
    duplicateNameMode: duplicates(mapNameModePairs),
    fieldMissing: countMissingBlocks(mapsText, ['mapId', 'mapName', 'gameMode', 'mapImage', 'openness', 'wallDensity', 'bushDensity', 'chokePoints', 'throwerFriendly', 'sniperFriendly', 'assassinFriendly', 'tankFriendly', 'wallBreakValue', 'laneStructure', 'tags', 'dataQuality', 'sourceNote', 'lastUpdated', 'mapPoolStatus']),
    invalidGameModes: [...new Set(mapModes.filter((mode) => !allowedModes.has(mode)))],
    invalidDataQuality: [...new Set(mapQualities.filter((quality) => !allowedQuality.has(quality)))],
    invalidMapPoolStatus: [...new Set(mapStatuses.filter((status) => !allowedStatuses.has(status)))],
    missingMapImages,
    estimatedOrTodoOrUnknownOrArchived: mapNames.filter((_, index) => {
      const quality = mapQualities[index];
      const status = mapStatuses[index];
      return quality !== 'verified' || status === 'unknown' || status === 'archived';
    })
  }
};

const hasFailure =
  report.heroes.remainingMissingHeroes.length ||
  report.heroes.duplicateIds.length ||
  report.heroes.duplicateNames.length ||
  report.heroes.fieldMissing.length ||
  report.heroes.invalidRoles.length ||
  report.heroes.invalidMetaTiers.length ||
  report.heroes.invalidDataQuality.length ||
  report.maps.remainingMissingMaps.length ||
  report.maps.duplicateMapIds.length ||
  report.maps.duplicateNameMode.length ||
  report.maps.fieldMissing.length ||
  report.maps.invalidGameModes.length ||
  report.maps.invalidDataQuality.length ||
  report.maps.invalidMapPoolStatus.length ||
  report.maps.missingMapImages.length;

fs.writeFileSync(path.join(root, 'DATA_VALIDATION_REPORT.json'), JSON.stringify(report, null, 2), 'utf8');
console.log(JSON.stringify({
  heroes: {
    count: report.heroes.count,
    remainingMissingHeroes: report.heroes.remainingMissingHeroes,
    duplicateIds: report.heroes.duplicateIds,
    duplicateNames: report.heroes.duplicateNames,
    fieldMissingCount: report.heroes.fieldMissing.length,
    invalidRoles: report.heroes.invalidRoles,
    invalidMetaTiers: report.heroes.invalidMetaTiers
  },
  maps: {
    count: report.maps.count,
    modeCounts: report.maps.modeCounts,
    remainingMissingMaps: report.maps.remainingMissingMaps,
    duplicateMapIds: report.maps.duplicateMapIds,
    duplicateNameMode: report.maps.duplicateNameMode,
    fieldMissingCount: report.maps.fieldMissing.length,
    invalidGameModes: report.maps.invalidGameModes,
    invalidMapPoolStatus: report.maps.invalidMapPoolStatus,
    missingMapImages: report.maps.missingMapImages
  }
}, null, 2));

if (hasFailure) process.exit(1);
