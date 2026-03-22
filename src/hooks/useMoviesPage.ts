/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from 'react';
import { useFocusZone } from '../Context/FocusContext';
import { useContentStore } from '../store/contentStore';
import { useFavoritesStore } from '../store/favoritesStore';
import type { Movie } from '../types';
import { useBackGuard } from './useBackGuard';
import { useRemoteControl } from './useRemotoControl';
import { useLocation, useNavigate } from 'react-router-dom';

export function useMoviesPage() {
  const { movies, vodCategories } = useContentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [displayCount, setDisplayCount] = useState(20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const { activeZone, setActiveZone } = useFocusZone();
  const [focusedCat, setFocusedCat] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [focusedInput, setFocusedInput] = useState(false);
  const isZoneCat = activeZone === 'content';
  const isZoneList = activeZone === 'list';
  const location = useLocation();
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 20;
  const categoriesWithAll = [
    { id: '-1', name: 'FAVORITOS' },
    { id: null, name: 'TODOS' },
    ...vodCategories
  ];

  const filteredMovies = movies.filter(movie => {
    const matchesSearch =
      movie.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory ||
      movie.category === selectedCategory ||
      (selectedCategory === '-1' && isFavorite(movie.id));
    return matchesSearch && matchesCategory;
  });

  const displayedMovies = filteredMovies.slice(0, displayCount);
  const hasMoreMovies = displayCount < filteredMovies.length;

  useBackGuard(!!currentMovie, () => setCurrentMovie(null));
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

  // 2. só após filteredMovies atualizar, busca o índice correto
  useEffect(() => {
    const state = location.state as any;
    if (!state || !isRestoringRef.current) return;

    const index = filteredMovies.findIndex(s => s.id === state.id);
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
        focusedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // ── Scroll da categoria no sidebar ────────────────────────
      if (categoriesRef.current && state.category) {
        // Buscar pelo data-selected ou pelo texto da categoria
        const catSelected = categoriesRef.current.querySelector('[data-selected="true"]');
        if (catSelected instanceof HTMLElement) {
          catSelected.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }

      isRestoringRef.current = false;
    }, 300); // ← aumentar de 150ms para 300ms
  }, [filteredMovies]);

  const handleNavigate = (movie: Movie) => {
    setCurrentMovie(movie);
    navigate('/detail-movie', { state: movie });
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
  };

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
        if (!isLastColumn && focusedIndex < displayedMovies.length - 1) {
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
      if (isZoneList && focusedIndex < displayedMovies.length - 1) {
        setFocusedIndex(Math.min(focusedIndex + 5, displayedMovies.length - 1));
      }
    },
    onUp: () => {
      if (focusedInput) {
        handleInputKeyDown({ key: 'Enter', keyCode: 13 } as any);
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
      if (isZoneList && displayedMovies[focusedIndex]) {
        handleNavigate(displayedMovies[focusedIndex]);
      }
    },
    onBack: () => {
      if (currentMovie) {
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
        if (entries[0].isIntersecting && hasMoreMovies && !isLoadingMore) {
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
  }, [hasMoreMovies, isLoadingMore]);

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
    if (isZoneList && focusedIndex >= displayedMovies.length - 1 && hasMoreMovies) {
      setDisplayCount(prev => prev + ITEMS_PER_PAGE);
    }
  }, [focusedIndex, isZoneList, displayedMovies.length, hasMoreMovies]);

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    currentMovie,
    setCurrentMovie,
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
    filteredMovies,
    displayedMovies,
    hasMoreMovies,
    handleNavigate,
    handleCategoryClick,
    handleInputKeyDown
  };
}
