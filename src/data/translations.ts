import type { BrawlMap, Brawler, BrawlerRole, GameMode, MetaTier } from '../types/domain';

export const zhCN = {
  brawlers: {
    Shelly: '雪莉',
    Colt: '柯尔特',
    Bull: '公牛',
    Brock: '布洛克',
    Barley: '巴利',
    Nita: '妮塔',
    'El Primo': '艾尔·普里莫',
    Poco: '波克',
    Rosa: '罗莎',
    Rico: '瑞科',
    Jessie: '杰西',
    Dynamike: '爆破麦克',
    Darryl: '达里尔',
    Penny: '潘妮',
    Tick: '迪克',
    Carl: '卡尔',
    '8-Bit': '8比特',
    Jacky: '雅琪',
    Gus: '格斯',
    Bo: '阿渤',
    Piper: '佩佩',
    Pam: '帕姆',
    Frank: '弗兰肯',
    Bibi: '比比',
    Bea: '贝亚',
    Emz: '艾魅',
    Gale: '格尔',
    Nani: '纳妮',
    Colette: '科莱特',
    Edgar: '艾德加',
    Stu: '斯图',
    Belle: '贝尔',
    Grom: '格罗姆',
    Griff: '格里夫',
    Ash: '阿拾',
    Lola: '萝拉',
    Bonnie: '邦妮',
    Sam: '山姆',
    Mandy: '曼迪',
    Maisie: '麦茜',
    Hank: '汉克',
    Pearl: '珀尔',
    'Larry & Lawrie': '拉里和劳里',
    Angelo: '安吉洛',
    Berry: '拜瑞',
    Shade: '谢德',
    Meeple: '谜宝',
    Trunk: '桩',
    Bolt: '博尔特',
    Mortis: '莫提斯',
    Tara: '塔拉',
    Gene: '吉恩',
    'Mr. P': 'P先生',
    Max: '麦克斯',
    Sprout: '芽芽',
    Lou: '小罗',
    Byron: '拜伦',
    Ruffs: '拉夫',
    Squeak: '史魁克',
    Buzz: '巴兹',
    Fang: '阿方',
    Eve: '伊芙',
    Janet: '珍妮特',
    Otis: '奥蒂斯',
    Buster: '巴斯特',
    Gray: '戈雷',
    'R-T': '阿尔缇',
    Willow: '薇洛',
    Doug: '道格',
    Chuck: '查克',
    Charlie: '查莉',
    Mico: '米科',
    Melodie: '麦乐迪',
    Lily: '莉莉',
    Clancy: '克兰西',
    Moe: '阿萌',
    Juju: '珠珠',
    Ollie: '奥利',
    Lumi: '露米',
    Finx: '芬克斯',
    'Jae-Yong': '载勇',
    Alli: '鳄梨',
    Mina: '蜜娜',
    Ziggy: '兹奇',
    Gigi: '琪琪',
    Glowy: '格鲁伊',
    Najia: '娜吉亚',
    Damian: '达米安',
    'Starr Nova': '丝塔诺娃',
    Spike: '斯派克',
    Crow: '黑鸦',
    Leon: '里昂',
    Sandy: '沙迪',
    Surge: '瑟奇',
    Amber: '琥珀',
    Meg: '梅格',
    Chester: '切斯特',
    Cordelius: '科迪琉斯',
    Kit: '凯特',
    Draco: '德拉科',
    Kenji: '健次',
    Pierce: '皮尔斯',
    Kaze: '风姬',
    Sirius: '西里乌斯'
  } as Record<string, string>,
  maps: {
    'Hard Rock Mine': '硬石矿井',
    'Shooting Star': '神秘流星',
    'Safe Zone': '安全区域',
    'Super Beach': '超级海滩',
    'Double Swoosh': '嗖嗖作响',
    'Ring Of Fire': '灼热火圈',
    'Dueling Beetles': '甲虫决斗',
    'Out In The Open': '空旷荒野',
    'Crystal Arcade': '水晶街机厅',
    'Gem Fort': '宝石要塞',
    Undermine: '混乱地带',
    'Rustic Arcade': '乡趣游乐场',
    'Open Space': '开阔地带',
    'Lilygear Lake': '惊魂湖泊',
    'Local Restaurants': '当地饭店',
    'On A Roll': '连续成功',
    'Whisper Vale': '密语山谷',
    'Extreme Nonchalance': '十面埋伏',
    Picturesque: '优美风景',
    'Satomi Springs': '春意盎然',
    'Ancestral Roots': '原始根茎',
    'Kaboom Canyon': '轰隆峡谷',
    'Hot Potato': '烫手山芋',
    'Bridge Too Far': '遥远的桥',
    'Pit Stop': '维修站台',
    'Plain Text': '文本格式',
    'Subway Turfers': '地铁滑板',
    Quintillion: '天文数字',
    'Tuning Fork': '调音设备',
    'Eating Good': '大快朵颐',
    Hideout: '藏身处',
    'Layer Cake': '夹心蛋糕',
    'Dry Season': '旱季',
    'No Excuses': '责任自负',
    'Dont Turn Around': '切勿转身',
    'Side By Side': '并肩作战',
    'Brace For Impact': '防御姿势',
    Starrburst: '星妙大爆炸',
    'Wall Hugging': '贴墙走位',
    'Choral Chambers': '合唱大厅',
    Watermelons: '西瓜成山',
    'Hit And Run': '肇事逃逸',
    'Backyard Bowl': '后院球场',
    'Triple Dribble': '三重威胁',
    'Pinhole Punt': '精准射门',
    'Sneaky Fields': '绿荫球场',
    'Pinball Dreams': '梦幻弹珠',
    'Center Stage': '中心舞台',
    'Beach Ball': '沙滩足球',
    'Sunny Soccer': '阳光球场',
    'Priceless Cactus': '无价仙人掌',
    'Grass Knot': '草绳结',
    'Spiraling Out': '盘旋而出',
    Sidetrack: '偏离正轨',
    'Match 1123581321': '斐波纳契数列',
    Goalies: '守门大师',
    'Open Business': '开门营业',
    'Parallel Plays': '平行游戏',
    'Open Zone': '开放区域',
    'Fishing Bed': '钓鱼基地',
    Abracadabra: '神奇魔咒',
    Playmaker: '主攻队员',
    'Just Another Race To Anywhere': '随处狂奔',
    'Back Shuffle': '倒步乱舞',
    'Zone Splitting': '区域分裂',
    'Ticket To Die': '临界点',
    'Tax Evasion': '逃税',
    'Golden Bay': '金色海湾',
    'Hyacinth House': '紫蓝房屋',
    'Goldarm Gulch': '金臂峡谷',
    'Belles Rock': '贝尔岩',
    'Deep End': '深水区',
    'Flaring Phoenix': '烈焰凤凰',
    'Flowing Springs': '潺潺溪流',
    'New Perspective': '全新视角',
    'Healthy Middle Ground': '疗伤中场',
    'New Horizons': '新地平线',
    'Four Levels': '四层空间',
    'Double Decker': '双层甲板',
    'Streets With No Name': '无名街',
    'Think Ahead': '未雨绸缪',
    Chivalry: '骑士精神',
    Konnakol: '口技舞台',
    'Pinned Down': '钉死防线',
    'Opening Move': '好戏开场',
    'Crab Claws': '螃蟹大螯',
    'Please Remain Standing': '保持站立',
    'Twentyfive To Two': '1点35',
    'Time Flies': '时光飞逝',
    Catacombs: '骸骨地穴',
    Deathmatch: '殊死搏斗',
    'Pound Of Mass': '巨力一击',
    Wonderland: '梦幻乐园',
    'Walking On Hot Sand': '步行热沙',
    'Too Gimmicky 2': '花样百出',
    'Palette Hangout': '画板聚会',
    Attrition: '战斗减员',
    'No Surrender': '勇往直前',
    'Shrouding Serpent': '潜影巨蛇',
    'Warriors Way': '勇士之道',
    'Monkey Maze': '猿猴迷阵',
    'Coin Flip': '抛硬币',
    'Search And Destroy': '搜寻毁灭',
    'The Great Mighty Lou': '伟大小罗',
    'Paralysis Pen': '麻痹掩体',
    'Jumpscare Lair': '骇人巢穴'
  } as Record<string, string>,
  modes: {
    gem_grab: '宝石争霸',
    brawl_ball: '乱斗足球',
    hot_zone: '热区争夺',
    bounty: '赏金猎人',
    knockout: '淘汰赛',
    heist: '金库攻防',
    duels: '决斗',
    wipeout: '擂台淘汰'
  } as Record<GameMode, string>,
  roles: {
    mid: '中路',
    lane: '边路',
    thrower: '投掷',
    sniper: '长手',
    assassin: '刺客',
    tank: '坦克',
    support: '辅助',
    controller: '控场',
    damage: '输出',
    wall_breaker: '破墙',
    engage: '开团'
  } as Record<BrawlerRole, string>,
  classes: {
    Unknown: '待确认定位',
    'Damage Dealer': '输出',
    Tank: '坦克',
    Marksman: '射手',
    Artillery: '投掷',
    Controller: '控场',
    Assassin: '刺客',
    Support: '辅助'
  } as Record<string, string>,
  rarity: {
    Common: '初始英雄',
    'Starting Brawler': '初始英雄',
    Rare: '稀有',
    'Super Rare': '超稀有',
    Epic: '史诗',
    Mythic: '神话',
    Legendary: '传奇',
    'Ultra Legendary': '至高传奇',
    Unknown: '待确认'
  } as Record<string, string>,
  strategy: {
    balanced: '综合推荐',
    safe: '稳健',
    aggressive: '激进',
    pro: '职业比赛',
    ladder: '路人局'
  },
  tags: {
    open: '开阔',
    balanced: '均衡',
    wall_dense: '墙多',
    wall_light: '墙少',
    bushy: '草多',
    low_bush: '草少',
    wall_break_value: '需要破墙',
    standard_routes: '常规路线',
    short_range: '短手',
    long_range: '长手',
    thrower: '投掷',
    assassin: '刺客',
    tank: '坦克',
    anti_tank: '反坦克',
    anti_assassin: '反刺客',
    wall_break: '破墙',
    grass_reveal: '探草',
    burst_damage: '爆发伤害',
    area_control: '区域控制',
    healer: '治疗',
    mid_control: '中路控制',
    lane_pressure: '边路压制',
    safe_dps: '稳定输出',
    objective_control: '目标压制',
    crowd_control: '控制',
    knockback: '击退',
    mobility: '机动',
    shield: '护盾',
    spawnable: '召唤物',
    weak_to_thrower: '怕投掷',
    weak_to_assassin: '怕刺客',
    weak_to_tank: '怕坦克',
    weak_to_wall_break: '怕破墙',
    low_hp: '低血量',
    low_burst: '爆发不足',
    poor_escape: '逃生弱',
    reload_dependent: '依赖换弹',
    weak_to_long_range: '怕长手',
    weak_to_crowd_control: '怕控制',
    low_anti_assassin: '反刺客弱',
    no_wall_break: '缺少破墙',
    flex_pick: '灵活选择',
    'flex pick': '灵活选择',
    'needs manual review': '需要人工确认',
    'steady damage': '稳定输出',
    'lane pressure': '边路压制',
    'frontline pressure': '前排压迫',
    engage: '开团',
    'long range pressure': '长手压制',
    'pick potential': '点杀能力',
    'wall pressure': '墙后压制',
    'area denial': '区域封锁',
    'objective control': '目标控制',
    'space denial': '空间压制',
    'backline threat': '威胁后排',
    cleanup: '收割',
    'team utility': '团队功能',
    sustain: '续航',
    'can lack utility': '功能性不足',
    'can struggle on open maps': '开阔图压力大',
    'vulnerable when rushed': '怕突脸',
    'weak to assassins': '怕刺客',
    'needs team follow up': '需要队友跟进',
    'risky into anti-assassin comps': '怕反刺客阵容',
    'can lack solo carry damage': '单核输出不足'
  } as Record<string, string>,
  quality: {
    official: '官方译名',
    community: '社区常用',
    verified: '已确认',
    estimated: '估算',
    todo: '待确认'
  },
  mapPoolStatus: {
    ranked: '排位地图池',
    competitive: '竞技常用',
    casual: '娱乐模式',
    archived: '旧版/归档',
    unknown: '地图池待确认'
  },
  metaTier: {
    S: 'S 级：版本强势',
    A: 'A 级：稳定优先',
    B: 'B 级：可用',
    C: 'C 级：偏弱',
    D: 'D 级：谨慎选择'
  } as Record<MetaTier, string>,
  ui: {
    noData: '暂无数据',
    slot: '位置',
    mapScore: '地图',
    modeScore: '模式',
    synergyScore: '协同',
    mapAndMode: '地图与模式',
    mapModeSubtitle: '选择当前排位 / 赛事环境',
    draftBoard: 'BP 面板',
    draftSubtitle: '点击英雄加入或移出选择 / 禁用位',
    allyBan: '我方禁用',
    enemyBan: '敌方禁用',
    allyPick: '我方选择',
    enemyPick: '敌方选择',
    selectAllyPick: '选择我方英雄',
    selectEnemyPick: '选择敌方英雄',
    maxThree: '最多 3 位',
    recommendations: '推荐结果',
    explainable: '所有建议都带可解释理由',
    firstPicks: '首选英雄',
    counterPicks: '后手克制',
    recommendedBans: '推荐禁用',
    composition: '推荐阵容组合',
    noCounter: '敌方选择较少，暂无明确克制点。',
    pendingRecommendation: '等待更多推荐',
    strengths: '阵容优势',
    risks: '风险提示',
    counterPlan: '克制计划',
    searchBrawler: '搜索英雄',
    metaStrength: '版本强度',
    currentVersion: '版本',
    dataUpdated: '数据更新'
  }
};

