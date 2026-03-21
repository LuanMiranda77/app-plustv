/* eslint-disable react-hooks/set-state-in-effect */
import { Heart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { StreamPoster } from '../components/Cards/StreamPoster';
import ButtonCategory from '../components/UI/ButtonCategory';
import { Input } from '../components/UI/Input';
import SeriesDetail from '../components/UI/SeriesDetail';
import { useFocusZone } from '../Context/FocusContext';
import { useBackGuard } from '../hooks/useBackGuard';
import { useRemoteControl } from '../hooks/useRemotoControl';
import { useAuthStore } from '../store/authStore';
import { useContentStore } from '../store/contentStore';
import { useFavoritesStore } from '../store/favoritesStore';
import type { Season, Series } from '../types';
import { xtreamApi } from '../utils/xtreamApi';

export const PageSeries = () => {
  const { series, seriesCategories } = useContentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { serverConfig } = useAuthStore();
  const [currentSerie, setCurrentSerie] = useState<Series | null>(null);
  const [displayCount, setDisplayCount] = useState(20);
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

  // Interceptar voltar nativo do navegador/TV quando no detalhe da série
  useBackGuard(!!currentSerie, () => setCurrentSerie(null));

  const ITEMS_PER_PAGE = 30;

  const categoriesWithAll = [
    { id: '-1', name: 'FAVORITOS' },
    { id: null, name: 'TODOS' },
    ...seriesCategories
  ];

  // Hotkeys para navegação
  useRemoteControl({
    onRight: () => {
      if (isZoneCat) {
        setActiveZone('list');
        setFocusedIndex(focusedIndex === -1 ? 0 : focusedIndex);
        setFocusedInput(false);
      }
      // Navegar direita dentro da lista (mesma linha)
      if (isZoneList) {
        const column = focusedIndex % 5; // 5 colunas
        const isLastColumn = column === 4;
        if (!isLastColumn && focusedIndex < displayedSeries.length - 1) {
          setFocusedIndex(focusedIndex + 1);
        }
      }
    },
    onLeft: () => {
      if (isZoneList) {
        const column = focusedIndex % 5; // 5 colunas
        const isFirstColumn = column === 0;
        // Se está na primeira coluna, volta para categorias
        if (isFirstColumn) {
          setActiveZone('content');
          setFocusedCat(focusedCat);
          setFocusedIndex(-1);
        } else {
          // Senão, navega para esquerda
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
        // Se está nos primeiros 5 itens (primeira linha), vai para o input
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

  // 2. Só busca episódios quando o usuário ABRE a série
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
      .sort((a, b) => a.number - b.number); // ordenar temporadas

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

  // Séries a exibir (com limit de displayCount)
  const displayedSeries = filteredSeries.slice(0, displayCount);
  const hasMoreSeries = displayCount < filteredSeries.length;

  // Infinite scroll - detectar quando chegar ao final
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMoreSeries && !isLoadingMore) {
          setIsLoadingMore(true);
          // Simular delay de carregamento
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

  // Resetar displayCount ao mudar filtros
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [searchTerm, selectedCategory]);

  // Auto-scroll quando o foco muda
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
      // Scroll para a série focada
      const focusedElement = gridRef.current.querySelector('[data-focused="true"]');
      if (focusedElement instanceof HTMLElement) {
        focusedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [focusedIndex, isZoneList]);

  // Carregar mais séries quando chegar próximo ao final durante navegação por setas
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

  return currentSerie ? (
    <SeriesDetail
      series={currentSerie}
      onBack={() => setCurrentSerie(null)}
      onToggleFavorite={id => toggleFavorite(id)}
      onLoadDetail={id => loadSeriesDetail(id)}
    />
  ) : (
    <div className="max-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="flex mt-[60px] h-[calc(100vh-60px)]">
        {/* Filters */}
        {seriesCategories.length > 0 && (
          <div
            ref={categoriesRef}
            className="w-3/12 max-md:w-4/12 border-b border-gray-800 bg-gray-900/50 sticky top-20 overflow-y-scroll pt-4"
          >
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex flex-col gap-2 pb-2">
                {categoriesWithAll.map((cat, i) => {
                  return (
                    <ButtonCategory
                      key={cat.id || 'all'}
                      id={String(cat.id || '-2')}
                      name={cat.name.replace('SÉRIES |', '')}
                      isSelected={selectedCategory === (cat.id as any)}
                      isFocused={isZoneCat && focusedCat === i}
                      icon={
                        cat.id === '-1' ? (
                          <Heart className="w-6 h-6 max-md:w-6 max-md:h-4 text-white-600 fill-white" />
                        ) : undefined
                      }
                      onClick={() => {
                        setSelectedCategory(cat.id as any);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        <div ref={gridRef} className="flex-1 mx-auto px-6 py-8 overflow-y-scroll">
          <div className={`flex-1 mb-5 ${focusedInput ? 'ring-2 ring-red-600' : ''}`}>
            <Input
              ref={inputRef}
              type="text"
              placeholder="Buscar séries..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          {filteredSeries.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {displayedSeries.map((s, i) => (
                <StreamPoster
                  key={s.id}
                  stream={s}
                  isFocused={isZoneList && focusedIndex === i}
                  onPlay={() => setCurrentSerie(s)}
                />
              ))}

              {/* Sentinel element para infinite scroll */}
              <div ref={loadMoreRef} className="col-span-full py-4">
                {hasMoreSeries && isLoadingMore && (
                  <div className="flex justify-center">
                    <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {!hasMoreSeries && displayedSeries.length > 0 && (
                  <p className="text-center text-gray-500 text-sm">Fim da lista</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">Nenhuma série encontrada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
