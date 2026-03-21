import { Film, Sparkles, TrendingUp, Tv2, TvMinimalPlay } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AutoCarousel from '../components/AutoCarousel';
import { ChannelPoster } from '../components/Cards/ChannelPoster';
import { SeriesCard } from '../components/Cards/SeriesCard';
import { StreamPoster } from '../components/Cards/StreamPoster';
import AdvertisementCarousel from '../components/UI/AdvertisementCarousel';
import CarouselSection from '../components/UI/CarouselSection';
import ContinueWatchingSection from '../components/UI/ContinueWatchingSection';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { useFocusZone } from '../Context/FocusContext';
import { useRemoteControl } from '../hooks/useRemotoControl';
import { useAuthStore } from '../store/authStore';
import { useContentStore } from '../store/contentStore';
import { useWatchHistoryStore } from '../store/watchHistoryStore';

export const Home = () => {
  const navigate = useNavigate();
  const { serverConfig } = useAuthStore();
  const { movies, channels, series, isLoading, error, fetchServerContent } = useContentStore();
  const { getRecentlyWatched, loadFromStorage } = useWatchHistoryStore();
  // const [scrolling, setScrolling] = useState(false);
  const [recentlyWatched, setRecentlyWatched] = useState<any[]>([]);
  // const [recentMovies, setRecentMovies] = useState<any[]>([]);
  // const [recentSeries, setRecentSeries] = useState<any[]>([]);
  const hasLoadedData = useRef(false);
  const { activeZone, setActiveZone } = useFocusZone();
  const isActive = activeZone === 'content';

  // Estados para navegação de TV
  const [focusedSection, setFocusedSection] = useState(0); // Qual seção está focada
  const [focusedItemIndex, setFocusedItemIndex] = useState(0); // Qual item dentro da seção

  useEffect(() => {
    // Auto-scroll quando o foco muda
    if (isActive && document.documentElement) {
      const focusedElement = document.querySelector('[data-focused="true"]');
      if (focusedElement instanceof HTMLElement) {
        focusedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [focusedSection, focusedItemIndex, isActive]);

  useEffect(() => {
    // Only load data once on mount
    if (hasLoadedData.current) return;
    hasLoadedData.current = true;

    // Carregar histórico do localStorage
    loadFromStorage();

    // Tentar buscar do servidor real se houver configuração
    if (serverConfig) {
      fetchServerContent(serverConfig);
    }

    // Get recently watched items after loading history
    setTimeout(() => {
      setRecentlyWatched(getRecentlyWatched(20));
      // setRecentMovies(getRecentMovies());
      // setRecentSeries(getRecentSeries());
    }, 0);
  }, []);

  // useEffect(() => {
  //   const handleScroll = () => {
  //     setScrolling(window.scrollY > 100);
  //   };
  //   window.addEventListener('scroll', handleScroll);
  //   return () => window.removeEventListener('scroll', handleScroll);
  // }, []);

  // Navegação por controle remoto
  useRemoteControl({
    onRight: () => {
      if (!isActive) return;
      setFocusedItemIndex(prev => prev + 1);
    },
    onLeft: () => {
      if (!isActive) return;
      if (focusedItemIndex > 0) {
        setFocusedItemIndex(prev => prev - 1);
      }
    },
    onDown: () => {
      if (!isActive) return;
      if (focusedSection < activeSections.length - 1) {
        setFocusedSection(prev => prev + 1);
        setFocusedItemIndex(0);
      }
    },
    onUp: () => {
      if (!isActive) return;
      if (focusedSection > 0) {
        setFocusedSection(prev => prev - 1);
        setFocusedItemIndex(0);
      } else if (focusedSection === 0) {
        // Se está na primeira seção, volta para o banner
        setFocusedSection(-1);
        setFocusedItemIndex(0);
      } else if (focusedSection === -1) {
        // Se está no AutoCarousel, volta para o menu
        setActiveZone('menu');
      }
    },
    onOk: () => {
      if (!isActive) return;

      // Se está no AutoCarousel
      if (focusedSection === -1) {
        const heroItem = heroItems[focusedItemIndex];
        if (heroItem?.onPlay) {
          heroItem.onPlay();
        }
        return;
      }

      // Para as outras seções
      const item = currentSectionData[focusedItemIndex];
      if (!item) return;

      const sectionType = currentSection?.type;

      switch (sectionType) {
        case 'continue-watching':
          if (item.type === 'movie') {
            navigateMovie(item);
          } else if (item.type === 'series') {
            navigateSerie(item);
          }
          break;
        case 'live-channels':
          navigate('/player', {
            state: {
              id: item.id,
              streamUrl: item.streamUrl,
              title: item.name,
              poster: item.logo,
              type: 'live',
              category: item.category
            }
          });
          break;
        case 'trending-movies':
        case 'new-movies':
          navigateMovie(item);
          break;
        case 'trending-series':
        case 'new-series':
          navigateSerie(item);
          break;
      }
    },
    onBack: () => {
      setActiveZone('menu');
    }
  });

  const topChannels = channels.slice(0, 8);
  const newMovies = movies.slice(0, 10);
  const newSeries = series.slice(0, 10);
  const trendingMovies = movies.filter((m, i) => {
    const ratingNum = m.rating && m.rating !== 'N/A' ? Number(m.rating) : 0;
    return ratingNum >= 6 && i < 30;
  });
  const trendingSeries = series.filter((m, i) => {
    const ratingNum = m.rating && m.rating !== 'N/A' ? Number(m.rating) : 0;
    return ratingNum >= 7 && i < 30;
  });

  // Mapeamento das seções visíveis
  const sections = [
    {
      id: 'continue-watching',
      type: 'continue-watching',
      data: recentlyWatched,
      visible: recentlyWatched.length > 0
    },
    {
      id: 'live-channels',
      type: 'live-channels',
      data: topChannels,
      visible: topChannels.length > 0
    },
    {
      id: 'trending-movies',
      type: 'trending-movies',
      data: trendingMovies,
      visible: trendingMovies.length > 0
    },
    {
      id: 'new-movies',
      type: 'new-movies',
      data: newMovies,
      visible: newMovies.length > 0
    },
    {
      id: 'trending-series',
      type: 'trending-series',
      data: trendingSeries,
      visible: trendingSeries.length > 0
    },
    {
      id: 'new-series',
      type: 'new-series',
      data: newSeries,
      visible: newSeries.length > 0
    }
  ];

  const activeSections = sections.filter(s => s.visible);
  const currentSection = activeSections[focusedSection];
  const currentSectionData = currentSection?.data || [];

  const navigateMovie = (movie: any) => {
    navigate('/player', {
      state: {
        id: movie.id,
        streamUrl: movie.streamUrl,
        title: movie.name,
        poster: movie.poster,
        type: 'movie',
        category: movie.category
      }
    });
  };

  const navigateSerie = (serie: any) => {
    navigate('/player', {
      state: {
        id: serie.id,
        streamUrl: serie.streamUrl,
        title: serie.name,
        poster: serie.poster,
        type: 'serie',
        category: serie.category
      }
    });
  };

  // Preparar dados do carousel automático (destaque)
  const heroItems = [
    ...movies.slice(0, 5).map(m => ({
      ...m,
      onPlay: () => navigateMovie(m)
    })),
    ...series.slice(0, 5).map(s => ({
      ...s,
      onPlay: () => navigateSerie(s)
    }))
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-y-scroll">
      {/* Auto Carousel Hero */}
      {heroItems.length > 0 && !isLoading && (
        <div
          data-focused={focusedSection === -1}
          className={focusedSection === -1 ? 'ring-2 ring-red-600 rounded-lg m-4' : ''}
        >
          <AutoCarousel
            className="max-h-[700px]"
            items={heroItems}
            autoPlayInterval={5000}
            // onPlay={(item) => {
            //   const movie = movies.find((m) => m.id === item.id);
            //   const serie = series.find((s) => s.id === item.id);
            //   if (movie) {
            //     navigateMovie(item);
            //   } else if (serie) {
            //     navigateSerie(item);
            //   }
            // }}
            // onInfo={(item) => {
            //   const movie = movies.find((m) => m.id === item.id);
            //   const serie = series.find((s) => s.id === item.id);
            //   if (movie) {
            //     navigateMovie(item);
            //   } else if (serie) {
            //     navigateSerie(item);
            //   }
            // }}
          />
        </div>
      )}

      {/* Advertisement Carousel */}
      <AdvertisementCarousel />

      {/* Main Content */}
      <div className="w-9/12 mx-auto px-6 space-y-16 pb-16">
        {isLoading && (
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner />
          </div>
        )}

        {!isLoading && error && (
          <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4 mb-6">
            <p className="text-red-400">Erro ao carregar conteúdo: {error}</p>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Continue Watching */}
            <ContinueWatchingSection
              items={recentlyWatched}
              focusedItemIndex={
                activeSections[focusedSection]?.type === 'continue-watching' ? focusedItemIndex : -1
              }
              onPlay={item => {
                if (item.type === 'movie') {
                  navigateMovie(item);
                } else if (item.type === 'series') {
                  navigateSerie(item.content);
                }
              }}
              onViewHistory={() => navigate('/watch-history')}
              onRecentlyWatched={setRecentlyWatched}
            />

            {/* Live Channels */}
            {topChannels.length > 0 && (
              <CarouselSection
                title="Canais ao Vivo"
                subtitle="Seus canais favoritos em tempo real"
                icon={Tv2}
                items={topChannels}
                focusedItemIndex={
                  activeSections[focusedSection]?.type === 'live-channels' ? focusedItemIndex : -1
                }
                renderItem={(channel, idx, isFocused) => (
                  <ChannelPoster
                    channel={channel}
                    isFocused={isFocused}
                    onPlay={() => {
                      navigate('/player', {
                        state: {
                          id: channel.id,
                          streamUrl: channel.streamUrl,
                          title: channel.name,
                          poster: channel.logo,
                          type: 'live',
                          category: channel.category
                        }
                      });
                    }}
                  />
                )}
                onViewMore={() => navigate('/live')}
              />
            )}

            {/* Trending Movies */}
            {trendingMovies.length > 0 && (
              <CarouselSection
                title="Filmes em Tendência"
                subtitle="Os filmes mais assistidos neste mês"
                icon={TrendingUp}
                items={trendingMovies}
                badge="trending"
                focusedItemIndex={
                  activeSections[focusedSection]?.type === 'trending-movies' ? focusedItemIndex : -1
                }
                renderItem={(movie, idx, isFocused) => (
                  <StreamPoster
                    stream={movie}
                    isFocused={isFocused}
                    onPlay={() => navigateMovie(movie)}
                  />
                )}
                onViewMore={() => navigate('/movie')}
              />
            )}

            {/* New Movies */}
            {newMovies.length > 0 && (
              <CarouselSection
                title="Lançamentos"
                subtitle="Confira os novos filmes adicionados"
                icon={Sparkles}
                items={newMovies}
                badge="novo"
                focusedItemIndex={
                  activeSections[focusedSection]?.type === 'new-movies' ? focusedItemIndex : -1
                }
                renderItem={(movie, idx, isFocused) => (
                  <StreamPoster
                    stream={movie}
                    isFocused={isFocused}
                    onPlay={() => navigateMovie(movie)}
                  />
                )}
                onViewMore={() => navigate('/movie')}
              />
            )}

            {/* Trending Series */}
            {trendingSeries.length > 0 && (
              <CarouselSection
                title="Séries Populares"
                subtitle="Acompanhe as séries mais assistidas"
                icon={TvMinimalPlay}
                items={trendingSeries}
                badge="trending"
                focusedItemIndex={
                  activeSections[focusedSection]?.type === 'trending-series' ? focusedItemIndex : -1
                }
                renderItem={(s, idx, isFocused) => (
                  <SeriesCard series={s} isFocused={isFocused} onPlay={() => navigateSerie(s)} />
                )}
                onViewMore={() => navigate('/series')}
              />
            )}

            {/* New Series */}
            {newSeries.length > 0 && (
              <CarouselSection
                title="Lançamento"
                subtitle="Confira os novos séries adicionados"
                icon={Sparkles}
                items={newSeries}
                badge="novo"
                focusedItemIndex={
                  activeSections[focusedSection]?.type === 'new-series' ? focusedItemIndex : -1
                }
                renderItem={(s, idx, isFocused) => (
                  <SeriesCard series={s} isFocused={isFocused} onPlay={() => navigateSerie(s)} />
                )}
                onViewMore={() => navigate('/series')}
              />
            )}

            {/* Empty State */}
            {trendingMovies.length === 0 &&
              topChannels.length === 0 &&
              trendingSeries.length === 0 && (
                <div className="text-center py-16">
                  <Film className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-400 text-lg">Nenhum conteúdo carregado ainda</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Faça login com suas credenciais IPTV para ver o conteúdo
                  </p>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
};
