import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import type { Episode, ProgressWatched, Season, Series } from '../../types';
import { indexedDbStorage } from '../../utils/indexedDbStorage';
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


const saveProgress = async (
  seriesId: string,
  profileId: string | undefined,
  episodes: Episode[]
) => {
  const progress: ProgressWatched[] = episodes.map((ep) => ({
    episodeId: ep.id,
    watched: ep.watched,
    progress: ep.progress || 0,
    timestamp: Date.now(),
  }));

  try {
    await indexedDbStorage.set(`series_progress_${profileId}_${seriesId}`, progress);
    console.log('💾 Progresso salvo:', { series: seriesId });
  } catch (error) {
    console.error('❌ Erro ao salvar progresso:', error);
  }
};

const loadProgress = async (
  seriesId: string,
  profileId: string | undefined,
  seasons: Season[]
): Promise<Season[]> => {
  if (!profileId) return seasons;

  try {
    const progress = await indexedDbStorage.get(`series_progress_${profileId}_${seriesId}`);
    if (!progress || !Array.isArray(progress)) return seasons;

    console.log('📖 Progresso carregado:', { profile: profileId, series: seriesId });

    return seasons.map((season) => ({
      ...season,
      episodes: season.episodes.map((ep) => {
        const epProgress = progress.find((p: ProgressWatched) => p.episodeId === ep.id);
        return epProgress
          ? { ...ep, watched: epProgress.watched, progress: epProgress.progress }
          : ep;
      }),
    }));
  } catch (error) {
    console.error('❌ Erro ao carregar progresso:', error);
    return seasons;
  }
};

const getSeasonProgress = (season: Season) => {
  const watched = season.episodes.filter((ep) => ep.watched).length;
  const total = season.episodes.length;
  return {
    watched,
    total,
    percent: total > 0 ? Math.round((watched / total) * 100) : 0,
  };
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

  // Carregar detalhes da série
  useEffect(() => {
    if (series) {
      if (series.loaded || !onLoadDetail) return;
      setLoading(true);

      // Tentar carregar do cache primeiro
      indexedDbStorage
        .get(`list_episodes_cache_${series.id}`)
        .then((cachedSeasons) => {
          if (cachedSeasons && Array.isArray(cachedSeasons)) {
            console.log('📺 Episódios carregados do cache:', series.id);
            setSeasons(cachedSeasons);
            if (currentEpisodeId) {
              const seasonNum = findNextSeasonForEpisode(cachedSeasons, currentEpisodeId);
              setActiveSeason(seasonNum);
            }
            setLoading(false);
            return;
          }

          // Se não houver cache, carregar da API
          onLoadDetail(series.id)
            .then((loadedSeasons) => {
              setSeasons(loadedSeasons);
              // Salvar no cache
              indexedDbStorage
                .set(`list_episodes_cache_${series.id}`, loadedSeasons)
                .catch((error) => {
                  console.error('❌ Erro ao salvar episodes no cache:', error);
                });
              if (currentEpisodeId) {
                const seasonNum = findNextSeasonForEpisode(loadedSeasons, currentEpisodeId);
                setActiveSeason(seasonNum);
              }
            })
            .finally(() => setLoading(false));
        })
        .catch(() => {
          // Se cache falhar, carregar da API
          onLoadDetail(series.id)
            .then((loadedSeasons) => {
              setSeasons(loadedSeasons);
              indexedDbStorage
                .set(`list_episodes_cache_${series.id}`, loadedSeasons)
                .catch((error) => {
                  console.error('❌ Erro ao salvar episodes no cache:', error);
                });
              if (currentEpisodeId) {
                const seasonNum = findNextSeasonForEpisode(loadedSeasons, currentEpisodeId);
                setActiveSeason(seasonNum);
              }
            })
            .finally(() => setLoading(false));
        });
    }
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

  const handleToggleWatched = async (episodeId: string) => {
    const updatedSeasons = seasons.map((season) => ({
      ...season,
      episodes: season.episodes.map((ep) =>
        ep.id === episodeId ? { ...ep, watched: !ep.watched } : ep
      ),
    }));

    setSeasons(updatedSeasons);
    // Salvar progresso
    if (series && profileId) {
      await saveProgress(
        series.id,
        profileId,
        updatedSeasons.flatMap((s) => s.episodes)
      );
    }
    onToggleWatched?.(episodeId);
  };

  const handleUpdateProgress = async (episodeId: string, progress: number) => {
    const updatedSeasons = seasons.map((season) => ({
      ...season,
      episodes: season.episodes.map((ep) => (ep.id === episodeId ? { ...ep, progress } : ep)),
    }));

    setSeasons(updatedSeasons);
    // Salvar progresso
    if (series && profileId) {
      await saveProgress(
        series.id,
        profileId,
        updatedSeasons.flatMap((s) => s.episodes)
      );
    }
  };

  const scrollToEpisodes = () => {
    episodesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return currentEpisode && isPlay ? (
    <div className="flex flex-col min-h-screen bg-black">
      <ButtonBack
        className="absolute z-[99999] top-2"
        title={currentEpisode.name}
        onClick={() => setIsPlay(false)}
      />
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
          type='series'
          isAutoSave
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
                  index={index}
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
