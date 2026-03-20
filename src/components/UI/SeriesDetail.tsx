import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import type { Episode, Season, Series } from '../../types';
import { indexedDbStorage } from '../../utils/indexedDbStorage';
import { getProgress } from '../../utils/progressWatched';
import EpisodeCard from '../Cards/EpisodeCard';
import { VideoPlayer } from '../Player/VideoPlayer';
import { ButtonBack } from './ButtonBack';
import { LoadingSpinner } from './LoadingSpinner';
import SeasonSelector from './SeasonSelector';
import SeriesHeroBanner from './SeriesHeroBanner';

interface SeriesDetailProps {
  series: Series | null;
  onBack: () => void;
  onToggleFavorite?: (seriesId: string) => void;
  onToggleWatched?: (episodeId: string) => void;
  onLoadDetail?: (seriesId: string) => Promise<Season[]>;
  currentEpisodeId?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getTotalProgress = (seasons: Season[]) => {
  const allEps = seasons.flatMap((s) => s.episodes);
  if (!allEps.length) return { watched: 0, total: 0, percent: 0 };
  const watched = allEps.filter((e) => e.watched).length;
  return {
    watched,
    total: allEps.length,
    percent: Math.round((watched / allEps.length) * 100),
  };
};

const findNextEpisode = (seasons: Season[], currentEpisodeId?: string): Episode | null => {
  const allEps = seasons.flatMap((s) => s.episodes);
  if (currentEpisodeId) {
    const idx = allEps.findIndex((e) => e.id === currentEpisodeId);
    return allEps[idx + 1] ?? null;
  }
  return allEps.find((e) => !e.watched) ?? allEps[0] ?? null;
};

const findNextSeasonForEpisode = (seasons: Season[], episodeId: string): number => {
  for (const season of seasons) {
    if (season.episodes.some((e) => e.id === episodeId)) return season.number;
  }
  return 1;
};

export const SeriesDetail = ({
  series,
  onBack,
  onToggleFavorite,
  onToggleWatched,
  onLoadDetail,
  currentEpisodeId,
}: SeriesDetailProps) => {
  const { activeProfile } = useAuthStore();
  const profileId = activeProfile?.id;
  const [activeSeason, setActiveSeason] = useState(1);
  const [seasons, setSeasons] = useState<Season[]>(series?.seasons || []);
  const [loading, setLoading] = useState(false);
  const [isPlay, setIsPlay] = useState(false);
  const episodesRef = useRef<HTMLDivElement>(null);
  const { watched, total, percent } = getTotalProgress(seasons);
  const nextEpisode = findNextEpisode(seasons, currentEpisodeId);
  const nextSeasonNumber = nextEpisode ? findNextSeasonForEpisode(seasons, nextEpisode.id) : 1;
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const currentEpisodes = seasons.find((s) => s.number === activeSeason)?.episodes ?? [];
  const loadProgressForEpisodes = (episodes: Episode[]) => {
    return Promise.all(
      episodes.map(async (episode) => {
        const progress = await getProgress('series', profileId!, episode.id);
        return {
          ...episode,
          watched: progress.watched,
          progress: progress.progress,
          duration: progress.duration,
        };
      })
    );
  };
  // Carregar detalhes da série
  useEffect(() => {
    if (!series || series.loaded || !onLoadDetail) return;

    const load = async () => {
      setLoading(true);
      try {
        // ── Tentar cache primeiro ──────────────────────────────────────
        let loadedSeasons: Season[] | null = null;

        const cached = await indexedDbStorage.get(`list_episodes_cache_${series.id}`);

        if (cached && Array.isArray(cached)) {
          console.log('📺 Episódios carregados do cache:', series.id);
          loadedSeasons = cached as Season[];
        } else {
          // ── Carregar da API ──────────────────────────────────────────
          console.log('🌐 Carregando episódios da API:', series.id);
          loadedSeasons = await onLoadDetail(series.id);

          // Salvar no cache
          await indexedDbStorage
            .set(`list_episodes_cache_${series.id}`, loadedSeasons)
            .catch((e) => console.error('❌ Erro ao salvar cache:', e));
        }

        // ── Enriquecer com progresso ───────────────────────────────────
        const seasonsWithProgress = await Promise.all(
          loadedSeasons.map(async (season: Season) => {
            const episodes = await loadProgressForEpisodes(season.episodes);
            return { ...season, episodes };
          })
        );

        setSeasons(seasonsWithProgress);

        // ── Ir para temporada do episódio atual ────────────────────────
        if (currentEpisodeId) {
          const seasonNum = findNextSeasonForEpisode(seasonsWithProgress, currentEpisodeId);
          setActiveSeason(seasonNum);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar episódios:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [series?.id]);

  // Sincronizar temporada com episódio atual
  useEffect(() => {
    if (currentEpisode && seasons.length) {
      const num = findNextSeasonForEpisode(seasons, currentEpisode.id);
      setActiveSeason(num);
    }
  }, [currentEpisode]);

  const handlePlay = (episode: Episode, seasonNumber: number) => {
    // onPlay(episode, activeSeason);
    setIsPlay(true);
    setCurrentEpisode(episode);
    setActiveSeason(seasonNumber);
  };

  const handlePlayNext = () => {
    if (!nextEpisode) return;
    setActiveSeason(nextSeasonNumber);
    handlePlay(nextEpisode, nextSeasonNumber);
  };

  const scrollToEpisodes = () => {
    episodesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return currentEpisode && isPlay ? (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Player */}
      <div className="absolute z-[9999] w-screen h-h-screen flex items-center justify-center flex-1">
        <VideoPlayer
          title={currentEpisode.name}
          source={currentEpisode.streamUrl}
          poster={currentEpisode?.thumbnail || ''}
          autoPlay
          onError={(error) => {
            console.error('Erro no player:', error);
          }}
          streamId={currentEpisode.id}
          type="series"
          isAutoSave
          contentObject={currentEpisode}
          onBack={() => setIsPlay(false)}
        />
      </div>
    </div>
  ) : (
    series && (
      <div
        className="absolute top-0 max-h-[calc(100vh-60px)] bg-zinc-950 text-white w-full mt-[60px]"
        style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
      >
        <SeriesHeroBanner
          series={series}
          seasons={seasons}
          total={total}
          percent={percent}
          nextEpisode={nextEpisode}
          currentEpisodeId={currentEpisodeId}
          onBack={onBack}
          onPlayNext={handlePlayNext}
          onToggleFavorite={onToggleFavorite}
          onScrollToEpisodes={scrollToEpisodes}
        />
        {/* ── Episódios ─────────────────────────────────────────────────────────── */}
        <div ref={episodesRef} className="px-6 md:px-14 py-8">
          {/* Header da seção */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h2
                className="text-2xl font-bold text-white mb-1"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              >
                Episódios
              </h2>
              {total > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${percent === 100 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-zinc-500 text-sm">
                    {watched}/{total} assistidos
                  </span>
                </div>
              )}
            </div>

            {/* Season Selector */}
            {seasons.length > 0 && (
              <SeasonSelector
                seasons={seasons}
                activeSeason={activeSeason}
                onSeasonChange={setActiveSeason}
                currentEpisodeId={currentEpisodeId}
              />
            )}
          </div>

          {/* Lista de episódios */}
          {loading ? (
            <LoadingSpinner />
          ) : currentEpisodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-600">
              <svg
                className="w-12 h-12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="2" y="7" width="20" height="15" rx="2" />
                <path d="M16 3l-4 4-4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm">Nenhum episódio encontrado</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {currentEpisodes.map((episode, index) => (
                <EpisodeCard
                  key={episode.id}
                  episode={episode}
                  seasonNumber={activeSeason}
                  onPlay={(ep) => handlePlay(ep, activeSeason)}
                  onToggleWatched={onToggleWatched}
                  isActive={episode.id === currentEpisodeId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  );
};
export default SeriesDetail;
// ─── Exemplo de uso ───────────────────────────────────────────────────────────
//
// <SeriesDetail
//   series={selectedSeries}
//   currentEpisodeId={currentEpisode?.id}
//   onPlay={(episode, season) => {
//     setCurrentEpisode(episode)
//     navigate(`/player?url=${episode.streamUrl}`)
//   }}
//   onBack={() => navigate(-1)}
//   onToggleFavorite={(id) => toggleFavorite(id)}
//   onToggleWatched={(id) => toggleWatched(id)}
//   onLoadDetail={(id) => xtreamApi.getSeriesInfo(id).then(mapSeasons)}
// />
