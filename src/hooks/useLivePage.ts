/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useFocusZone } from '../Context/FocusContext';
import { useAuthStore } from '../store/authStore';
import { useContentStore } from '../store/contentStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { useWatchHistoryStore } from '../store/watchHistoryStore';
import { xtreamApi } from '../utils/xtreamApi';
import { useBackGuard } from './useBackGuard';
import { useRemoteControl } from './useRemotoControl';
import useWindowSize from './useWindowSize';

export function useLivePage() {
  const location = useLocation();
  const { channels, liveCategories } = useContentStore();
  const { serverConfig } = useAuthStore();
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const { addChannelToHistory } = useWatchHistoryStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentStream, setCurrentStream] = useState<any | null>(null);
  const [displayCount, setDisplayCount] = useState(20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [epgList, setEpgList] = useState<any[]>([]);
  const [isLoadingEpg, setIsLoadingEpg] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useWindowSize();
  const { activeZone, setActiveZone } = useFocusZone();
  const [sortedChannels, setSortedChannels] = useState(channels);
  const [focusedCat, setFocusedCat] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [focusedEpgIndex, setFocusedEpgIndex] = useState(0);
  const [focusedInput, setFocusedInput] = useState(false);
  const epgRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isZoneCat = activeZone === 'content';
  const isZoneList = activeZone === 'list';
  const isZoneEpg = activeZone === 'epg';
    const [setlectLiveIndex, setSetlectLiveIndex] = useState(-1);

  useBackGuard(isFullScreen, () => setIsFullScreen(false));

  const ITEMS_PER_PAGE = 20;

  const categoriesWithAll = [
    { id: '-1', name: 'FAVORITOS' },
    { id: null, name: 'TODOS' },
    ...liveCategories
  ];

  useEffect(() => {
    const sorted = [...channels].sort((a, b) => a.name.localeCompare(b.name));
    setSortedChannels(sorted);
  }, [channels]);

  const filteredChannels = sortedChannels.filter(channel => {
    const matchesSearch =
      channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      channel.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory ||
      channel.category === selectedCategory ||
      (selectedCategory === '-1' && isFavorite(String(channel.id)));
    return matchesSearch && matchesCategory;
  });

  const displayedChannels = filteredChannels.slice(0, displayCount);
  const hasMoreChannels = displayCount < filteredChannels.length;

  useEffect(() => {
    if (currentStream?.id && serverConfig) {
      addChannelToHistory({
        id: currentStream.id,
        type: 'channel',
        name: currentStream.name,
        logo: currentStream.logo,
        progress: 0,
        duration: 0,
        watched: 0,
        lastWatched: new Date(),
        content: currentStream
      });
      setIsLoadingEpg(true);
      xtreamApi
        .getLiveEpg(serverConfig, currentStream.id)
        .then(data => {
          if (Array.isArray(data)) {
            setEpgList(data);
          } else if (data && typeof data === 'object' && data.epg_listingsArr) {
            setEpgList(data.epg_listingsArr || []);
          } else if (data && typeof data === 'object' && data.epg_listings) {
            setEpgList(data.epg_listings || []);
          }
        })
        .catch(() => setEpgList([]))
        .finally(() => setIsLoadingEpg(false));
    } else {
      setEpgList([]);
    }
  }, [currentStream?.id, serverConfig]);

  useRemoteControl({
    onRight: () => {
      if (isZoneCat) {
        setActiveZone('list');
        setFocusedIndex(focusedIndex === -1 ? 0 : focusedIndex);
      }
      if (isZoneList && epgList.length > 0 && currentStream) {
        setActiveZone('epg');
        setFocusedEpgIndex(0);
      }
    },
    onLeft: () => {
      if (isZoneEpg) {
        setActiveZone('list');
      }
      if (isZoneList) {
        setActiveZone('content');
        setFocusedCat(focusedCat);
      }
    },
    onDown: () => {
      if (isZoneCat && focusedCat < categoriesWithAll.length - 1) {
        setFocusedCat(Math.min(focusedCat + 1, categoriesWithAll.length - 1));
      }
      if (isZoneList && focusedInput) {
        setFocusedInput(false);
        inputRef.current?.blur();
        setFocusedIndex(0);
      } else if (isZoneList && focusedIndex < displayedChannels.length - 1) {
        setFocusedIndex(Math.min(focusedIndex + 1, displayedChannels.length - 1));
      }
      if (isZoneEpg && focusedEpgIndex < epgList.length - 1) {
        setFocusedEpgIndex(Math.min(focusedEpgIndex + 1, epgList.length - 1));
      }
    },
    onUp: () => {
      if (isZoneCat && focusedCat == 0) {
        categoriesRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveZone('menu');
      }
      if (isZoneCat && focusedCat > 0) {
        setFocusedCat(Math.max(focusedCat - 1, 0));
      }
      if (isZoneList && focusedInput) {
        setFocusedInput(false);
        inputRef.current?.blur();
        setActiveZone('menu');
      } else if (isZoneList && focusedIndex === 0) {
        setFocusedInput(true);
        setFocusedIndex(-1);
        setTimeout(() => inputRef.current?.focus(), 0);
        gridRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (isZoneList && focusedIndex > 0) {
        setFocusedIndex(Math.max(focusedIndex - 1, 0));
      }
      if (isZoneEpg && focusedEpgIndex > 0) {
        setFocusedEpgIndex(Math.max(focusedEpgIndex - 1, 0));
      }
    },
    onOk: () => {
      if (isZoneCat) {
        setSelectedCategory(categoriesWithAll[focusedCat]?.id || null);
        setFocusedIndex(0);
      }
      if (isZoneList) {
        if (
          Boolean(currentStream) == false ||
          currentStream.id !== displayedChannels[focusedIndex].id
        ) {
          setCurrentStream(displayedChannels[focusedIndex]);
        } else {
          setIsFullScreen(true);
        }
      }
    },
    onYellow: () => {
      if (isZoneList && focusedIndex >= 0 && displayedChannels[focusedIndex]) {
        const ch = displayedChannels[focusedIndex];
        if (isFavorite(String(ch.id))) {
          removeFavorite(String(ch.id));
        } else {
          addFavorite(ch, 'live');
        }
      }
    },
    onBack: () => {
      if (isFullScreen) {
        window.history.back();
        return;
      }
      if (isZoneEpg) {
        setActiveZone('list');
        return;
      }
      if (isZoneList || isZoneCat) {
        setActiveZone('menu');
        return;
      }
      if (currentStream) {
        setCurrentStream(null);
      }
    }
  });

  useEffect(() => {
    const state = location.state as any;
    if (state) {
      setCurrentStream(state);
      setSelectedCategory(state.category || null);
    } else {
      setCurrentStream(null);
    }
  }, [location]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMoreChannels && !isLoadingMore) {
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
  }, [hasMoreChannels, isLoadingMore]);

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
    if (isZoneList && focusedIndex >= displayedChannels.length - 1 && hasMoreChannels) {
      setDisplayCount(prev => prev + ITEMS_PER_PAGE);
    }
  }, [focusedIndex, isZoneList, displayedChannels.length, hasMoreChannels]);

  useEffect(() => {
    if (isZoneEpg && epgRef.current) {
      const focusedElement = epgRef.current.querySelector('[data-focused="true"]');
      if (focusedElement instanceof HTMLElement) {
        focusedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [focusedEpgIndex, isZoneEpg]);

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    currentStream,
    setCurrentStream,
    displayCount,
    setDisplayCount,
    isLoadingMore,
    setIsLoadingMore,
    isFullScreen,
    setIsFullScreen,
    epgList,
    setEpgList,
    isLoadingEpg,
    setIsLoadingEpg,
    isFavorite,
    addFavorite,
    removeFavorite,
    loadMoreRef,
    gridRef,
    categoriesRef,
    inputRef,
    epgRef,
    isMobile,
    activeZone,
    setActiveZone,
    focusedCat,
    setFocusedCat,
    focusedIndex,
    setFocusedIndex,
    focusedEpgIndex,
    setFocusedEpgIndex,
    focusedInput,
    setFocusedInput,
    isZoneCat,
    isZoneList,
    isZoneEpg,
    categoriesWithAll,
    filteredChannels,
    displayedChannels,
    hasMoreChannels
  };
}
