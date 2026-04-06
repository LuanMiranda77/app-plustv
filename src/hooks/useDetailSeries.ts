import LZString from 'lz-string';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { PlayerStream } from '../pages/Player';
import { useAuthStore } from '../store/authStore';
import { useSeriesStore } from '../store/contentStore';
import { useWatchHistoryStore } from '../store/watchHistoryStore';
import type { Episode, Season, Series } from '../types';
import { indexedDbStorage } from '../utils/indexedDbStorage';
import { KEYS_PROCESS_EPISODE } from '../utils/keys_cache';
import { getProgress } from '../utils/progressWatched';
import { xtreamApi } from '../utils/xtreamApi';
import { useBackGuard } from './useBackGuard';
import { useRemoteControl } from './useRemotoControl';

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

  const { activeProfile, serverConfig } = useAuthStore();
  const profileId = activeProfile?.id;
  const [activeSeason, setActiveSeason] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState(-1);
  const maxButtons = 6;
  const [focusedButton, setFocusedButton] = useState(1); //0=voltar 1=Assistir, 2=Trailer, 3=Favorito, 4=Episódios
  const [showTrailer, setShowTrailer] = useState(false);
  const episodesRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const currentEpisodes = seasons.find(s => s.number === activeSeason)?.episodes ?? [];
  const { toggleWatched } = useWatchHistoryStore();
  const { toggleFavorite } = useSeriesStore();
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
        const progress = await getProgress('series', profileId!, episode.id, serverConfig!);
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
        episodes: episodes.map(
          ep =>
            ({
              id: String(ep.id),
              name: ep.title || `Episódio ${ep.episode_num}`,
              number: ep.episode_num,
              season_number: Number(seasonNum),
              streamUrl: `${serverConfig!.url}/series/${serverConfig!.username}/${serverConfig!.password}/${ep.id}.${ep.container_extension}`,
              watched: false,
              progress: 0,
              thumbnail: ep.info?.movie_image || '',
              plot: ep.info?.plot || '',
              duration: ep.info?.duration_secs || undefined,
              displayDuration: ep.info?.duration || undefined,
              rating: ep.info?.rating || '',
              airDate: ep.air_date || ''
            }) as Episode
        )
      }))
      .sort((a, b) => a.number - b.number);
    return seasons;
  };

  const handleLoadDetail = async (series: Series, isForceRefresh: boolean = false) => {
    // ── Tentar cache primeiro ──────────────────────────────────────
    try {
      setLoading(true);
      const KEY = `${KEYS_PROCESS_EPISODE}_${serverConfig?.url}_${series.id}`;
      let loadedSeasons: Season[] | null = null;

      const compressed = isForceRefresh ? null : await indexedDbStorage.get(KEY);

      if (compressed) {
        const cached = JSON.parse(LZString.decompress(String(compressed)));
        console.log('📺 Episódios carregados do cache:', series.id);
        loadedSeasons = cached as Season[];
      } else {
        // ── Carregar da API ──────────────────────────────────────────
        console.log('🌐 Carregando episódios da API:', series.id);
        loadedSeasons = await onLoadDetail(series.id);

        // Salvar no cache
        const compressed = LZString.compress(JSON.stringify(loadedSeasons));

        await indexedDbStorage
          .set(KEY, compressed)
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

  // Carregar detalhes da série
  useEffect(() => {
    if (!series || series.loaded) return;

    const load = async () => {
      await handleLoadDetail(series);
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
      episodeId: episode.id, // ← identificar posição na lista
      episodeNumber: episode.number,
      seasonNumber: seasonNumber,
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

  const handleToggleFavorite = (serie: Series) => {
    if (!serie) return;
    setSeries({ ...serie, isFavorite: !serie.isFavorite });
    toggleFavorite(serie.id, serverConfig!);
  };

  const handleToggleWatched = (epsodioID: string) => {
    toggleWatched(epsodioID, serverConfig!);
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

  // Interceptar voltar nativo do navegador/TV
  useBackGuard(!!series, showTrailer ? () => setShowTrailer(false) : handleBack);

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
      } else if (focusedButton === 2 && series?.youtube_trailer) {
        // Trailer
        setShowTrailer(true);
      } else if (focusedButton === 3) {
        // Favorito
        handleToggleFavorite(series!);
      } else if (focusedButton === 4) {
        // Episódios
        scrollToEpisodes();
      } else if (focusedButton === 5) {
        // Episódios
        handleLoadDetail(series!, true);
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
    setShowTrailer,
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
    handleLoadDetail,

    // Refs
    episodesRef,
    pageRef
  };
}
