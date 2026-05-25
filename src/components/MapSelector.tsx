import { MapPinned } from 'lucide-react';
import { checkMapFreshness, getMapMetaSnapshot } from '../data';
import { getMapDisplayName, getModeDisplayName, translateMapPoolStatus, translateTag, zhCN } from '../data/translations';
import type { BrawlMap, GameMode } from '../types/domain';

interface Props {
  maps: BrawlMap[];
  selectedMode: GameMode;
  selectedMapId: string;
  onModeChange: (mode: GameMode) => void;
  onMapChange: (mapId: string) => void;
}

const modeOrder: GameMode[] = ['gem_grab', 'brawl_ball', 'hot_zone', 'bounty', 'knockout', 'heist', 'duels', 'wipeout'];

export function MapSelector({ maps, selectedMode, selectedMapId, onModeChange, onMapChange }: Props) {
  const availableModes = modeOrder.filter((mode) => maps.some((map) => map.gameMode === mode));
  const modeMaps = maps.filter((map) => map.gameMode === selectedMode);
  const selectedMap = maps.find((map) => map.mapId === selectedMapId) ?? modeMaps[0];
  const selectedMapMeta = selectedMap ? getMapMetaSnapshot(selectedMap.mapId) : null;
  const selectedMapFreshness = selectedMapMeta ? checkMapFreshness(selectedMapMeta) : null;

  return (
    <aside className="panel flex h-full flex-col rounded-lg p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-ink">{zhCN.ui.mapAndMode}</h2>
          <p className="mt-1 text-xs text-muted">{zhCN.ui.mapModeSubtitle}</p>
        </div>
        <MapPinned className="text-neon" size={20} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {availableModes.map((mode) => (
          <button
            key={mode}
            className={`rounded-md border px-3 py-2 text-left text-xs font-bold transition ${
              selectedMode === mode ? 'border-neon/60 bg-neon/10 text-neon' : 'border-white/10 bg-white/[0.035] text-slate-300 hover:border-white/25'
            }`}
            onClick={() => onModeChange(mode)}
          >
            {getModeDisplayName(mode)}
          </button>
        ))}
      </div>

      {selectedMap && (
        <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3">
          <div className="relative h-36 overflow-hidden rounded-md border border-white/10" style={{ background: selectedMap.mapImage }}>
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute bottom-3 left-3">
              <div className="text-lg font-black text-white">{getMapDisplayName(selectedMap)}</div>
              <div className="text-xs text-slate-300">{getModeDisplayName(selectedMap.gameMode)}</div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <Metric label="开阔" value={selectedMap.openness} />
            <Metric label="墙体" value={selectedMap.wallDensity} />
            <Metric label="草丛" value={selectedMap.bushDensity} />
          </div>

          {selectedMapMeta && (
            <div className="mt-3 rounded-md border border-white/10 bg-white/[0.035] p-2 text-xs leading-5 text-slate-300">
              <div>地图池：{translateMapPoolStatus(selectedMapMeta.mapPoolStatus)} / {selectedMapMeta.currentRotation ? '当前轮换' : '未确认当前轮换'}</div>
              <div>地图数据更新：{selectedMapMeta.lastUpdated}</div>
              {selectedMapFreshness?.stale && <div className="text-ember">地图池数据可能过期或状态不确定。</div>}
              {selectedMapMeta.mapPoolStatus === 'archived' && <div className="text-ember">该地图可能不属于当前版本排位池。</div>}
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {selectedMap.tags.map((tag) => (
              <span key={tag} className="rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-slate-300">
                {translateTag(tag)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex-1 space-y-2 overflow-auto pr-1">
        {modeMaps.map((map) => (
          <button
            key={map.mapId}
            className={`w-full rounded-md border p-3 text-left transition ${
              selectedMapId === map.mapId ? 'border-neon/60 bg-neon/10' : 'border-white/10 bg-white/[0.03] hover:border-white/25'
            }`}
            onClick={() => onMapChange(map.mapId)}
          >
            <div className="font-bold text-ink">{getMapDisplayName(map)}</div>
            <div className="mt-1 text-xs text-muted">{map.tags.slice(0, 3).map(translateTag).join(' / ')}</div>
          </button>
        ))}
      </div>
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.035] px-2 py-2">
      <div className="text-base font-black text-ink">{value}</div>
      <div className="text-[11px] text-muted">{label}</div>
    </div>
  );
}
