/* eslint-disable react-hooks/set-state-in-effect */

import { Heart } from 'lucide-react';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChannelCard } from '../components/Cards/ChannelCard';
import { VideoPlayer } from '../components/Player/VideoPlayer';
import ButtonCategory from '../components/UI/ButtonCategory';
import { EpgList } from '../components/UI/EpgList';
import { Input } from '../components/UI/Input';
import RemoteHint from '../components/UI/RemoteHint';
import { useFocusZone } from '../Context/FocusContext';
import { useBackGuard } from '../hooks/useBackGuard';
import { useRemoteControl } from '../hooks/useRemotoControl';
import useWindowSize from '../hooks/useWindowSize';
import { useAuthStore } from '../store/authStore';
import { useContentStore } from '../store/contentStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { useWatchHistoryStore } from '../store/watchHistoryStore';
import { xtreamApi } from '../utils/xtreamApi';

export const Live = () => {
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

  // Interceptar o botão voltar nativo do navegador/TV quando em tela cheia.
  useBackGuard(isFullScreen, () => setIsFullScreen(false));

  const ITEMS_PER_PAGE = 20;

  const categoriesWithAll = [
    { id: '-1', name: 'FAVORITOS' },
    { id: null, name: 'TODOS' },
    ...liveCategories
  ];

  // Ordenar channels apenas uma vez na inicialização
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

  // Canais a exibir (com limit de displayCount)
  const displayedChannels = filteredChannels.slice(0, displayCount);
  const hasMoreChannels = displayCount < filteredChannels.length;

  // Buscar programação (EPG) quando um canal é selecionado
  useEffect(() => {
    if (currentStream?.id && serverConfig) {
      // Registrar canal no histórico
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
        .catch(err => {
          console.error('Erro ao buscar EPG:', err);
          setEpgList([]);
        })
        .finally(() => {
          setIsLoadingEpg(false);
        });
    } else {
      setEpgList([]);
    }
  }, [currentStream?.id, serverConfig]);

  // Hotkeys para navegação
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

  // Infinite scroll - detectar quando chegar ao final
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMoreChannels && !isLoadingMore) {
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
  }, [hasMoreChannels, isLoadingMore]);

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
      // Scroll para o canal focado
      const focusedElement = gridRef.current.querySelector('[data-focused="true"]');
      if (focusedElement instanceof HTMLElement) {
        focusedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [focusedIndex, isZoneList]);

  // Carregar mais canais quando chegar próximo ao final durante navegação por setas
  useEffect(() => {
    if (isZoneList && focusedIndex >= displayedChannels.length - 1 && hasMoreChannels) {
      setDisplayCount(prev => prev + ITEMS_PER_PAGE);
    }
  }, [focusedIndex, isZoneList, displayedChannels.length, hasMoreChannels]);

  // Auto-scroll EPG focado
  useEffect(() => {
    if (isZoneEpg && epgRef.current) {
      const focusedElement = epgRef.current.querySelector('[data-focused="true"]');
      if (focusedElement instanceof HTMLElement) {
        focusedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [focusedEpgIndex, isZoneEpg]);

  return (
    <div className="max-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="flex mt-[60px] h-[calc(100vh-60px)]">
        {/* Filters */}
        {liveCategories.length > 0 && (
          <div
            ref={categoriesRef}
            className="w-3/12 max-md:w-4/12 max-w-[400px] border-gray-800 w-border-b bg-gray-900/50 overflow-y-scroll pt-4"
          >
            <div className="px-3 py-4 mx-auto max-w-7xl">
              <div className="flex flex-col gap-2 pb-2">
                {categoriesWithAll.map((cat, i) => (
                  <ButtonCategory
                    key={cat.id || 'all'}
                    id={String(cat.id || '-2')}
                    name={cat.name.replace('CANAIS |', '')}
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
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        <div ref={gridRef} className={`flex-1 px-4 py-8 overflow-y-scroll overflow-x-none `}>
          <div className="flex-1 mb-5">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Buscar canais..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={focusedInput ? 'ring-2 ring-red-600' : ''}
              onFocus={() => setFocusedInput(true)}
              onBlur={() => setFocusedInput(false)}
            />
          </div>
          {filteredChannels.length > 0 ? (
            <div className="grid gap-4 grid-cols-1">
              {displayedChannels.map((channel, i) => (
                <ChannelCard
                  key={channel.id}
                  id={channel.id}
                  channel={channel}
                  isFocused={isZoneList && focusedIndex === i}
                  onPlay={() => {
                    if (
                      !isMobile &&
                      (Boolean(currentStream) == false || currentStream.id !== channel.id)
                    ) {
                      setCurrentStream(channel);
                    } else {
                      setIsFullScreen(true);
                    }
                  }}
                />
              ))}

              {/* Sentinel element para infinite scroll */}
              <div ref={loadMoreRef} className="col-span-full py-4">
                {hasMoreChannels && isLoadingMore && (
                  <div className="flex justify-center">
                    <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {!hasMoreChannels && displayedChannels.length > 0 && (
                  <p className="text-center text-gray-500 text-sm">Fim da lista</p>
                )}
              </div>
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-lg text-gray-400">Nenhum canal encontrado</p>
            </div>
          )}
        </div>
        {!isMobile && (
          <div
            className={`
            flex flex-col items-center
            ${isFullScreen ? 'fixed inset-0 z-50 bg-black' : ' w-5/12 max-w-[1000px] relative mt-[35px] mx-4'}
           `}
          >
            {!isFullScreen && (
              <div className="w-full text-2xl max-md:text-sm font-semibold line-clamp-1 bg-netflix-red">
                Canal - {currentStream ? currentStream.name : 'Nenhum canal selecionado'}
              </div>
            )}
            <VideoPlayer
              title={currentStream?.title}
              source={currentStream ? currentStream.streamUrl : ''}
              poster={currentStream?.poster}
              autoPlay
              isControlsVisible={false}
              onError={error => {
                console.error('Erro no player:', error);
              }}
              streamId={currentStream?.id}
              type="live"
              onBack={() => setIsFullScreen(false)}
            />
            {!isFullScreen && (
              <Fragment>
                <section className="flex flex-col gap-4 w-full max-w-7xl mt-4">
                  <div className="border-b border-gray-800 text-2xl font-semibold line-clamp-1 pb-2">
                    <h4>Funções dos botão</h4>
                  </div>
                  <div className="flex items-center text-2xl">
                    <RemoteHint color="yellow" label="Favoritar canal" />
                  </div>
                </section>
                <EpgList
                  epgList={epgList}
                  isZoneEpg={isZoneEpg}
                  focusedEpgIndex={focusedEpgIndex}
                  isLoadingEpg={isLoadingEpg}
                />
              </Fragment>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
