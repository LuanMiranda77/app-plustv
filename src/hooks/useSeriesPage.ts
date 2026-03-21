import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useFocusZone } from '../Context/FocusContext';
import { useAuthStore } from '../store/authStore';
import { useContentStore } from '../store/contentStore';
import { useFavoritesStore } from '../store/favoritesStore';
import type { Season, Series } from '../types';
import { xtreamApi } from '../utils/xtreamApi';
import { useBackGuard } from './useBackGuard';
import { useRemoteControl } from './useRemotoControl';

export function useSeriesPage() {
  const { series, seriesCategories } = useContentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { serverConfig } = useAuthStore();
  const [currentSerie, setCurrentSerie] = useState<Series | null>(null);
  const [displayCount, setDisplayCount] = useState(30);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const { activeZone, setActiveZone } = useFocusZone();
  const [focusedCat, setFocusedCat] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [focusedInput, setFocusedInput] = useState(false);
  const isZoneCat = activeZone === 'content';
  const isZoneList = activeZone === 'list';

  useBackGuard(!!currentSerie, () => setCurrentSerie(null));

  const ITEMS_PER_PAGE = 30;

  const categoriesWithAll = [
    { id: '-1', name: 'FAVORITOS' },
    { id: null, name: 'TODOS' },
    ...seriesCategories
  ];

  useRemoteControl({
    onRight: () => {
      if (isZoneCat) {
        setActiveZone('list');
        setFocusedIndex(focusedIndex === -1 ? 0 : focusedIndex);
        setFocusedInput(false);
      }
      if (isZoneList) {
        const column = focusedIndex % 5;
        const isLastColumn = column === 4;
        if (!isLastColumn && focusedIndex < displayedSeries.length - 1) {
          setFocusedIndex(focusedIndex + 1);
        }
      }
    },
    onLeft: () => {
      if (isZoneList) {
        const column = focusedIndex % 5;
        const isFirstColumn = column === 0;
        if (isFirstColumn) {
          setActiveZone('content');
          setFocusedCat(focusedCat);
          setFocusedIndex(-1);
        } else {
          setFocusedIndex(focusedIndex - 1);
        }
      }
    },
    onDown: () => {
      if (focusedInput) {
        setFocusedInput(false);
        setFocusedIndex(0);
        return;
      }
      if (isZoneCat && focusedCat < categoriesWithAll.length - 1) {
        setFocusedCat(Math.min(focusedCat + 1, categoriesWithAll.length - 1));
      }
      if (isZoneList && focusedIndex < displayedSeries.length - 1) {
        setFocusedIndex(Math.min(focusedIndex + 5, displayedSeries.length - 1));
      }
    },
    onUp: () => {
      if (focusedInput) {
        setFocusedInput(false);
        inputRef.current?.blur();
        setActiveZone('menu');
        return;
      }
      if (isZoneCat && focusedCat === 0) {
        categoriesRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveZone('menu');
      } else if (isZoneCat && focusedCat > 0) {
        setFocusedCat(Math.max(focusedCat - 1, 0));
      }
      if (isZoneList && focusedIndex >= 0 && focusedIndex < 5) {
        setFocusedIndex(-1);
        setFocusedInput(true);
        setTimeout(() => inputRef.current?.focus(), 0);
        gridRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (isZoneList && focusedIndex > 0) {
        setFocusedIndex(Math.max(focusedIndex - 5, 0));
      }
    },
    onOk: () => {
      if (isZoneCat) {
        setSelectedCategory(categoriesWithAll[focusedCat]?.id || null);
        setFocusedIndex(0);
      }
      if (isZoneList && displayedSeries[focusedIndex]) {
        setCurrentSerie(displayedSeries[focusedIndex]);
      }
    },
    onBack: () => {
      if (currentSerie) {
        window.history.back();
        return;
      }
      if (isZoneList || isZoneCat) {
        setActiveZone('menu');
      }
    }
  });

  const filteredSeries = series.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory ||
      s.category === selectedCategory ||
      (selectedCategory === '-1' && isFavorite(s.id));
    return matchesSearch && matchesCategory;
  });

  const displayedSeries = filteredSeries.slice(0, displayCount);
  const hasMoreSeries = displayCount < filteredSeries.length;

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMoreSeries && !isLoadingMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setDisplayCount(prev => prev + ITEMS_PER_PAGE);
            setIsLoadingMore(false);
          }, 300);
        }
      },
      { threshold: 0.1 }
    );
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMoreSeries, isLoadingMore]);

  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    if (isZoneCat && categoriesRef.current) {
      if (focusedCat === 0) {
        categoriesRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const focusedElement = categoriesRef.current.querySelector('[data-focused="true"]');
        if (focusedElement instanceof HTMLElement) {
          focusedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }
  }, [focusedCat, isZoneCat]);

  useEffect(() => {
    if (isZoneList && gridRef.current) {
      const focusedElement = gridRef.current.querySelector('[data-focused="true"]');
      if (focusedElement instanceof HTMLElement) {
        focusedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [focusedIndex, isZoneList]);

  useEffect(() => {
    if (isZoneList && focusedIndex >= displayedSeries.length - 1 && hasMoreSeries) {
      setDisplayCount(prev => prev + ITEMS_PER_PAGE);
    }
  }, [focusedIndex, isZoneList, displayedSeries.length, hasMoreSeries]);

  useEffect(() => {
    const state = location.state as any;
    if (state) {
      setCurrentSerie(state);
      setSelectedCategory(state.category || null);
    } else {
      setCurrentSerie(null);
    }
  }, [location]);

  const loadSeriesDetail = async (seriesId: string) => {
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

  const toggleFavorite = (seriesId: string) => {
    if (currentSerie) {
      if (isFavorite(seriesId)) {
        removeFavorite(seriesId);
      } else {
        addFavorite(currentSerie, 'series');
      }
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    currentSerie,
    setCurrentSerie,
    displayCount,
    setDisplayCount,
    isLoadingMore,
    setIsLoadingMore,
    isFavorite,
    addFavorite,
    removeFavorite,
    loadMoreRef,
    gridRef,
    categoriesRef,
    inputRef,
    activeZone,
    setActiveZone,
    focusedCat,
    setFocusedCat,
    focusedIndex,
    setFocusedIndex,
    focusedInput,
    setFocusedInput,
    isZoneCat,
    isZoneList,
    categoriesWithAll,
    filteredSeries,
    displayedSeries,
    hasMoreSeries,
    loadSeriesDetail,
    toggleFavorite
  };
}
