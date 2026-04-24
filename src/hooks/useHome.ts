/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react-hooks/preserve-manual-memoization */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDetailContext } from '../Context/DetailContext';
import { useFocusZone } from '../Context/FocusContext';
import type { PlayerStream } from '../pages/Player';
import { useHomeStore } from '../store/homeStore';
import { useWatchHistoryStore } from '../store/watchHistoryStore';
import type { Movie, Series } from '../types';
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
  const { topChannel, newMovies, trendingMovies, newSeries, trendingSeries } = useHomeStore();
  const { getRecentlyWatched, getRecentChannels } = useWatchHistoryStore();
  const [recentlyWatched, setRecentlyWatched] = useState<any[]>([]);
  const [recentChannels, setRecentChannels] = useState<any[]>([]);
  const hasLoadedData = useRef(false);
  const { activeZone, setActiveZone } = useFocusZone();
  const isActive = activeZone === 'content';
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isDetail, setIsDetail } = useDetailContext();
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [currentSeries, setCurrentSeries] = useState<Series | null>(null);
  const [currentStream, setCurrentStream] = useState<PlayerStream | null>(null);
  // const [isLoading, setIsLoading] = useState(false);

  // Estados para navegação de TV
  const [focusedSection, setFocusedSection] = useState(0);
  const [focusedItemIndex, setFocusedItemIndex] = useState(0);

  // Memoizar dados derivados para evitar recálculos desnecessários
  const topChannels = useMemo(
    () => (recentChannels.length > 0 ? recentChannels : topChannel),
    [recentChannels, topChannel]
  );

  // Memoizar seções visíveis
  const sections = useMemo<Section[]>(
    () => [
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
    ],
    [recentlyWatched, topChannels, trendingMovies, newMovies, trendingSeries, newSeries]
  );

  const activeSections = useMemo(() => sections.filter(s => s.visible), [sections]);
  const currentSection = activeSections[focusedSection];
  const currentSectionData = currentSection?.data || [];

  // Memoizar hero items
  const heroItems = useMemo(
    () => [
      ...trendingMovies.slice(0, 5).map(m => ({
        ...m,
        onPlay: () => navigateMovie(m)
      })),
      ...trendingSeries.slice(0, 5).map(s => ({
        ...s,
        onPlay: () => navigateSerie(s, 'detail-series')
      }))
    ],
    [trendingMovies, trendingSeries]
  );

  // Funções de navegação memoizadas
  const navigateLive = useCallback(
    (live: any) => {
      const state: PlayerStream = {
        ...live,
        id: live.id,
        streamUrl: live.streamUrl,
        title: live.name,
        poster: live.poster,
        type: 'live'
      };
      setCurrentStream(state);
      setIsDetail(true);
      // navigate(`/live`, { state: state });
    },
    [navigate]
  );

  const navigateMovie = useCallback(
    (movie: any, dest?: string) => {
      const state: PlayerStream = {
        ...movie,
        id: movie.id,
        streamUrl: movie.streamUrl,
        title: movie.name,
        poster: movie.poster,
        type: 'movie',
        location: dest
      };
      if (dest) {
        setCurrentMovie(movie);
      } else setCurrentStream(state);
      setIsDetail(true);
      setCurrentSeries(null);
      // navigate(`/${dest || 'player'}`, { state: state });
    },
    [navigate]
  );

  const navigateSerie = useCallback(
    (serie: any, dest?: string) => {
      const state: PlayerStream = {
        ...serie,
        id: serie.id,
        streamUrl: serie.streamUrl,
        title: serie.name,
        poster: serie.poster,
        type: 'series',
        location: dest
      };
      if (dest) {
        setCurrentSeries(serie);
      } else setCurrentStream(state);
      setIsDetail(true);
      setCurrentMovie(null);
      // navigate(`/${dest || 'player'}`, { state: state });
    },
    [navigate]
  );

  const navigateEpisodio = useCallback(
    (serie: any) => {
      const state: PlayerStream = {
        ...serie,
        id: serie.id,
        streamUrl: serie.content.streamUrl,
        title: serie.name,
        poster: serie.poster,
        type: 'series',
        location: 'detail-series',
        episodeId: serie.content.id,
        episodeNumber: serie.content.number,
        seasonNumber: serie.content.season_number,
        parentContent: serie
      };
      setIsDetail(true);
      setCurrentStream(state);
      // navigate('/player', { state: state });
    },
    [navigate]
  );

  // Helper memoizado
  const getFocusedIndex = useCallback(
    (type: SectionType) => (activeSections[focusedSection]?.type === type ? focusedItemIndex : -1),
    [activeSections, focusedSection, focusedItemIndex]
  );

  // Scroll otimizado com debounce
  useEffect(() => {
    if (isActive && document.documentElement) {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        const focusedElement = document.querySelector('[data-focused="true"]');
        if (focusedElement instanceof HTMLElement) {
          focusedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [focusedSection, focusedItemIndex, isActive]);

  // Carregar dados uma vez
  useEffect(() => {
    if (hasLoadedData.current) return;
    hasLoadedData.current = true;

    // Usar requestIdleCallback para não bloquear a thread principal
    const loadData = () => {
      setRecentlyWatched(getRecentlyWatched(20));
      setRecentChannels(getRecentChannels(20).map(item => item.content));
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadData, { timeout: 2000 });
    } else {
      setTimeout(loadData, 100);
    }
  }, [getRecentlyWatched, getRecentChannels]);

  // Navegação por controle remoto com prevenção de eventos repetidos
  const handleRight = useCallback(() => {
    if (!isActive) return;
    const maxIndex = (currentSectionData.length || 1) - 1;
    setFocusedItemIndex(prev => (prev < maxIndex ? prev + 1 : prev));
  }, [isActive, currentSectionData.length]);

  const handleLeft = useCallback(() => {
    if (!isActive) return;
    setFocusedItemIndex(prev => (prev > 0 ? prev - 1 : prev));
  }, [isActive]);

  const handleDown = useCallback(() => {
    if (!isActive) return;
    if (focusedSection < activeSections.length - 1) {
      setFocusedSection(prev => prev + 1);
      setFocusedItemIndex(0);
    }
  }, [isActive, focusedSection, activeSections.length]);

  const handleUp = useCallback(() => {
    if (!isActive) return;
    if (focusedSection > 0) {
      setFocusedSection(prev => prev - 1);
      setFocusedItemIndex(0);
    } else if (focusedSection === 0) {
      setFocusedSection(-1);
      setFocusedItemIndex(0);
    } else if (focusedSection === -1) {
      setActiveZone('menu');
      setFocusedSection(-2);
    }
  }, [isActive, focusedSection, setActiveZone]);

  const handleOk = useCallback(() => {
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
        console.log(item);
        if (item.type === 'movie') {
          navigateMovie(item);
        } else if (item.type === 'series') {
          navigateEpisodio(item);
        }
        break;
      case 'live-channels':
        navigateLive(item);
        // navigate('/live', { state: item });
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
  }, [
    isActive,
    focusedSection,
    focusedItemIndex,
    heroItems,
    currentSectionData,
    currentSection,
    navigate,
    navigateMovie,
    navigateSerie
  ]);

  const handleClose = () => {
    setIsDetail(false);
    setCurrentMovie(null);
    setCurrentSeries(null);
    setCurrentStream(null);
  };

  const handleBack = useCallback(() => {
    setActiveZone('menu');
  }, [setActiveZone]);

  useRemoteControl({
    onRight: handleRight,
    onLeft: handleLeft,
    onDown: handleDown,
    onUp: handleUp,
    onOk: handleOk,
    onBack: handleBack
  });

  return {
    // Estado
    // isLoading,
    // error,
    focusedSection,
    focusedItemIndex,
    isDetail,
    currentStream,
    currentMovie,
    setCurrentMovie,
    currentSeries,
    setCurrentSeries,
    handleClose,

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
    navigateEpisodio,
    navigateLive
  };
}
