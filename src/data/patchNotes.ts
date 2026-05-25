import type { BalanceChangeType } from '../types/domain';

export interface PatchNoteEntry {
  patchDate: string;
  brawlerId: string;
  type: BalanceChangeType;
  summaryZh: string;
  sourceUrl: string;
}

const officialReleaseNotesUrl = 'https://supercell.com/en/games/brawlstars/blog/release-notes/release-notes-april-2026/';

export const patchNotes: PatchNoteEntry[] = [
  { patchDate: '2026-05-13', brawlerId: 'bull', type: 'nerf', summaryZh: '生命值下调，前排容错降低。', sourceUrl: officialReleaseNotesUrl },
  { patchDate: '2026-05-13', brawlerId: 'crow', type: 'nerf', summaryZh: '生命值下调，持续骚扰时更怕被集火。', sourceUrl: officialReleaseNotesUrl },
  { patchDate: '2026-05-13', brawlerId: 'chester', type: 'nerf', summaryZh: '生命值下调，近中距离换血风险提高。', sourceUrl: officialReleaseNotesUrl },
  { patchDate: '2026-05-13', brawlerId: 'najia', type: 'nerf', summaryZh: '伤害下调，爆发压制能力下降。', sourceUrl: officialReleaseNotesUrl },
  { patchDate: '2026-05-13', brawlerId: 'leon', type: 'nerf', summaryZh: '飞镖伤害下调，秒杀窗口收窄。', sourceUrl: officialReleaseNotesUrl },
  { patchDate: '2026-05-13', brawlerId: 'mortis', type: 'nerf', summaryZh: '基础伤害下调，连续收割稳定性下降。', sourceUrl: officialReleaseNotesUrl },
  { patchDate: '2026-05-13', brawlerId: 'pierce', type: 'nerf', summaryZh: '生命值和伤害下调，压制能力降低。', sourceUrl: officialReleaseNotesUrl },
  { patchDate: '2026-05-13', brawlerId: 'bibi', type: 'nerf', summaryZh: '星徽相关护盾削弱，抗压能力下降。', sourceUrl: officialReleaseNotesUrl },
  { patchDate: '2026-05-13', brawlerId: 'sirius', type: 'nerf', summaryZh: '生命值、伤害和超级技能相关数值下调。', sourceUrl: officialReleaseNotesUrl },
  { patchDate: '2026-05-13', brawlerId: 'maisie', type: 'buff', summaryZh: '基础伤害提高，中远距离压制能力上升。', sourceUrl: officialReleaseNotesUrl },
  { patchDate: '2026-05-13', brawlerId: 'draco', type: 'buff', summaryZh: '生命值提高，正面抗压和持续作战更稳定。', sourceUrl: officialReleaseNotesUrl },
  { patchDate: '2026-05-13', brawlerId: 'griff', type: 'rework', summaryZh: '星徽机制调整，需要重新评估实战强度。', sourceUrl: officialReleaseNotesUrl },
  { patchDate: '2026-05-13', brawlerId: 'edgar', type: 'rework', summaryZh: '星徽机制调整，需要重新评估后手切入价值。', sourceUrl: officialReleaseNotesUrl },
  { patchDate: '2026-05-13', brawlerId: 'colette', type: 'rework', summaryZh: '星徽机制调整，需要重新评估反坦克表现。', sourceUrl: officialReleaseNotesUrl }
];

