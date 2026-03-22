import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFocusZone } from '../Context/FocusContext';
import type { PlayerStream } from '../pages/Player';
import { useAuthStore } from '../store/authStore';
import { useContentStore } from '../store/contentStore';
import { useWatchHistoryStore } from '../store/watchHistoryStore';
import { useRemoteControl } from './useRemotoControl';

type SectionType =
  | 'continue-watching'
  | 'live-channels'
  | 'last-movies'
  | 'trending-movies'
  | 'new-movies'
  | 'last-series'
  | 'trending-series'
  | 'new-series';

interface Section {
  id: string;
  type: SectionType;
  data: any[];
  visible: boolean;
}

export function useHome() {
  const navigate = useNavigate();
  const { serverConfig } = useAuthStore();
  const { movies, channels, series, isLoading, error, fetchLiveContent } = useContentStore();
  const { getRecentlyWatched, getRecentChannels, loadFromStorage } = useWatchHistoryStore();
  const [recentlyWatched, setRecentlyWatched] = useState<any[]>([]);
  const [recentChannels, setRecentChannels] = useState<any[]>([]);
  const hasLoadedData = useRef(false);
  const { activeZone, setActiveZone } = useFocusZone();
  const isActive = activeZone === 'content';

  // Estados para navegação de TV
  const [focusedSection, setFocusedSection] = useState(0);
  const [focusedItemIndex, setFocusedItemIndex] = useState(0);

  // Dados derivados
  const topChannels = recentChannels.length > 0 ? recentChannels : channels.slice(0, 8);
  const newMovies = movies.slice(0, 10);
  const newSeries = series.slice(0, 10);
  const trendingMovies = movies.filter((m, i) => {
    const ratingNum = m.rating && m.rating !== 'N/A' ? Number(m.rating) : 0;
    return ratingNum >= 6 && i < 30;
  });
  const trendingSeries = series.filter((m, i) => {
    const ratingNum = m.rating && m.rating !== 'N/A' ? Number(m.rating) : 0;
    return ratingNum >= 7 && i < 30;
  });

  // Seções visíveis
  const sections: Section[] = [
    {
      id: 'continue-watching',
      type: 'continue-watching',
      data: recentlyWatched,
      visible: recentlyWatched.length > 0
    },
    {
      id: 'live-channels',
      type: 'live-channels',
      data: topChannels,
      visible: topChannels.length > 0
    },
    {
      id: 'last-movies',
      type: 'last-movies',
      data: recentlyWatched.filter(item => item.type === 'movie'),
      visible: recentlyWatched.filter(item => item.type === 'movie').length > 0
    },
    {
      id: 'trending-movies',
      type: 'trending-movies',
      data: trendingMovies,
      visible: trendingMovies.length > 0
    },
    {
      id: 'new-movies',
      type: 'new-movies',
      data: newMovies,
      visible: newMovies.length > 0
    },
    {
      id: 'last-series',
      type: 'last-series',
      data: recentlyWatched.filter(item => item.type === 'series'),
      visible: recentlyWatched.filter(item => item.type === 'series').length > 0
    },
    {
      id: 'trending-series',
      type: 'trending-series',
      data: trendingSeries,
      visible: trendingSeries.length > 0
    },
    {
      id: 'new-series',
      type: 'new-series',
      data: newSeries,
      visible: newSeries.length > 0
    }
  ];

  const activeSections = sections.filter(s => s.visible);
  const currentSection = activeSections[focusedSection];
  const currentSectionData = currentSection?.data || [];

  // Navegação helpers
  const navigateMovie = (movie: any, dest?: string) => {
    const state: PlayerStream = {
      ...movie,
      id: movie.id,
      streamUrl: movie.streamUrl,
      title: movie.name,
      poster: movie.poster,
      type: 'movie',
      location: dest
    };
    navigate(`/${dest || 'player'}`, { state: state });
  };

  const navigateSerie = (serie: any, dest?: string) => {
    const state: PlayerStream = {
      ...serie,
      id: serie.id,
      streamUrl: serie.streamUrl,
      title: serie.name,
      poster: serie.poster,
      type: 'series',
      location: dest
    };
    navigate(`/${dest || 'player'}`, { state: state });
  };

  const navigateEpisodio = (serie: any) => {
    const state: PlayerStream = {
      ...serie,
      id: serie.id,
      streamUrl: serie.content.streamUrl,
      title: serie.name,
      poster: serie.poster,
      type: 'series',
      location: 'details-serie',
      episodeId: serie.content.episode.id, // ← identificar posição na lista
      episodeNumber: serie.content.episode.number,
      seasonNumber: serie.content.episode.season_number,
      parentContent: serie
    };
    navigate('/player', { state: state });
  };

  // Hero items para o AutoCarousel
  const heroItems = [
    ...movies.slice(0, 5).map(m => ({
      ...m,
      onPlay: () => navigateMovie(m)
    })),
    ...series.slice(0, 5).map(s => ({
      ...s,
      onPlay: () => navigateSerie(s, "detail-series")
    }))
  ];

  // Helper: retorna o focusedItemIndex para uma seção específica, ou -1 se não é a seção ativa
  const getFocusedIndex = (type: SectionType) =>
    activeSections[focusedSection]?.type === type ? focusedItemIndex : -1;

  // Auto-scroll quando o foco muda
  useEffect(() => {
    if (isActive && document.documentElement) {
      const focusedElement = document.querySelector('[data-focused="true"]');
      if (focusedElement instanceof HTMLElement) {
        focusedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [focusedSection, focusedItemIndex, isActive]);

  // Carregar dados uma vez
  useEffect(() => {
    if (hasLoadedData.current) return;
    hasLoadedData.current = true;

    loadFromStorage();

    if (serverConfig) {
      fetchLiveContent(serverConfig);
    }

    setTimeout(() => {
      setRecentlyWatched(getRecentlyWatched(20));
      setRecentChannels(getRecentChannels(20).map(item => item.content));
    }, 0);
  }, []);

  // Navegação por controle remoto
  useRemoteControl({
    onRight: () => {
      if (!isActive) return;
      const maxIndex = (currentSectionData.length || 1) - 1;
      setFocusedItemIndex(prev => (prev < maxIndex ? prev + 1 : prev));
    },
    onLeft: () => {
      if (!isActive) return;
      if (focusedItemIndex > 0) {
        setFocusedItemIndex(prev => prev - 1);
      }
    },
    onDown: () => {
      if (!isActive) return;
      if (focusedSection < activeSections.length - 1) {
        setFocusedSection(prev => prev + 1);
        setFocusedItemIndex(0);
      }
    },
    onUp: () => {
      if (!isActive) return;
      if (focusedSection > 0) {
        setFocusedSection(prev => prev - 1);
        setFocusedItemIndex(0);
      } else if (focusedSection === 0) {
        setFocusedSection(-1);
        setFocusedItemIndex(0);
      } else if (focusedSection === -1) {
        setActiveZone('menu');
      }
    },
    onOk: () => {
      if (!isActive) return;

      if (focusedSection === -1) {
        const heroItem = heroItems[focusedItemIndex];
        if (heroItem?.onPlay) {
          heroItem.onPlay();
        }
        return;
      }

      const item = currentSectionData[focusedItemIndex];
      if (!item) return;

      const sectionType = currentSection?.type;

      switch (sectionType) {
        case 'continue-watching':
          if (item.type === 'movie') {
            navigateMovie(item);
          } else if (item.type === 'series') {
            navigateSerie(item);
          }
          break;
        case 'live-channels':
          navigate('/live', { state: item });
          break;
        case 'last-movies':
        case 'trending-movies':
        case 'new-movies':
          navigateMovie(item);
          break;
        case 'last-series':
        case 'trending-series':
        case 'new-series':
          navigateSerie(item);
          break;
      }
    },
    onBack: () => {
      setActiveZone('menu');
    }
  });

  return {
    // Estado
    isLoading,
    error,
    focusedSection,
    focusedItemIndex,

    // Dados
    heroItems,
    topChannels,
    recentChannels,
    recentlyWatched,
    newMovies,
    newSeries,
    trendingMovies,
    trendingSeries,
    activeSections,

    // Helpers
    getFocusedIndex,
    setRecentlyWatched,

    // Navegação
    navigate,
    navigateMovie,
    navigateSerie,
    navigateEpisodio
  };
}
