import { getBrawlerDisplayName, translateRole } from '../data/translations';
import type { Brawler } from '../types/domain';

type SortableBrawler = Brawler & {
  brawlerName?: string;
  heroName?: string;
};

interface Props {
  brawlers: Brawler[];
  selectedIds: string[];
  disabledIds: string[];
  search: string;
  onToggle: (id: string) => void;
  limit?: number;
}

export function BrawlerPicker({ brawlers, selectedIds, disabledIds, search, onToggle, limit = 3 }: Props) {
  const normalized = search.trim().toLowerCase();
  const filtered = brawlers.filter((brawler) => {
    const zhName = getBrawlerDisplayName(brawler);
    return !normalized || brawler.name.toLowerCase().includes(normalized) || zhName.toLowerCase().includes(normalized) || brawler.id.includes(normalized);
  });
  const sortedBrawlers = [...filtered].sort((a, b) =>
    getHeroSortName(a).localeCompare(getHeroSortName(b), 'zh-Hans-CN', {
      sensitivity: 'base',
      numeric: true
    })
  );

  return (
    <div className="grid grid-cols-4 gap-2">
      {sortedBrawlers.map((brawler) => {
        const selected = selectedIds.includes(brawler.id);
        const disabled = !selected && (disabledIds.includes(brawler.id) || selectedIds.length >= limit);
        return (
          <button
            key={brawler.id}
            disabled={disabled}
            onClick={() => onToggle(brawler.id)}
            className={`hex-card min-h-16 border p-2 text-left transition ${
              selected
                ? 'border-neon/70 bg-neon/10 shadow-glow'
                : disabled
                  ? 'border-white/5 bg-white/[0.02] opacity-35'
                  : 'border-white/10 bg-white/[0.04] hover:border-white/25'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-white/10 text-sm font-black text-ink">{brawler.avatar}</div>
              <div className="min-w-0">
                <div className="truncate text-xs font-black text-ink">{getBrawlerDisplayName(brawler)}</div>
                <div className="truncate text-[10px] text-muted">{brawler.roles.slice(0, 2).map(translateRole).join(' / ')}</div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function getHeroSortName(hero: SortableBrawler) {
  return hero.displayNameZh?.trim()
    || hero.name?.trim()
    || hero.brawlerName?.trim()
    || hero.heroName?.trim()
    || hero.id
    || '';
}
