import { AlertTriangle, Ban, Crosshair, ShieldCheck, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { getDraftStage, getDraftStageLabel, getDraftStageReason, sideLabel } from '../algorithm/draft';
import { getBrawlerDisplayName, translateReason, translateRole, translateTag, zhCN } from '../data/translations';
import type { BanRecommendation, Brawler, DraftState, PickRecommendation } from '../types/domain';
import { scoreTone } from '../utils/format';

interface Props {
  draft: DraftState;
  picks: PickRecommendation[];
  counters: PickRecommendation[];
  bans: BanRecommendation[];
  composition: {
    name: string;
    brawlers: Brawler[];
    reason: string;
  };
}

export function RecommendationPanel({ draft, picks, counters, bans, composition }: Props) {
  const draftStage = getDraftStage(draft);
  return (
    <aside className="panel flex h-full flex-col gap-4 overflow-hidden rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-ink">{zhCN.ui.recommendations}</h2>
          <p className="mt-1 text-xs text-muted">{zhCN.ui.explainable}</p>
        </div>
        <Sparkles className="text-neon" size={20} />
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-auto pr-1">
        <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
          <div className="flex items-center justify-between text-xs font-black text-ink">
            <span>{sideLabel(draft.teamSide)}</span>
            <span>{getDraftStageLabel(draftStage)}</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-muted">{getDraftStageReason(draft)}</p>
        </div>

        <SectionTitle icon={<ShieldCheck size={16} />} title={zhCN.ui.firstPicks} />
        <div className="space-y-3">
          {picks.slice(0, 3).map((item, index) => (
            <RecommendationCard key={item.brawler.id} item={item} rank={index + 1} />
          ))}
        </div>

        <SectionTitle icon={<Crosshair size={16} />} title={zhCN.ui.counterPicks} />
        <div className="grid gap-2">
          {counters.length ? counters.map((item) => <MiniPick key={item.brawler.id} item={item} />) : <div className="rounded-md border border-white/10 bg-white/[0.03] p-3 text-xs text-muted">{zhCN.ui.noCounter}</div>}
        </div>

        <SectionTitle icon={<Ban size={16} />} title={zhCN.ui.recommendedBans} />
        <div className="space-y-2">
          {bans.slice(0, 4).map((ban) => (
            <div key={ban.brawler.id} className="rounded-md border border-danger/20 bg-danger/10 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded bg-white/10 text-xs font-black text-ink">{ban.brawler.avatar}</span>
                  <div>
                    <div className="text-sm font-black text-ink">{getBrawlerDisplayName(ban.brawler)}</div>
                    <div className="text-[11px] text-muted">{ban.brawler.roles.map(translateRole).slice(0, 2).join(' / ')}</div>
                  </div>
                </div>
                <div className="text-lg font-black text-danger">{ban.score}</div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {ban.reasons.map((reason) => (
                  <span key={reason} className="rounded border border-white/10 bg-black/20 px-2 py-1 text-[11px] text-slate-300">
                    {translateReason(reason)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <SectionTitle icon={<Sparkles size={16} />} title={zhCN.ui.composition} />
        <div className="rounded-lg border border-neon/25 bg-neon/10 p-3">
          <div className="text-sm font-black text-ink">{composition.brawlers.length ? composition.brawlers.map(getBrawlerDisplayName).join(' + ') : zhCN.ui.pendingRecommendation}</div>
          <div className="mt-2 flex gap-2">
            {composition.brawlers.map((brawler) => (
              <span key={brawler.id} className="rounded-md border border-white/10 bg-black/25 px-2 py-1 text-xs text-slate-200">
                {getBrawlerDisplayName(brawler)}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs leading-5 text-muted">{translateReason(composition.reason)}</p>
        </div>
      </div>
    </aside>
  );
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs font-black text-ink">
      <span className="text-neon">{icon}</span>
      {title}
    </div>
  );
}

function RecommendationCard({ item, rank }: { item: PickRecommendation; rank: number }) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.04] p-3 shadow-glow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-neon/25 to-ember/20 text-lg font-black text-ink">{item.brawler.avatar}</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-neon/15 px-2 py-1 text-[11px] font-black text-neon">#{rank}</span>
              <h3 className="font-black text-ink">{getBrawlerDisplayName(item.brawler)}</h3>
            </div>
            <div className="mt-1 text-xs text-muted">{item.brawler.roles.map(translateRole).slice(0, 3).join(' / ')}</div>
          </div>
        </div>
        <div className={`text-2xl font-black ${scoreTone(item.score.total)}`}>{item.score.total}</div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
        <Score label={zhCN.ui.mapScore} value={item.score.mapFit} />
        <Score label={zhCN.ui.modeScore} value={item.score.modeFit} />
        <Score label={zhCN.ui.synergyScore} value={item.score.synergy} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {item.score.reasons.slice(0, 4).map((reason) => (
          <span key={reason} className="rounded border border-emerald-300/15 bg-emerald-300/10 px-2 py-1 text-[11px] text-emerald-100">
            {translateReason(reason)}
          </span>
        ))}
      </div>
      {item.score.risks.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {item.score.risks.slice(0, 3).map((risk) => (
            <span key={risk} className="inline-flex items-center gap-1 rounded border border-danger/20 bg-danger/10 px-2 py-1 text-[11px] text-rose-100">
              <AlertTriangle size={11} />
              {translateReason(risk)}
            </span>
          ))}
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-1">
        {item.score.tags.map((tag) => (
          <span key={tag} className="rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-slate-300">
            {translateTag(tag)}
          </span>
        ))}
      </div>
    </article>
  );
}

function MiniPick({ item }: { item: PickRecommendation }) {
  const reason = item.score.reasons.find((entry) => entry.includes('克制')) ?? item.brawler.roles.map(translateRole).slice(0, 2).join(' / ');
  return (
    <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded bg-white/10 text-xs font-black text-ink">{item.brawler.avatar}</span>
        <div>
          <div className="text-sm font-black text-ink">{getBrawlerDisplayName(item.brawler)}</div>
          <div className="text-[11px] text-muted">{translateReason(reason)}</div>
        </div>
      </div>
      <span className={`font-black ${scoreTone(item.score.total)}`}>{item.score.total}</span>
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-white/10 bg-black/20 px-2 py-2">
      <div className="font-black text-ink">{value}</div>
      <div className="text-muted">{label}</div>
    </div>
  );
}