export function todoLabel(value: string) {
  return `待确认：${value}`;
}

export function getBrawlerDisplayName(brawler: Pick<Brawler, 'name' | 'displayNameZh'>) {
  return zhCN.brawlers[brawler.name] ?? (brawler.displayNameZh && brawler.displayNameZh !== brawler.name ? brawler.displayNameZh : todoLabel(brawler.name));
}

export function getMapDisplayName(map: Pick<BrawlMap, 'mapId' | 'mapName' | 'displayNameZh'>) {
  const displayNameZh = map.displayNameZh?.trim();
  return displayNameZh || todoLabel(map.mapName || map.mapId);
}

export function getModeDisplayName(mode: GameMode) {
  return zhCN.modes[mode] ?? todoLabel(mode);
}

export function translateRole(role: string) {
  return zhCN.roles[role as BrawlerRole] ?? zhCN.classes[role] ?? translateTag(role);
}

export function translateTag(tag: string) {
  return zhCN.tags[tag] ?? zhCN.modes[tag as GameMode] ?? todoLabel(tag);
}

export function translateRarity(value?: string) {
  return value ? zhCN.rarity[value] ?? todoLabel(value) : zhCN.rarity.Unknown;
}

export function translateQuality(value?: string) {
  return value ? zhCN.quality[value as keyof typeof zhCN.quality] ?? todoLabel(value) : zhCN.quality.todo;
}

