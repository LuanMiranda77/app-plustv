/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFocusZone } from '../Context/FocusContext';
import { useContentStore } from '../store/contentStore';
import { useFavoritesStore } from '../store/favoritesStore';
import type { Series } from '../types';
import { useBackGuard } from './useBackGuard';
import { useRemoteControl } from './useRemotoControl';

export function useSeriesPage() {
  const { series, seriesCategories } = useContentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentSerie, setCurrentSerie] = useState<Series | null>(null);
  const [displayCount, setDisplayCount] = useState(30);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { isFavorite } = useFavoritesStore();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const { activeZone, setActiveZone } = useFocusZone();
  const [focusedCat, setFocusedCat] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [focusedInput, setFocusedInput] = useState(false);
  const navigate = useNavigate();
  const isZoneCat = activeZone === 'content';
  const isZoneList = activeZone === 'list';
  const ITEMS_PER_PAGE = 30;
  const categoriesWithAll = [
    { id: '-1', name: 'FAVORITOS' },
    { id: null, name: 'TODOS' },
    ...seriesCategories
  ];

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

  useBackGuard(!!currentSerie, () => setCurrentSerie(null));

  // Adicionar um ref para controlar se veio de navegação
  const isRestoringRef = useRef(false);

  // carregar filme do estado ao voltar para a página
  useEffect(() => {
    const state = location.state as any;
    if (state && !isRestoringRef.current) {
      isRestoringRef.current = true; // ← marca que está restaurando
      setActiveZone('list');
      setSelectedCategory(state.category || null);
    }
  }, [location]);

  // 2. só após filteredSeries atualizar, busca o índice correto
  useEffect(() => {
    const state = location.state as any;
    if (!state || !isRestoringRef.current) return;

    const index = filteredSeries.findIndex(s => s.id === state.id);
    if (index === -1) return;

    if (index >= displayCount) {
      setDisplayCount(index + ITEMS_PER_PAGE);
    }

    setFocusedIndex(index);

    setTimeout(() => {
      const focusedElement = gridRef.current?.querySelector('[data-focused="true"]');
      if (focusedElement instanceof HTMLElement) {
        focusedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (categoriesRef.current && state.category) {
        const catElement = categoriesRef.current.querySelector('[data-selected="true"]');
        if (catElement instanceof HTMLElement) {
          catElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }

      // ✅ Libera o guard APÓS scroll — navegação funciona, foco mantido
      isRestoringRef.current = false;
    }, 150);
  }, [filteredSeries]);

  const handleNavigate = (serie: Series) => {
    setCurrentSerie(serie);
    navigate('/detail-series', { state: serie });
  };

  const handleCategoryClick = (id: string | null) => {
    setSelectedCategory(id);
    setFocusedIndex(-1);
  };

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
  };;

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
      // ✅ Se input estiver focado, ir para a lista
      if (focusedInput) {
        handleInputKeyDown({ key: 'Enter', keyCode: 13 } as any);
        return;
      }

      if (isZoneCat) {
        handleCategoryClick(categoriesWithAll[focusedCat]?.id || null);
      }
      if (isZoneList && displayedSeries[focusedIndex]) {
        handleNavigate(displayedSeries[focusedIndex]);
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

    // functinons
    handleNavigate,
    handleCategoryClick,
    handleInputKeyDown
  };
}
