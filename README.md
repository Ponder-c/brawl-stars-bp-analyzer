# 荒野乱斗 BP 分析器

荒野乱斗 BP 分析器是一个面向 Ranked / 赛事 BP 场景的桌面分析工具，用于辅助选择地图、模拟蓝红双方 Ban/Pick 流程，并给出推荐、克制关系、阵容风险和版本 Meta 参考。

项目当前是 Electron + React + TypeScript 的 Windows 桌面应用 MVP。新版 BP 面板支持选择我方阵营、设置先选方、按当前 BP 步骤从统一英雄池自动录入蓝方或红方 Ban/Pick，并支持撤销上一步。数据主要来自本地维护的 TypeScript 数据表和公开数据整理结果，推荐结果只适合作为 BP 分析参考，不保证一定正确。

## 功能特性

- 地图与模式选择：支持常见 Ranked 模式和地图池。
- BP 面板：支持蓝方 / 红方 Ban/Pick 分栏展示、统一英雄池录入、当前行动方高亮和撤销上一步。
- BP 推荐：根据地图适配、模式适配、英雄强度、协同与克制关系给出推荐。
- 克制分析：输出针对敌方阵容的 Counter 思路和风险提示。
- 中文化显示：包含英雄、地图、模式、标签等中文展示数据。
- 版本 Meta 数据：通过 `metaTier`、强度标签和说明维护当前版本参考。
- 策略切换：支持稳健、激进、职业比赛、路人局、综合推荐等分析模式。
- 数据维护脚本：包含公开目录数据分析、生成和校验脚本。

## 技术栈

- Electron
- React
- TypeScript
- Vite
- Tailwind CSS
- electron-builder

## 项目截图

截图暂未加入仓库。建议后续在 `docs/screenshots/` 中放置应用主界面、地图选择、英雄选择、推荐面板和克制分析面板截图，并在此处引用。

## 安装方法

请先安装 Node.js LTS，然后在项目根目录运行：

```bash
npm install
```

## 开发运行

```bash
npm run dev
```

开发模式会同时启动 Vite 与 Electron。启动后可以选择模式、地图、双方 Pick/Ban 和推荐策略。

## 构建方法

构建前端和 Electron 主进程文件：

```bash
npm run build
```

构建产物会生成在：

```text
dist/
dist-electron/
```

这些目录属于构建产物，默认不会提交到 Git。

## 打包方法

生成 Windows 安装包：

```bash
npm run package
```

只生成未安装的目录版：

```bash
npm run package:dir
```

打包结果会输出到 `release/`，默认不会提交到 Git。

## 数据维护说明

核心数据位于：

```text
src/data/brawlers.ts
src/data/maps.ts
src/data/knowledgeBase.ts
src/data/meta.ts
src/data/translations.ts
```

相关脚本位于：

```text
scripts/
```

维护数据时建议遵循以下原则：

- 新增或调整英雄、地图、模式数据后运行构建检查。
- 不确定的数据使用 `TODO` 或说明字段标记，避免伪造结论。
- 版本强度、职业比赛经验和路人局体验应分开记录，避免混成单一绝对结论。
- 修改推荐权重时，应同时检查推荐理由、风险提示和阵容组合是否仍然合理。

## 地图和英雄数据来源说明

项目数据来自本地整理与公开资料参考，可能包含来自 Brawl Stars Official API、Brawlify / BrawlAPI 等公开数据源的人工整理结果。使用外部数据时请遵守对应平台的服务条款和授权要求。

如果后续接入需要鉴权的接口，请使用 `.env` 保存真实密钥，并参考 `.env.example` 填写变量名。不要把真实 API Token、Cookie 或其他凭据提交到仓库。

## 如何手动维护地图名和英雄名

地图数据位于 `src/data/maps.ts`。英雄数据位于 `src/data/brawlers.ts`。界面中文显示优先读取数据项里的 `displayNameZh`，因此手动改中文名时，直接修改对应地图或英雄的 `displayNameZh` 即可。

