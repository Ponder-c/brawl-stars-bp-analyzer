import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

const translations = read('src/data/translations.ts');
const brawlers = read('src/data/brawlers.ts');
const maps = read('src/data/maps.ts');

function extractRecord(name) {
  const start = translations.indexOf(`${name}: {`);
  if (start < 0) return {};
  const blockStart = translations.indexOf('{', start);
  let depth = 0;
  let end = blockStart;
  for (; end < translations.length; end += 1) {
    const char = translations[end];
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  const block = translations.slice(blockStart + 1, end);
  const out = {};
  const regex = /(?:'([^']+)'|"([^"]+)"|([A-Za-z0-9_. -]+)):\s*'([^']+)'/g;
  for (const match of block.matchAll(regex)) {
    const key = (match[1] ?? match[2] ?? match[3]).trim();
    out[key] = match[4];
  }
  return out;
}

const brawlerZh = extractRecord('brawlers');
const mapZh = extractRecord('maps');

function updateDisplayNames(text, nameField, displayField, dict, todoDataQuality) {
  return text.replace(new RegExp(`(${nameField}: "([^"]+)",\\n\\s+${displayField}: )"([^"]*)"`, 'g'), (full, prefix, english) => {
    return `${prefix}"${dict[english] ?? `待确认：${english}`}"`;
  }).replace(/(displayNameZh: "待确认：[^"]+",[\s\S]*?dataQuality: )"estimated"/g, `$1"${todoDataQuality}"`);
}

let nextBrawlers = updateDisplayNames(brawlers, 'name', 'displayNameZh', brawlerZh, 'todo');
nextBrawlers = nextBrawlers.replace(/(sourceNote: ")(Brawlify brawlers API \([^)]+\)\.)([^"]*)"/g, '$1$2 中文名优先参考 Brawlify 简体中文英雄页；待确认项需人工核对官方译名。$3"');

let nextMaps = updateDisplayNames(maps, 'mapName', 'displayNameZh', mapZh, 'todo');
nextMaps = nextMaps.replace(/(sourceNote: ")(Brawlify active maps API \([^)]+\)\.)([^"]*)"/g, '$1$2 中文名优先参考 Brawlify 简体中文地图页；待确认项保留英文名等待人工核对。$3"');

fs.writeFileSync(path.join(root, 'src/data/brawlers.ts'), nextBrawlers, 'utf8');
fs.writeFileSync(path.join(root, 'src/data/maps.ts'), nextMaps, 'utf8');

const brawlerTodo = [...nextBrawlers.matchAll(/displayNameZh: "待确认：([^"]+)"/g)].map((m) => m[1]);
const mapTodo = [...nextMaps.matchAll(/displayNameZh: "待确认：([^"]+)"/g)].map((m) => m[1]);
console.log(JSON.stringify({
  brawlerZhCount: Object.keys(brawlerZh).length,
  mapZhCount: Object.keys(mapZh).length,
  brawlerTodoCount: brawlerTodo.length,
  mapTodoCount: mapTodo.length,
  brawlerTodo,
  mapTodo
}, null, 2));
