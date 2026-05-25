# 数据更新说明

这个 MVP 的数据全部放在 `src/data`，组件不直接写死英雄或地图。以后维护时优先改数据文件，再按需要调整算法权重。

## 1. 新增或更新英雄

编辑：

```text
src/data/brawlers.ts
```

每个英雄使用 `Brawler` 结构：

```ts
{
  id: 'unique-id',
  name: '英雄名',
  avatar: '头像占位符',
  roles: ['sniper', 'lane'],
  type: '远程狙击',
  gadgets: ['随身妙具 A', '随身妙具 B'],
  starPowers: ['星徽 A', '星徽 B'],
  superSkill: '超级技能说明',
  positioning: '定位说明',
  stats: {
    range: 10,
    mobility: 6,
    wallBreak: 4,
    control: 4,
    burst: 9,
    sustain: 3,
    dps: 5,
    survivability: 5,
    engage: 2,
    antiAssassin: 6,
    ballCarry: 2,
    zoneHold: 3
  },
  metaTier: 'A',
  balancePatchDate: '2026-05-01',
  counters: [],
  counteredBy: []
}
```

评分建议：

- 所有 `stats` 字段使用 0-10 分。
- `metaTier` 使用 `S/A/B/C/D`。
- Counter 关系不要硬凑，没把握就先留空或加 TODO。
- 平衡性变化时更新 `metaTier` 和 `balancePatchDate`。

## 2. 新增或更新地图

编辑：

```text
src/data/maps.ts
```

每张地图使用 `BrawlMap` 结构：

```ts
{
  mapId: 'hard-rock-mine',
  mapName: '硬石矿井',
  gameMode: 'gem_grab',
  mapImage: 'linear-gradient(...)',
  openness: 5,
  wallDensity: 6,
  bushDensity: 4,
  chokePoints: 4,
  throwerFriendly: true,
  sniperFriendly: false,
  assassinFriendly: true,
  tankFriendly: true,
  wallBreakValue: 7,
  laneStructure: 'three_lane',
  tags: ['三路', '中路控制', '墙多']
}
```

字段解释：

- `openness`：开阔程度，越高越适合长手。
- `wallDensity`：墙体密度，越高越容易让投掷发挥。
- `bushDensity`：草丛密度，越高越适合坦克/刺客伏击。
- `chokePoints`：关键路口数量，影响控场收益。
- `wallBreakValue`：破墙价值，越高越推荐破墙英雄。
- `laneStructure`：三路、双路、中心争夺、开放图等。

## 3. 更新职业比赛 / 攻略知识库

编辑：

```text
src/data/knowledgeBase.ts
```

知识库条目结构：

```ts
{
  id: 'note-id',
  sourceType: 'pro_match',
  sourceTitle: '比赛或攻略标题',
  sourceUrl: 'https://...',
  mapName: '地图名',
  mode: 'gem_grab',
  recommendedBrawlers: ['sandy', 'max'],
  bans: ['angelo'],
  draftReason: '为什么这么 BP',
  counterRelations: ['A 克制 B 的说明'],
  versionDate: '2026-05-24',
  confidence: 0.7
}
```

维护原则：

- 职业比赛视频、攻略、截图只记录来源和人工摘要，不要下载或打包盗用素材。
- `sourceUrl` 填合法链接；不确定时写 `TODO`。
- `confidence` 范围 0-1，越高代表越可信。
- 新版本后旧知识可能失效，更新 `versionDate` 或降低 `confidence`。

## 4. 接入网络更新接口的建议

预留方向：

- 官方 API：英雄基础信息、图标、事件信息。
- Brawlify / BrawlAPI：地图和模式元数据。
- 本地编辑器：手动维护 metaTier、地图特征和职业知识库。

建议新增目录：

```text
src/data/update/
  officialApiClient.ts
  brawlifyClient.ts
  importKnowledge.ts
  normalizeBrawler.ts
  normalizeMap.ts
```

注意：

- 不绕过 API 限制。
- 不抓取需要登录或禁止自动化访问的内容。
- 网络同步失败时保留本地数据，不影响离线使用。

## 5. 调整算法权重

编辑：

```text
src/algorithm/scoring.ts
```

常改位置：

- `strategyWeights`：不同策略模式的权重。
- `calculateMapFitScore()`：地图结构和英雄属性关系。
- `calculateModeFitScore()`：不同模式的评分倾向。
- `calculateSynergyScore()`：阵容缺口判断。
- `calculateBanScore()`：Ban 位威胁计算。

改完后运行：

```bash
npm run typecheck
npm run build
```
