import type { Brawler } from '../types/domain';

export const brawlers: Brawler[] = [
  {
    id: 'angelo',
    name: '安杰洛',
    avatar: 'A',
    roles: ['sniper', 'lane', 'damage'],
    type: '蓄力长手',
    gadgets: ['毒刺飞跃', '蓄势待发'],
    starPowers: ['水上漂', '毒疗'],
    superSkill: '制造毒雾区域，提高普攻压制能力',
    positioning: '边路长手压制',
    stats: { range: 10, mobility: 8, wallBreak: 1, control: 5, burst: 8, sustain: 4, dps: 6, survivability: 5, engage: 3, antiAssassin: 5, ballCarry: 3, zoneHold: 4 },
    metaTier: 'S',
    balancePatchDate: '2026-05-01',
    counters: [
      { targetId: 'frank', strength: 7, reason: '长距离蓄力能持续压低坦克血线' },
      { targetId: 'byron', strength: 5, reason: '对线射程和爆发窗口更强' }
    ],
    counteredBy: [
      { targetId: 'max', strength: 5, reason: '加速开团会压缩蓄力空间' },
      { targetId: 'mortis', strength: 6, reason: '被近身后容错低' }
    ]
  },
  {
    id: 'piper',
    name: '佩佩',
    avatar: 'P',
    roles: ['sniper', 'lane', 'damage'],
    type: '远程狙击',
    gadgets: ['自动瞄准器', '制导装置'],
    starPowers: ['伏击', '魔术子弹'],
    superSkill: '跳跃撤退并破坏附近墙体',
    positioning: '开阔图边路/中路消耗',
    stats: { range: 10, mobility: 6, wallBreak: 4, control: 4, burst: 9, sustain: 3, dps: 5, survivability: 5, engage: 2, antiAssassin: 6, ballCarry: 2, zoneHold: 3 },
    metaTier: 'A',
    balancePatchDate: '2026-05-01',
    counters: [
      { targetId: 'byron', strength: 5, reason: '更强单发威胁可迫使辅助退线' },
      { targetId: 'colt', strength: 4, reason: '开阔距离下先手命中收益高' }
    ],
    counteredBy: [
      { targetId: 'mortis', strength: 7, reason: '刺客贴脸会逼掉保命资源' },
      { targetId: 'tick', strength: 5, reason: '投掷可封走位并打断瞄准节奏' }
    ]
  },
  {
    id: 'tick',
    name: '迪克',
    avatar: 'T',
    roles: ['thrower', 'controller'],
    type: '投掷控场',
    gadgets: ['备用地雷', '最后一搏'],
    starPowers: ['自动修复', '快速装填'],
    superSkill: '投出追踪头部逼退敌人',
    positioning: '掩体后封路与消耗',
    stats: { range: 9, mobility: 2, wallBreak: 1, control: 10, burst: 5, sustain: 4, dps: 4, survivability: 3, engage: 1, antiAssassin: 4, ballCarry: 1, zoneHold: 8 },
    metaTier: 'A',
    balancePatchDate: '2026-05-01',
    counters: [
      { targetId: 'piper', strength: 5, reason: '利用墙体封走位限制狙击' },
      { targetId: 'byron', strength: 6, reason: '持续投掷让治疗位难以站住' }
    ],
    counteredBy: [
      { targetId: 'mortis', strength: 9, reason: '极怕突进收割' },
      { targetId: 'max', strength: 6, reason: '团队加速能直接越过雷区' }
    ]
  },
  {
    id: 'barley',
    name: '巴利',
    avatar: 'B',
    roles: ['thrower', 'controller'],
    type: '区域投掷',
    gadgets: ['粘性糖浆', '草本精华'],
    starPowers: ['医疗酒雾', '额外伤害'],
    superSkill: '大范围燃烧瓶封锁区域',
    positioning: '掩体后热区与足球控场',
    stats: { range: 7, mobility: 3, wallBreak: 0, control: 9, burst: 4, sustain: 7, dps: 5, survivability: 4, engage: 2, antiAssassin: 3, ballCarry: 3, zoneHold: 9 },
    metaTier: 'B',
    balancePatchDate: '2026-05-01',
    counters: [
      { targetId: 'frank', strength: 5, reason: '持续地面伤害让坦克难进场' }
    ],
    counteredBy: [
      { targetId: 'mortis', strength: 8, reason: '缺少硬自保，怕连续突进' }
    ]
  },
  {
    id: 'max',
    name: '麦克斯',
    avatar: 'M',
    roles: ['support', 'lane', 'assassin'],
    type: '加速支援',
    gadgets: ['相位偏移', '偷偷溜走'],
    starPowers: ['动感充能', '游击装弹'],
    superSkill: '团队加速，创造开团和转线窗口',
    positioning: '边路压迫与团队节奏',
    stats: { range: 7, mobility: 10, wallBreak: 0, control: 5, burst: 5, sustain: 5, dps: 6, survivability: 7, engage: 8, antiAssassin: 7, ballCarry: 8, zoneHold: 5 },
    metaTier: 'A',
    balancePatchDate: '2026-05-01',
    counters: [
      { targetId: 'tick', strength: 6, reason: '加速能带队越过投掷封锁区' },
      { targetId: 'angelo', strength: 5, reason: '高速转线压缩蓄力长手空间' }
    ],
    counteredBy: [
      { targetId: 'frank', strength: 4, reason: '被控到会丢掉节奏' }
    ]
  },
  {
    id: 'frank',
    name: '弗兰肯',
    avatar: 'F',
    roles: ['tank', 'controller', 'engage'],
    type: '重装开团',
    gadgets: ['主动降噪耳机', '不可阻挡吸引'],
    starPowers: ['力量夺取', '海绵'],
    superSkill: '范围眩晕并破墙',
    positioning: '草丛压迫与前排开团',
    stats: { range: 3, mobility: 3, wallBreak: 8, control: 8, burst: 7, sustain: 8, dps: 7, survivability: 10, engage: 9, antiAssassin: 7, ballCarry: 8, zoneHold: 8 },
    metaTier: 'S',
    balancePatchDate: '2026-05-01',
    counters: [
      { targetId: 'mortis', strength: 7, reason: '高血量与控制让刺客难收割' },
      { targetId: 'tick', strength: 5, reason: '一旦摸到投掷即可强开' }
    ],
    counteredBy: [
      { targetId: 'colt', strength: 6, reason: '破墙后持续输出压制坦克' },
      { targetId: 'angelo', strength: 7, reason: '开阔图会被长手持续放血' }
    ]
  },
  {
    id: 'colt',
    name: '柯尔特',
    avatar: 'C',
    roles: ['damage', 'wall_breaker', 'lane'],
    type: '直线输出',
    gadgets: ['快速装弹', '银弹'],
    starPowers: ['大步流星', '特制左轮'],
    superSkill: '高伤害直线扫射并破墙',
    positioning: '边路拆墙与持续输出',
    stats: { range: 8, mobility: 6, wallBreak: 9, control: 4, burst: 7, sustain: 3, dps: 10, survivability: 4, engage: 2, antiAssassin: 4, ballCarry: 4, zoneHold: 4 },
    metaTier: 'A',
    balancePatchDate: '2026-05-01',
    counters: [
      { targetId: 'frank', strength: 6, reason: '高 DPS 与破墙能拆掉坦克掩护' },
      { targetId: 'barley', strength: 5, reason: '拆墙后投掷生存空间下降' }
    ],
    counteredBy: [
      { targetId: 'piper', strength: 4, reason: '开阔距离容易被高爆发点杀' }
    ]
  },
  {
    id: 'byron',
    name: '拜伦',
    avatar: 'Y',
    roles: ['support', 'sniper', 'mid'],
    type: '治疗消耗',
    gadgets: ['强效治疗', '毒液注射'],
    starPowers: ['不适反应', '注射'],
    superSkill: '瞬发治疗或伤害瓶',
    positioning: '中路续航与远程消耗',
    stats: { range: 10, mobility: 4, wallBreak: 0, control: 5, burst: 4, sustain: 10, dps: 5, survivability: 4, engage: 1, antiAssassin: 4, ballCarry: 2, zoneHold: 6 },
    metaTier: 'A',
    balancePatchDate: '2026-05-01',
    counters: [
      { targetId: 'frank', strength: 5, reason: '持续毒伤能磨坦克血线' }
    ],
    counteredBy: [
      { targetId: 'tick', strength: 6, reason: '被投掷封路后难稳定抬血' },
      { targetId: 'mortis', strength: 6, reason: '怕突进打断治疗循环' }
    ]
  },
  {
    id: 'mortis',
    name: '莫提斯',
    avatar: 'O',
    roles: ['assassin', 'lane'],
    type: '突进刺客',
    gadgets: ['连击转轮', '求生铁锹'],
    starPowers: ['恐怖收割', '蝮蛇出洞'],
    superSkill: '蝙蝠穿透伤害并回血',
    positioning: '后手收割脆皮',
    stats: { range: 2, mobility: 10, wallBreak: 0, control: 2, burst: 7, sustain: 6, dps: 5, survivability: 6, engage: 8, antiAssassin: 4, ballCarry: 7, zoneHold: 2 },
    metaTier: 'B',
    balancePatchDate: '2026-05-01',
    counters: [
      { targetId: 'tick', strength: 9, reason: '能快速贴脸清掉低自保投掷' },
      { targetId: 'piper', strength: 7, reason: '逼出位移后可继续追击' },
      { targetId: 'byron', strength: 6, reason: '可切断后排治疗节奏' }
    ],
    counteredBy: [
      { targetId: 'frank', strength: 7, reason: '被高血量控制英雄限制进场' }
    ]
  },
  {
    id: 'sandy',
    name: '沙迪',
    avatar: 'S',
    roles: ['controller', 'support', 'mid'],
    type: '范围控场',
    gadgets: ['睡眠刺激', '甜美梦境'],
    starPowers: ['狂沙侵袭', '治愈之风'],
    superSkill: '大范围沙暴隐藏队友',
    positioning: '中路控场与团队推进',
    stats: { range: 6, mobility: 5, wallBreak: 0, control: 8, burst: 4, sustain: 7, dps: 5, survivability: 6, engage: 6, antiAssassin: 6, ballCarry: 6, zoneHold: 8 },
    metaTier: 'A',
    balancePatchDate: '2026-05-01',
    counters: [
      { targetId: 'piper', strength: 5, reason: '沙暴能降低长手点杀效率' }
    ],
    counteredBy: [
      { targetId: 'colt', strength: 5, reason: '破墙和持续输出会削弱推进掩护' }
    ]
  },
  {
    id: 'belle',
    name: '贝尔',
    avatar: 'L',
    roles: ['sniper', 'mid', 'damage'],
    type: '标记长手',
    gadgets: ['陷阱装置', '反向极性'],
    starPowers: ['正反馈', '一线生机'],
    superSkill: '标记目标，提高团队集火效率',
    positioning: '中路远程压制',
    stats: { range: 10, mobility: 4, wallBreak: 0, control: 6, burst: 6, sustain: 4, dps: 6, survivability: 5, engage: 2, antiAssassin: 6, ballCarry: 2, zoneHold: 5 },
    metaTier: 'A',
    balancePatchDate: '2026-05-01',
    counters: [
      { targetId: 'frank', strength: 6, reason: '标记后团队处理前排更快' }
    ],
    counteredBy: [
      { targetId: 'mortis', strength: 6, reason: '无位移时怕连续突脸' }
    ]
  },
  {
    id: 'nita',
    name: '妮塔',
    avatar: 'N',
    roles: ['controller', 'damage', 'lane'],
    type: '召唤压制',
    gadgets: ['熊爪', '人造皮毛'],
    starPowers: ['灵魂协同', '狂暴巨熊'],
    superSkill: '召唤熊灵压迫区域或金库',
    positioning: '中近距离站点与推进',
    stats: { range: 5, mobility: 5, wallBreak: 0, control: 7, burst: 5, sustain: 6, dps: 7, survivability: 6, engage: 5, antiAssassin: 6, ballCarry: 5, zoneHold: 8 },
    metaTier: 'B',
    balancePatchDate: '2026-05-01',
    counters: [
      { targetId: 'mortis', strength: 5, reason: '熊灵和范围普攻能限制刺客进场' }
    ],
    counteredBy: [
      { targetId: 'piper', strength: 5, reason: '开阔图容易被长手压制' }
    ]
  }
];
