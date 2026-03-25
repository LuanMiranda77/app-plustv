/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFocusZone } from '../Context/FocusContext';
import { useAuthStore } from '../store/authStore';
import { useContentStore } from '../store/contentStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { useWatchHistoryStore } from '../store/watchHistoryStore';
import { requestWithRetry } from '../utils/nertwork';
import { xtreamApi } from '../utils/xtreamApi';
import { useBackGuard } from './useBackGuard';
import { useRemoteControl } from './useRemotoControl';
import useWindowSize from './useWindowSize';
import type { Channel } from '../types';
import type { PlayerStream } from '../pages/Player';

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
  const navigate = useNavigate();

  const filteredChannels = useMemo(() => {
    return channels.filter(channel => {
      const matchesSearch =
        channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        channel.category?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        !selectedCategory ||
        channel.category === selectedCategory ||
        (selectedCategory === '-1' && isFavorite(String(channel.id)));

      return matchesSearch && matchesCategory;
    });
  }, [channels, searchTerm, selectedCategory, isFavorite]);

  const displayedChannels = useMemo(() => {
    return filteredChannels.slice(0, displayCount);
  }, [filteredChannels, displayCount]);
  const hasMoreChannels = displayCount < filteredChannels.length;

  useBackGuard(isFullScreen, () => setIsFullScreen(false));

  const ITEMS_PER_PAGE = 20;

  const categoriesWithAll = [
    { id: '-1', name: 'FAVORITOS' },
    { id: null, name: 'TODOS' },
    ...liveCategories
  ];

  useEffect(() => {
    if (!currentStream?.id || !serverConfig) {
      setEpgList([]);
      return;
    }

    let cancelled = false;

    const loadEpg = async () => {
      setIsLoadingEpg(true);
      addChannelToHistory(
        {
          id: currentStream.id,
          type: 'channel',
          name: currentStream.name,
          logo: currentStream.logo,
          progress: 0,
          duration: 0,
          watched: 0,
          lastWatched: new Date(),
          content: currentStream
        },
        serverConfig
      );

      try {
        const data = await requestWithRetry(() =>
          xtreamApi.getLiveEpg(serverConfig, currentStream.id)
        );

        if (cancelled) return;

        if (Array.isArray(data)) {
          setEpgList(data);
        } else {
          setEpgList(data?.epg_listings || data?.epg_listingsArr || []);
        }
      } catch {
        if (!cancelled) setEpgList([]);
      } finally {
        if (!cancelled) setIsLoadingEpg(false);
      }
    };

    loadEpg();

    return () => {
      cancelled = true;
    };
  }, [currentStream?.id, serverConfig]);

  // Adicionar junto aos outros handlers
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      e.preventDefault();
      setFocusedInput(false);
      inputRef.current?.blur();
      setActiveZone('list');
      setFocusedIndex(0);
    }
    // ✅ Up no input → vai para o menu
    if (e.key === 'ArrowUp' || e.keyCode === 38) {
      e.preventDefault();
      setFocusedInput(false);
      inputRef.current?.blur();
      setActiveZone('menu');
    }
  };

  const handlePlayStream = (stream: Channel) => {
    setCurrentStream(stream);
    setSetlectLiveIndex(stream.id);
  };

  const isRestoringRef = useRef(false);

  // carregar filme do estado ao voltar para a página
  useEffect(() => {
    const state = location.state as any;
    if (state && !isRestoringRef.current) {
      const channel = channels.find(c => c.id === state.id);
      isRestoringRef.current = true; // ← marca que está restaurando
      setActiveZone('list');
      handlePlayStream(channel!);
      setSelectedCategory(state.category || null);
    }
  }, [location]);

  // 2. só após filteredMovies atualizar, busca o índice correto
  useEffect(() => {
    const state = location.state as any;
    if (!state || !isRestoringRef.current) return;

    const index = filteredChannels.findIndex(s => s.id === state.id);
    if (index === -1) return;

    // Expandir displayCount para garantir que o item está no DOM
    if (index >= displayCount) {
      setDisplayCount(index + ITEMS_PER_PAGE);
    }

    setFocusedIndex(index);

    // Aguardar displayCount expandir e DOM re-renderizar
    setTimeout(() => {
      // ── Scroll do item na grid ─────────────────────────────────
      const focusedElement = gridRef.current?.querySelector('[data-focused="true"]');
      if (focusedElement instanceof HTMLElement) {
        focusedElement.scrollIntoView({ behavior: 'auto', block: 'center' });
      }

      // ── Scroll da categoria no sidebar ────────────────────────
      if (categoriesRef.current && state.category) {
        // Buscar pelo data-selected ou pelo texto da categoria
        const catSelected = categoriesRef.current.querySelector('[data-selected="true"]');
        if (catSelected instanceof HTMLElement) {
          catSelected.scrollIntoView({ behavior: 'auto', block: 'center' });
        }
      }

      isRestoringRef.current = false;
    }, 300); // ← aumentar de 150ms para 300ms
  }, [filteredChannels]);

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
        // setSetlectLiveIndex(-1);
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
        categoriesRef.current?.scrollTo({ top: 0, behavior: 'auto' });
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
        gridRef.current?.scrollTo({ top: 0, behavior: 'auto' });
      } else if (isZoneList && focusedIndex > 0) {
        setFocusedIndex(Math.max(focusedIndex - 1, 0));
      }
      if (isZoneEpg && focusedEpgIndex > 0) {
        setFocusedEpgIndex(Math.max(focusedEpgIndex - 1, 0));
      }
    },
    onOk: () => {
      // ✅ Se input estiver focado, ir para a lista
      if (focusedInput) {
        handleInputKeyDown({ key: 'Enter', keyCode: 13 } as any);
        return;
      }
      if (isZoneCat) {
        setSelectedCategory(categoriesWithAll[focusedCat]?.id || null);
        setFocusedIndex(0);
      }
      if (isZoneList) {
        if (
          Boolean(currentStream) == false ||
          currentStream.id !== displayedChannels[focusedIndex].id
        ) {
          handlePlayStream(displayedChannels[focusedIndex]);
        } else {
          setIsFullScreen(true);
        }
      }
    },
    onYellow: () => {
      if (isZoneList && focusedIndex >= 0 && displayedChannels[focusedIndex]) {
        const ch = displayedChannels[focusedIndex];
        if (isFavorite(String(ch.id))) {
          removeFavorite(String(ch.id), serverConfig!);
        } else {
          addFavorite(ch, 'live', serverConfig!);
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
      // if (currentStream) {
      //   setCurrentStream(null);
      // }
    }
  });

  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreChannels && !isLoadingMore) {
        setIsLoadingMore(true);

        requestAnimationFrame(() => {
          setDisplayCount(prev => prev + ITEMS_PER_PAGE);
          setIsLoadingMore(false);
        });
      }
    });

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasMoreChannels, isLoadingMore]);

  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    if (isZoneCat && categoriesRef.current) {
      if (focusedCat === 0) {
        categoriesRef.current.scrollTo({ top: 0, behavior: 'auto' });
      } else {
        const focusedElement = categoriesRef.current.querySelector('[data-focused="true"]');
        if (focusedElement instanceof HTMLElement) {
          focusedElement.scrollIntoView({ behavior: 'auto', block: 'nearest' });
        }
      }
    }
  }, [focusedCat, isZoneCat]);

  useEffect(() => {
    if (isZoneList && gridRef.current) {
      const focusedElement = gridRef.current.querySelector('[data-focused="true"]');
      if (focusedElement instanceof HTMLElement) {
        focusedElement.scrollIntoView({ behavior: 'auto', block: 'nearest' });
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
        focusedElement.scrollIntoView({ behavior: 'auto', block: 'nearest' });
      }
    }
  }, [focusedEpgIndex, isZoneEpg]);

    // Navegação helpers
    const navigateLive = (live: Channel) => {
      const state: PlayerStream = {
        ...live,
        id: live.id,
        streamUrl: live.streamUrl,
        title: live.name,
        poster: live.logo,
        type: 'live',
      };
      navigate(`/player`, { state: state });
    };

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
    setlectLiveIndex,
    setSetlectLiveIndex,
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
    hasMoreChannels,
    handleInputKeyDown,
    handlePlayStream,
    navigateLive
  };
}
