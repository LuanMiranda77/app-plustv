/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChannelCard } from '../components/Cards/ChannelCard';
import { VideoPlayer } from '../components/Player/VideoPlayer';
import { Input } from '../components/UI/Input';
import useWindowSize from '../hooks/useWindowSize';
import { useContentStore } from '../store/contentStore';
import ButtonCategory from '../components/UI/ButtonCategory';

export const Live = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { channels, liveCategories } = useContentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentStream, setCurrentStream] = useState<any | null>(null);
  const [displayCount, setDisplayCount] = useState(20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useWindowSize();

  const ITEMS_PER_PAGE = 20;

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

  return (
    <div className="max-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="flex mt-[60px] h-[calc(100vh-60px)]">
        {/* Filters */}
        {liveCategories.length > 0 && (
          <div className="w-3/12 max-md:w-4/12 max-w-[500px] border-gray-800 w-border-b bg-gray-900/50 overflow-y-scroll pt-4">
            <div className="px-3 py-4 mx-auto max-w-7xl">
              <div className="flex flex-col gap-2 pb-2 overflow-x-auto">
                <ButtonCategory
                  id={'-1'}
                  name={'TODOS'}
                  isSelected={selectedCategory === null}
                  // isFocused={focusedIndex === i}
                  onClick={() => setSelectedCategory(null)}
                />

                {liveCategories.map((cat) => (
                  <ButtonCategory
                    key={cat.id}
                    id={cat.id}
                    name={cat.name.replace('CANAIS |', '')}
                    isSelected={selectedCategory === cat.id}
                    // isFocused={focusedIndex === i}
                    onClick={() => setSelectedCategory(cat.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className={`flex-1 px-3 py-8 overflow-y-scroll`}>
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
              {displayedChannels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  id={channel.id}
                  channel={channel}
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
                      navigate('/player', {
                        state: {
                          id: channel.id,
                          streamUrl: channel.streamUrl,
                          title: channel.name,
                          poster: channel.logo,
                          type: 'live',
                          category: channel.category,
                        },
                      });
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
          <div className="w-4/12 max-w-[1200px] t-[30px]">
            <div className="flex flex-col items-center justify-center flex-1 border-6 border-gray-950 rounded-lg mx-4">
              <div className="w-full text-2xl max-md:text-sm font-semibold line-clamp-1 bg-netflix-red">
                Preview
              </div>
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
            </div>
            <div></div>
          </div>
        )}
      </div>
    </div>
  );
};
