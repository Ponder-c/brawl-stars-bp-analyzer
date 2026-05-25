import type { KnowledgeEntry } from '../types/domain';

export const knowledgeBase: KnowledgeEntry[] = [
  {
    id: 'note-hard-rock-control',
    sourceType: 'personal_note',
    sourceTitle: '硬石矿井三路控制笔记',
    mapName: '硬石矿井',
    mode: 'gem_grab',
    recommendedBrawlers: ['sandy', 'byron', 'max', 'frank'],
    bans: ['tick', 'angelo'],
    draftReason: '中路续航和两侧压迫都很重要，阵容需要至少一个稳定控场和一个能处理草区的点。',
    counterRelations: ['投掷可压中路，但怕莫提斯类突进。'],
    versionDate: '2026-05-24',
    confidence: 0.68
  },
  {
    id: 'note-shooting-star-snipers',
    sourceType: 'guide',
    sourceTitle: '开阔赏金长手优先级示例',
    sourceUrl: 'TODO: 填入合法攻略链接',
    mapName: '流星突袭',
    mode: 'bounty',
    recommendedBrawlers: ['piper', 'angelo', 'belle', 'byron'],
    bans: ['angelo', 'piper'],
    draftReason: '开阔赏金重视射程、保命和低死亡率，短手阵容需要非常谨慎。',
    counterRelations: ['刺客不适合盲出，除非敌方缺反刺客。'],
    versionDate: '2026-05-24',
    confidence: 0.72
  },
  {
    id: 'note-super-beach-ball',
    sourceType: 'personal_note',
    sourceTitle: '足球图破墙和开团优先',
    mapName: '超级海滩',
    mode: 'brawl_ball',
    recommendedBrawlers: ['max', 'frank', 'sandy', 'colt'],
    bans: ['frank', 'max'],
    draftReason: '足球需要推进速度、开团、破墙和控球路线。只拿消耗会出现进球能力不足。',
    counterRelations: ['有柯尔特时可降低敌方投掷和坦克掩体价值。'],
    versionDate: '2026-05-24',
    confidence: 0.66
  }
];
