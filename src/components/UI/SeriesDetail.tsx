import { useEffect, useRef, useState } from 'react';
import { useRemoteControl } from '../../hooks/useRemotoControl';
import { useAuthStore } from '../../store/authStore';
import type { Episode, Season, Series } from '../../types';
import { indexedDbStorage } from '../../utils/indexedDbStorage';
import { getProgress } from '../../utils/progressWatched';
import EpisodeCard from '../Cards/EpisodeCard';
import { VideoPlayer } from '../Player/VideoPlayer';
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
  const allEps = seasons.flatMap(s => s.episodes);
  if (!allEps.length) return { watched: 0, total: 0, percent: 0 };
  const watched = allEps.filter(e => e.watched).length;
  return {
    watched,
    total: allEps.length,
    percent: Math.round((watched / allEps.length) * 100)
  };
};

const findNextEpisode = (seasons: Season[], currentEpisodeId?: string): Episode | null => {
  const allEps = seasons.flatMap(s => s.episodes);
  if (currentEpisodeId) {
    const idx = allEps.findIndex(e => e.id === currentEpisodeId);
    return allEps[idx + 1] ?? null;
  }
  return allEps.find(e => !e.watched) ?? allEps[0] ?? null;
};

const findNextSeasonForEpisode = (seasons: Season[], episodeId: string): number => {
  for (const season of seasons) {
    if (season.episodes.some(e => e.id === episodeId)) return season.number;
  }
  return 1;
};

export const SeriesDetail = ({
  series,
  onBack,
  onToggleFavorite,
  onToggleWatched,
  onLoadDetail,
  currentEpisodeId
}: SeriesDetailProps) => {
  const { activeProfile } = useAuthStore();
  const profileId = activeProfile?.id;
  const [activeSeason, setActiveSeason] = useState(1);
  const [seasons, setSeasons] = useState<Season[]>(series?.seasons || []);
  const [loading, setLoading] = useState(false);
  const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState(0);
  const maxButtons = 5;
  const [focusedButton, setFocusedButton] = useState(1); // 0=voltar 1=Assistir, 2=Trailer, 3=Favorito, 4=Episódios
  const [showTrailer, setShowTrailer] = useState(false);
  const episodesRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const { watched, total, percent } = getTotalProgress(seasons);
  const nextEpisode = findNextEpisode(seasons, currentEpisodeId);
  const nextSeasonNumber = nextEpisode ? findNextSeasonForEpisode(seasons, nextEpisode.id) : 1;
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const currentEpisodes = seasons.find(s => s.number === activeSeason)?.episodes ?? [];
  const loadProgressForEpisodes = (episodes: Episode[]) => {
    return Promise.all(
      episodes.map(async episode => {
        const progress = await getProgress('series', profileId!, episode.id);
        return {
          ...episode,
          watched: progress.watched,
          progress: progress.progress,
          duration: progress.duration
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
            .catch(e => console.error('❌ Erro ao salvar cache:', e));
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

  const handlePlay = (episode: Episode, seasonNumber: number) => {
    // onPlay(episode, activeSeason);
    setCurrentEpisode(episode);
    setActiveSeason(seasonNumber);
  };

  const handlePlayNext = () => {
    if (!nextEpisode) return;
    setActiveSeason(nextSeasonNumber);
    handlePlay(nextEpisode, nextSeasonNumber);
  };

  // Remote Control Navigation
  useRemoteControl({
    onUp: () => {
      if (selectedEpisodeIndex === 0 && focusedButton == -1) {
        // Força o scroll da lista de episódios para o topo
        pageRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        return setFocusedButton(1);
      }
      if (focusedButton !== 0 && focusedButton > 0) {
        return setFocusedButton(0);
      }
      setSelectedEpisodeIndex(prev => Math.max(0, prev - 1));
    },
    onDown: () => {
      // Navega para baixo, fica no último se chegar ao final
      setSelectedEpisodeIndex(prev => Math.min(prev + 1, currentEpisodes.length - 1));
      setFocusedButton(-1);
    },
    onRight: () => {
      setFocusedButton(prev => (prev + 1) % maxButtons);
    },
    onLeft: () => {
      // Navegar entre botões ao contrário
      setFocusedButton(prev => (prev - 1 + maxButtons) % maxButtons);
    },
    onOk: () => {
      // Executar ação do botão focado
      if (focusedButton === 0) {
        // Assistir
        if (nextEpisode) handlePlayNext();
      } else if (focusedButton === 1) {
        // Trailer
        setShowTrailer(true);
      } else if (focusedButton === 2) {
        // Favorito
        if (onToggleFavorite) onToggleFavorite(series?.id || '');
      } else if (focusedButton === 3) {
        // Episódios
        scrollToEpisodes();
      }
    },
    onBack: () => {
   
        onBack();
      
    }
  });

  // Resetar seleção quando temporada muda
  useEffect(() => {
    setSelectedEpisodeIndex(0);
  }, [activeSeason]);

  // Resetar scroll para topo quando focus volta para o primeiro episódio
  useEffect(() => {
    if (selectedEpisodeIndex === 0) {
      const container = document.querySelector('[data-episodes-container]');
      if (container) {
        container.scrollTop = 0;
      }
    }
  }, [selectedEpisodeIndex]);

  // Auto-scroll quando episódio selecionado muda
  useEffect(() => {
      const selectedElement = document.querySelector(
        `[data-episode-index="${selectedEpisodeIndex}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    
  }, [selectedEpisodeIndex]);

  const scrollToEpisodes = () => {
    episodesRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
  };

  return series && (
      <div
        ref={pageRef}
        className="absolute top-0 max-h-[calc(100vh-60px)] bg-zinc-950 text-white w-full mt-[60px] overflow-y-auto"
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
          focusedButton={focusedButton}
          showTrailer={showTrailer}
          onSetShowTrailer={setShowTrailer}
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
            <div className="flex flex-col gap-2" data-episodes-container>
              {currentEpisodes.map((episode, index) => (
                <div key={episode.id} data-episode-index={index}>
                  <EpisodeCard
                    episode={episode}
                    seasonNumber={activeSeason}
                    onPlay={ep => handlePlay(ep, activeSeason)}
                    onToggleWatched={onToggleWatched}
                    isActive={episode.id === currentEpisodeId || index === selectedEpisodeIndex}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
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
