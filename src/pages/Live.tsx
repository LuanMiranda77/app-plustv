/* eslint-disable react-hooks/set-state-in-effect */

import { RectangleHorizontalIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChannelCard } from '../components/Cards/ChannelCard';
import { VideoPlayer } from '../components/Player/VideoPlayer';
import ButtonCategory from '../components/UI/ButtonCategory';
import { Input } from '../components/UI/Input';
import { useFocusZone } from '../Context/FocusContext';
import { useRemoteControl } from '../hooks/useRemotoControl';
import useWindowSize from '../hooks/useWindowSize';
import { useContentStore } from '../store/contentStore';

export const Live = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { channels, liveCategories } = useContentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentStream, setCurrentStream] = useState<any | null>(null);
  const [displayCount, setDisplayCount] = useState(20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useWindowSize();
  const { activeZone, setActiveZone } = useFocusZone();
  const [focusedCat, setFocusedCat] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const isZoneCat = activeZone === 'content';
  const isZoneList = activeZone === 'list';

  const ITEMS_PER_PAGE = 20;

  const categoriesWithAll = [{ id: null, name: 'TODOS' }, ...liveCategories];

  const filteredChannels = channels.filter((channel) => {
    const matchesSearch =
      channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      channel.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || channel.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Canais a exibir (com limit de displayCount)
  const displayedChannels = filteredChannels.slice(0, displayCount);
  const hasMoreChannels = displayCount < filteredChannels.length;

  useRemoteControl({
    onRight: () => {
      if (isZoneCat) {
        setActiveZone('list');
        setFocusedIndex(0);
      }
      if (isZoneList && focusedIndex < displayedChannels.length - 1) {
        setFocusedIndex(focusedIndex + 1);
      }
    },
    onLeft: () => {
      if (isZoneList && focusedIndex > 0) {
        setFocusedIndex(focusedIndex - 1);
      }
    },
    onDown: () => {
      if (isZoneCat && focusedCat < liveCategories.length) {
        setFocusedCat(Math.min(focusedCat + 1, liveCategories.length));
      }
      if (isZoneList && focusedIndex < displayedChannels.length - 1) {
        setFocusedIndex(Math.min(focusedIndex + 4, displayedChannels.length - 1));
      }
    },
    onUp: () => {
      if (isZoneCat && focusedCat > 0) {
        setFocusedCat(Math.max(focusedCat - 1, 0));
      }
      if (isZoneList && focusedIndex > 0) {
        setFocusedIndex(Math.max(focusedIndex - 4, 0));
      }
    },
    onOk: () => {
      console.log("sdasfd");
      if (isZoneCat) {
        setSelectedCategory(categoriesWithAll[focusedCat]?.id || null);
      }
      if (isZoneList) {
        setIsFullScreen(true);
      }
    },
    onBack: () => {
      if (currentStream) {
        setCurrentStream(null);
        setIsFullScreen(false);
      }
    },
  });

  useEffect(() => {
    const state = location.state as any;
    if (state) {
      setCurrentStream(state);
      setSelectedCategory(state.category || null);
      console.log(`cd-${state.id}`);
      console.log(document.getElementById(`cd-${state.id}`));
      document.getElementById(`cd-${state.id}`)?.focus();
      document.getElementById(state.id)?.click();
    } else {
      setCurrentStream(null);
    }
  }, [location]);

  // Infinite scroll - detectar quando chegar ao final
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreChannels && !isLoadingMore) {
          setIsLoadingMore(true);
          // Simular delay de carregamento
          setTimeout(() => {
            setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
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
      // Scroll para categoria focada
      const focusedElement = categoriesRef.current.querySelector('[data-focused="true"]');
      if (focusedElement instanceof HTMLElement) {
        focusedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
      setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
    }
  }, [focusedIndex, isZoneList, displayedChannels.length, hasMoreChannels]);

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
                    id={String(cat.id || '-1')}
                    name={cat.name.replace('CANAIS |', '')}
                    isSelected={selectedCategory === (cat.id as any)}
                    isFocused={isZoneCat && focusedCat === i}
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
        <div ref={gridRef} className={`flex-1 px-3 py-8 overflow-y-scroll`}>
          <div className="flex-1 mb-5">
            <Input
              type="text"
              placeholder="Buscar canais..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={liveCategories.length === 0 || !selectedCategory}
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
                      setCurrentStream({
                        id: channel.id,
                        streamUrl: channel.streamUrl,
                        title: channel.name,
                        poster: channel.logo,
                        type: 'live',
                        category: channel.category,
                      });
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
            ${isFullScreen ? 'fixed inset-0 z-50 bg-black' : ' w-5/12 max-w-[1300px] relative mt-[35px] mx-4'}
           `}
          >
            {!isFullScreen && (
              <div className="w-full text-2xl max-md:text-sm font-semibold line-clamp-1 bg-netflix-red">
                Preview
              </div>
            )}
            <VideoPlayer
              title={currentStream?.title}
              source={currentStream ? currentStream.streamUrl : ''}
              poster={currentStream?.poster}
              autoPlay
              isControlsVisible={false}
              onError={(error) => {
                console.error('Erro no player:', error);
              }}
              streamId={currentStream?.id}
              type="live"
            />

            <section className="w-full max-w-7xl mt-4">
              <div className="border-b border-gray-800 text-2xl font-semibold line-clamp-1 pb-2">
                <h4>Funções dos botão</h4>
              </div>
              <div className="flex items-center text-2xl">
                <RectangleHorizontalIcon className="fill-current text-yellow-400" />
                <span className="ml-2">Favoritar</span>
              </div>
            </section>
            <section></section>
          </div>
        )}
      </div>
    </div>
  );
};