不要随便修改 `mapId` 或英雄的 `id`。这些字段是程序内部识别、Ban/Pick、推荐过滤和数据关联用的稳定 ID。`mapName` 和英雄的 `name` 建议保留为内部英文名，方便和外部资料、脚本、日志对照。

找不到官方中文名时，不要自动乱翻译，也不要伪造官方译名。可以先写成：

```ts
displayNameZh: "待确认：英文名",
translationQuality: "todo"
```

B 站视频、攻略站、社区 Wiki、Brawlify/Wiki 人工核对结果只能作为 `community` 来源，不要标注为 `official`。官方中文名优先来自游戏内简体中文截图或 Supercell 官方中文资料。

地图名维护字段：

```ts
{
  mapId: "hard_rock_mine",
  mapName: "Hard Rock Mine",
  displayNameZh: "坚石矿井",
  aliasZh: ["硬石矿井"],
  translationQuality: "community",
  translationSource: "Brawlify/Wiki/人工核对",
  translationCheckedAt: "2026-05-25"
}
```

英雄名维护字段：

```ts
{
  brawlerId: "shelly",
  name: "Shelly",
  displayNameZh: "雪莉",
  aliasZh: ["喷子"],
  translationQuality: "official",
  translationSource: "游戏内简体中文",
  translationCheckedAt: "2026-05-25"
}
```

当前项目英雄数据文件实际使用字段名 `id` 作为英雄稳定 ID；如果参考上面的 `brawlerId` 示例维护，请对应到 `src/data/brawlers.ts` 里的 `id`。每次修改地图名、英雄名、别名或来源说明后，都要运行：

```bash
npm run build
```

## 版本 Meta 数据说明

版本 Meta 数据用于描述当前版本中英雄强度、适用场景和推荐权重。由于游戏平衡调整、地图池轮换和玩家环境变化较快，Meta 数据可能滞后，需要人工维护和核对。

当前推荐系统不等同于胜率预测模型，也不会保证推荐结果一定正确。请结合实际地图、队友英雄池、熟练度、对手阵容和比赛规则进行判断。

## 版本与 Meta 数据维护

版本相关数据位于：

```text
src/data/versionMeta.ts
src/data/patchNotes.ts
src/data/metaSnapshot.ts
src/data/versionWeights.ts
src/data/freshness.ts
```

维护建议：

- 更新 `currentVersionMeta` 时填写版本名、补丁日期、来源、来源链接、检查时间和可信度。
- 更新 `patchNotes` 时只记录可追溯的平衡调整，不确定的内容用中文说明并降低可信度。
- 更新 `metaSnapshot` 时按英雄维护 `metaTier`、趋势、最近平衡调整、数据来源和更新时间。
- 没有真实胜率、使用率、Ban 率、Pick 率时留空，不要编造数据。
- 不确定强度使用 `unknown`，不确定来源使用 `confidence: "low"`。
- 地图池状态不确定时使用 `unknown` 或 `archived`，不要删除地图。
- `freshness.ts` 会按更新时间提示数据是否可能过期；超过 14 天标记可能过期，超过 30 天降低可信度。
- 推荐结果仅供 BP 分析参考，不能替代人工核对和当前版本实战判断。

## 免责声明

本项目是非官方工具，与 Supercell 没有任何官方关联，也未获得 Supercell 的赞助、认可或背书。

Brawl Stars、荒野乱斗、游戏名称、英雄名称、地图名称、图标、素材和相关商标归其各自权利方所有。本项目仅用于学习、研究和 BP 分析辅助。

项目中的数据、推荐和分析可能存在错误或滞后，不构成比赛、上分或商业决策保证。使用者应自行核对数据并承担使用结果。

## 开源协议

本项目使用 MIT License，详见 [LICENSE](LICENSE)。

## 后续计划

- 完善全英雄、全地图和全模式数据。
- 增加数据导入、导出和校验页面。
- 接入合法公开 API 更新英雄基础信息和地图池。
- 增加版本 Meta 权重编辑器。
- 增加职业比赛知识库录入 UI。
- 增加完整 Ranked BP 轮次模拟器。
- 增加截图导出，方便赛前讨论和复盘。