export function translateMapPoolStatus(value?: string) {
  return value ? zhCN.mapPoolStatus[value as keyof typeof zhCN.mapPoolStatus] ?? todoLabel(value) : zhCN.mapPoolStatus.unknown;
}

export function translateMetaTier(value: MetaTier) {
  return zhCN.metaTier[value] ?? todoLabel(value);
}

export function translateReason(text: string) {
  let output = text;
  for (const [english, chinese] of Object.entries(zhCN.brawlers)) {
    output = output.replaceAll(english, chinese);
  }
  for (const [english, chinese] of Object.entries(zhCN.maps)) {
    output = output.replaceAll(english, chinese);
  }
  return output
    .replace(/Long range poke can pressure tanks before they engage\./g, '长手消耗能在坦克开团前压低血线。')
    .replace(/Stronger range and burst windows into support lanes\./g, '射程和爆发窗口更好，能压制辅助位。')
    .replace(/Speed engage can compress Angelo charge windows\./g, '加速开团会压缩安吉洛蓄力空间。')
    .replace(/Low margin if a dash assassin reaches him\./g, '被突进刺客贴脸后容错较低。')
    .replace(/High burst can force support picks off angles\./g, '高爆发能迫使辅助离开关键角度。')
    .replace(/Assassins can force defensive tools quickly\./g, '刺客能快速逼出保命资源。')
    .replace(/Can use walls to deny sniper movement\./g, '可以利用墙体限制长手走位。')
    .replace(/Very vulnerable to direct assassin dives\./g, '非常怕刺客直接突进。')
    .replace(/Brawlify active maps API/g, 'Brawlify 活跃地图数据')
    .replace(/Ranked inclusion not independently verified/g, '排位地图池归属仍需人工确认')
    .replace(/terrain ratings estimated from mode\/name heuristics/g, '地形评分为模式和名称启发式估算')
    .replace(/\bflex pick\b/g, '灵活选择')
    .replace(/\bneeds manual review\b/g, '需要人工确认')
    .replace(/\bsteady damage\b/g, '稳定输出')
    .replace(/\blane pressure\b/g, '边路压制')
    .replace(/\bfrontline pressure\b/g, '前排压迫')
    .replace(/\bbackline threat\b/g, '威胁后排')
    .replace(/\bcleanup\b/g, '收割')
    .replace(/\bteam utility\b/g, '团队功能')
    .replace(/\bsustain\b/g, '续航');
}
