import { Clock, Film, Play, Sparkles, TrendingUp, Tv2, TvMinimalPlay } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AutoCarousel from '../components/AutoCarousel';
import { ChannelCard } from '../components/Cards/ChannelCard';
import { ContinueWatchingCard } from '../components/Cards/ContinueWatchingCard';
import { MovieCard } from '../components/Cards/MovieCard';
import { SeriesCard } from '../components/Cards/SeriesCard';
import { Carousel } from '../components/Carousel';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { useAuthStore } from '../store/authStore';
import { useContentStore } from '../store/contentStore';
import { useWatchHistoryStore } from '../store/watchHistoryStore';
import CarouselSection from '../components/UI/CarouselSection';
import MainBanner from '../components/UI/MainBanner';
import { useFocusZone } from '../Context/FocusContext';

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

  const navigateMovie = (movie: any) => {
    navigate('/player', {
      state: {
        id: movie.id,
        streamUrl: movie.streamUrl,
        title: movie.name,
        poster: movie.poster,
        type: 'movie',
        category: movie.category,
      },
    });
  };

  const navigateSerie = (serie: any) => {
    navigate('/series', {
      state: {
        id: serie.id,
        streamUrl: serie.streamUrl,
        title: serie.name,
        poster: serie.poster,
        type: 'serie',
        category: serie.category,
      },
    });
  };

  // Preparar dados do carousel automático (destaque)
  const heroItems = [
    ...movies.slice(0, 5).map((m) => ({
      ...m,
      onPlay: () => navigateMovie(m),
    })),
    ...series.slice(0, 5).map((s) => ({
      ...s,
      onPlay: () => navigateSerie(s),
    })),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Auto Carousel Hero */}
      {heroItems.length > 0 && !isLoading && (
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
      )}

      {/* Main Banner */}
      <MainBanner
        title="Comece a Assistir"
        description="Acesse seus filmes, séries e canais favoritos em qualquer lugar"
        buttonLabel="Explorar Conteúdo"
        navigateTo="/movie"
        isFocused={activeZone === 'list'}
      />

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
            {recentlyWatched.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-6 h-6 text-red-600" />
                    <h2 className="text-2xl font-bold text-white">Continue Assistindo</h2>
                  </div>
                  <button
                    onClick={() => navigate('/watch-history')}
                    className="text-red-600 hover:text-red-500 font-semibold text-sm transition-colors flex items-center gap-1"
                  >
                    Ver histórico <span className="text-lg">→</span>
                  </button>
                </div>
                <p className="text-gray-400 text-sm">Onde você parou</p>

                <Carousel>
                  {recentlyWatched.map((item) => {
                    return (
                      <div key={item.id} className="w-80 flex-shrink-0">
                        <ContinueWatchingCard
                          item={item}
                          onPlay={() => {
                            if (item.type === 'movie') {
                              navigateMovie(item);
                            } else if (item.type === 'series') {
                              navigateSerie(item);
                            }
                          }}
                          onRecentlyWatched={setRecentlyWatched}
                        />
                      </div>
                    );
                  })}
                </Carousel>
              </section>
            )}

            {/* Live Channels */}
            {topChannels.length > 0 && (
              <CarouselSection
                title="Canais ao Vivo"
                subtitle="Seus canais favoritos em tempo real"
                icon={Tv2}
                items={topChannels}
                renderItem={(channel) => (
                  <ChannelCard
                    channel={channel}
                    onPlay={() => {
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
                renderItem={(movie) => (
                  <MovieCard movie={movie} onPlay={() => navigateMovie(movie)} />
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
                renderItem={(movie) => (
                  <MovieCard movie={movie} onPlay={() => navigateMovie(movie)} />
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
                renderItem={(s) => <SeriesCard series={s} onPlay={() => navigateSerie(s)} />}
                onViewMore={() => navigate('/series')}
              />
            )}

            {/* New Movies */}
            {trendingSeries.length > 0 && (
              <CarouselSection
                title="Lançamento"
                subtitle="Confira os novos séries adicionados"
                icon={Sparkles}
                items={newSeries}
                badge="novo"
                renderItem={(s) => <SeriesCard series={s} onPlay={() => navigateSerie(s)} />}
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
