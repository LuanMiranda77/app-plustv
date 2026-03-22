import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { PlayerStream } from '../pages/Player';
import { useAuthStore } from '../store/authStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { useWatchHistoryStore } from '../store/watchHistoryStore';
import type { Episode, Season, Series } from '../types';
import { indexedDbStorage } from '../utils/indexedDbStorage';
import { getProgress } from '../utils/progressWatched';
import { xtreamApi } from '../utils/xtreamApi';
import { useRemoteControl } from './useRemotoControl';
import { useBackGuard } from './useBackGuard';

export function useSeriesDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [series, setSeries] = useState<Series | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);

  useEffect(() => {
    const state = location.state as any;
    if (state && series === null) {
      setSeries(state);
      setSeasons(state.seasons || []);
    }
  }, [location]);

  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const { activeProfile, serverConfig } = useAuthStore();
  const profileId = activeProfile?.id;
  const [activeSeason, setActiveSeason] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState(-1);
  const maxButtons = 5;
  const [focusedButton, setFocusedButton] = useState(1); //0=voltar 1=Assistir, 2=Trailer, 3=Favorito, 4=Episódios
  const [showTrailer, setShowTrailer] = useState(false);
  const episodesRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const currentEpisodes = seasons.find(s => s.number === activeSeason)?.episodes ?? [];
  const { toggleWatched } = useWatchHistoryStore();
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

  const findNextEpisode = (seasons: Season[]): Episode | null => {
    const allEps = seasons.flatMap(s => s.episodes);
    if (currentEpisode?.id) {
      const idx = allEps.findIndex(e => e.id === currentEpisode?.id);
      return allEps[idx + 1] ?? null;
    }
    return allEps.find(e => !e.watched) ?? allEps[0] ?? null;
  };

  const findNextSeasonForEpisode = (seasons: Season[]): number => {
    for (const season of seasons) {
      if (season.episodes.some(e => e.id === currentEpisode?.id)) return season.number;
    }
    return 1;
  };

  const nextEpisode = findNextEpisode(seasons);
  const { watched, total, percent } = getTotalProgress(seasons);
  const nextSeasonNumber = nextEpisode ? findNextSeasonForEpisode(seasons) : 1;

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

  const onLoadDetail = async (seriesId: string) => {
    const data = await xtreamApi.getSeriesInfo(serverConfig!, seriesId);
    const episodesMap = data.episodes as Record<string, any[]>;
    const seasons: Season[] = Object.entries(episodesMap)
      .map(([seasonNum, episodes]) => ({
        number: Number(seasonNum),
        progress: 0,
        episodes: episodes.map(ep => ({
          id: String(ep.id),
          name: ep.title || `Episódio ${ep.episode_num}`,
          number: ep.episode_num,
          streamUrl: `${serverConfig!.url}/series/${serverConfig!.username}/${serverConfig!.password}/${ep.id}.${ep.container_extension}`,
          watched: false,
          progress: 0,
          thumbnail: ep.info?.movie_image || '',
          plot: ep.info?.plot || '',
          duration: ep.info?.duration_secs || undefined,
          displayDuration: ep.info?.duration || undefined,
          rating: ep.info?.rating || '',
          airDate: ep.air_date || ''
        }))
      }))
      .sort((a, b) => a.number - b.number);
    return seasons;
  };

  // Carregar detalhes da série
  useEffect(() => {
    if (!series || series.loaded) return;

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
        if (currentEpisode) {
          const seasonNum = findNextSeasonForEpisode(seasonsWithProgress);
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
    const state: PlayerStream = {
      id: episode.id,
      streamUrl: episode.streamUrl,
      title: episode.name,
      poster: episode.thumbnail ?? '',
      type: 'series',
      category: series?.category,
      location: 'detail-series',
      parentContent: series
    };

    setCurrentEpisode(episode);
    setActiveSeason(seasonNumber);
    navigate('/player', { state: state });
  };

  const handlePlayNext = () => {
    if (!nextEpisode) return;
    setActiveSeason(nextSeasonNumber);
    handlePlay(nextEpisode, nextSeasonNumber);
  };

  const handleBack = () => {
    navigate('/series', { state: series });
  };

  const handleToggleFavorite = (seriesId: string) => {
    if (series) {
      if (isFavorite(seriesId)) {
        removeFavorite(seriesId);
      } else {
        addFavorite(series, 'series');
      }
    }
  };

  const handleToggleWatched = (epsodioID: string) => {
    toggleWatched(epsodioID);
  };

  // Resetar seleção quando temporada muda
  useEffect(() => {
    if (focusedButton === -1) {
      setSelectedEpisodeIndex(0);
    }
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
    setSelectedEpisodeIndex(0);
  };

  const handleCloseTrailer = () => {
    setShowTrailer(false);
  };

  // Interceptar voltar nativo do navegador/TV
  useBackGuard(!!series, showTrailer ? handleCloseTrailer : handleBack);

  // Remote Control Navigation
  useRemoteControl({
    onUp: () => {
      if (selectedEpisodeIndex === 0) {
        // Força o scroll da lista de episódios para o topo
        pageRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        setSelectedEpisodeIndex(-1);
        return setFocusedButton(1);
      }
      if (focusedButton !== 0 && focusedButton > 0) {
        return setFocusedButton(0);
      }
      if (focusedButton == -1) {
        return setSelectedEpisodeIndex(prev => Math.max(0, prev - 1));
      }
    },
    onDown: () => {
      // Navega para baixo, fica no último se chegar ao final
      setSelectedEpisodeIndex(prev => Math.min(prev + 1, currentEpisodes.length - 1));
      setFocusedButton(-1);
    },
    onRight: () => {
      if (focusedButton < maxButtons - 1) {
        return setFocusedButton(prev => (prev + 1) % maxButtons);
      }
    },
    onLeft: () => {
      // Navegar entre botões ao contrário
      if (focusedButton > 1) {
        setFocusedButton(prev => (prev - 1 + maxButtons) % maxButtons);
      }
    },
    onOk: () => {
      if (currentEpisodes[selectedEpisodeIndex]) {
        handlePlay(currentEpisodes[selectedEpisodeIndex], activeSeason);
        return;
      }

      // Executar ação do botão focado
      if (focusedButton === 0) {
        // Assistir
        handleBack();
      } else if (focusedButton === 1) {
        // Assistir
        handlePlayNext();
      } else if (focusedButton === 2) {
        // Trailer
        setShowTrailer(true);
      } else if (focusedButton === 3) {
        // Favorito
        handleToggleFavorite(series?.id || '');
      } else if (focusedButton === 4) {
        // Episódios
        scrollToEpisodes();
      }
    },
    onBack: () => {
      handleBack();
    }
  });
  return {
    // Estado da UI
    activeSeason,
    setActiveSeason,
    seasons,
    loading,
    showTrailer,
    focusedButton,
    setFocusedButton,
    series,

    // Episódios
    currentEpisodes,
    currentEpisode,
    setCurrentEpisode,
    selectedEpisodeIndex,
    setSelectedEpisodeIndex,

    // Progresso
    watched,
    total,
    percent,

    // Próximo episódio
    nextEpisode,
    nextSeasonNumber,

    // Ações
    handlePlay,
    handlePlayNext,
    scrollToEpisodes,
    handleToggleFavorite,
    handleBack,
    handleToggleWatched,
    onLoadDetail,
    handleCloseTrailer,

    // Refs
    episodesRef,
    pageRef
  };
}
