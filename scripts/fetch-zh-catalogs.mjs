import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 local data maintenance'
    }
  });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8').replace(/^\uFEFF/, ''));
}

const brawlerRaw = readJson('external-brawlers.raw.json').list;
const mapRaw = readJson('external-maps.raw.json').list;

const brawlerHtml = await fetchText('https://brawlify.com/zh-cn/brawlers');
const mapHtml = await fetchText('https://brawlify.com/zh-cn/maps');

const brawlerById = Object.fromEntries(brawlerRaw.map((item) => [String(item.id), item.name]));
const brawlerZhByName = {};
for (const match of brawlerHtml.matchAll(/href="\/zh-cn\/brawlers\/(\d+)[^"]*"[^>]*>\s*([^<]+)\s*<\/a>/g)) {
  const englishName = brawlerById[match[1]];
  if (!englishName) continue;
  brawlerZhByName[englishName] = decodeEntities(match[2]);
}

const mapById = Object.fromEntries(mapRaw.map((item) => [String(item.id), item.name]));
const mapZhByName = {};
for (const match of mapHtml.matchAll(/href="\/zh-cn\/maps\/(\d+)[^"]*"[^>]*>\s*([^<]+)\s*<\/a>/g)) {
  const englishName = mapById[match[1]];
  if (!englishName) continue;
  mapZhByName[englishName] = decodeEntities(match[2]);
}

fs.writeFileSync(path.join(root, 'ZH_CATALOG_RAW.json'), JSON.stringify({
  source: {
    brawlers: 'https://brawlify.com/zh-cn/brawlers',
    maps: 'https://brawlify.com/zh-cn/maps'
  },
  brawlerZhByName,
  mapZhByName
}, null, 2), 'utf8');

console.log(JSON.stringify({
  brawlerTranslations: Object.keys(brawlerZhByName).length,
  mapTranslations: Object.keys(mapZhByName).length
}, null, 2));
