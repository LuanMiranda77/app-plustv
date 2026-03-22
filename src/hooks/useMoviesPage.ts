/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from 'react';
import { useFocusZone } from '../Context/FocusContext';
import { useContentStore } from '../store/contentStore';
import { useFavoritesStore } from '../store/favoritesStore';
import type { Movie } from '../types';
import { useBackGuard } from './useBackGuard';
import { useRemoteControl } from './useRemotoControl';
import { useNavigate } from 'react-router-dom';

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

  useBackGuard(!!currentMovie, () => setCurrentMovie(null));

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
  const navigate = useNavigate();

   const handleNavigate = (movie: Movie) => {
     setCurrentMovie(movie);
     navigate('/detail-movie', { state: movie });
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
  };
}
