import { useMemo, useState } from 'react';
import { brawlers, knowledgeBase, maps, metaInfo } from './data';
import { buildAnalysis, recommendBans, recommendCompositions, recommendCounterPicks, recommendPicks } from './algorithm/recommendations';
import { AnalysisPanel } from './components/AnalysisPanel';
import { DraftBoard } from './components/DraftBoard';
import { MapSelector } from './components/MapSelector';
import { RecommendationPanel } from './components/RecommendationPanel';
import { TopBar } from './components/TopBar';
import type { DraftState, GameMode } from './types/domain';

const firstMap = maps[0];

export default function App() {
  const [selectedMode, setSelectedMode] = useState<GameMode>(firstMap.gameMode);
  const [selectedMapId, setSelectedMapId] = useState(firstMap.mapId);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<DraftState>({
    allyPicks: ['sandy'],
    enemyPicks: ['tick'],
    allyBans: [],
    enemyBans: [],
    considerMeta: true,
    strategyMode: 'balanced'
  });

  const selectedMap = useMemo(() => maps.find((map) => map.mapId === selectedMapId) ?? maps[0], [selectedMapId]);

  const recommendations = useMemo(() => recommendPicks(brawlers, selectedMap, draft, knowledgeBase), [selectedMap, draft]);
  const counters = useMemo(() => recommendCounterPicks(brawlers, selectedMap, draft, knowledgeBase), [selectedMap, draft]);
  const bans = useMemo(() => recommendBans(brawlers, selectedMap, draft, knowledgeBase), [selectedMap, draft]);
  const composition = useMemo(() => recommendCompositions(recommendations), [recommendations]);
  const analysis = useMemo(() => buildAnalysis(brawlers, selectedMap, draft), [selectedMap, draft]);

  const handleModeChange = (mode: GameMode) => {
    const nextMap = maps.find((map) => map.gameMode === mode);
    setSelectedMode(mode);
    if (nextMap) setSelectedMapId(nextMap.mapId);
  };

  return (
    <main className="min-h-screen p-5 text-ink">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-4">
        <TopBar
          currentVersion={metaInfo.currentVersion}
          dataUpdatedAt={metaInfo.dataUpdatedAt}
          search={search}
          onSearchChange={setSearch}
          strategyMode={draft.strategyMode}
          onStrategyChange={(strategyMode) => setDraft((current) => ({ ...current, strategyMode }))}
          considerMeta={draft.considerMeta}
          onConsiderMetaChange={(considerMeta) => setDraft((current) => ({ ...current, considerMeta }))}
        />

        <div className="grid h-[calc(100vh-136px)] grid-cols-[310px_minmax(620px,1fr)_390px] gap-4">
          <MapSelector
            maps={maps}
            selectedMode={selectedMode}
            selectedMapId={selectedMapId}
            onModeChange={handleModeChange}
            onMapChange={setSelectedMapId}
          />

          <div className="flex min-h-0 flex-col gap-4">
            <DraftBoard brawlers={brawlers} draft={draft} search={search} onDraftChange={setDraft} />
            <AnalysisPanel analysis={analysis} />
          </div>

          <RecommendationPanel picks={recommendations} counters={counters} bans={bans} composition={composition} />
        </div>
      </div>
    </main>
  );
}
