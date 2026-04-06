import { Film, Sparkles, TrendingUp, Tv2, TvMinimalPlay } from 'lucide-react';
import { lazy, Suspense, memo, useMemo, useCallback } from 'react';
import { ChannelPoster } from '../components/Cards/ChannelPoster';
import { StreamPoster } from '../components/Cards/StreamPoster';
import AdvertisementCarousel from '../components/UI/AdvertisementCarousel';
import CarouselSection from '../components/UI/CarouselSection';
import ContinueWatchingSection from '../components/UI/ContinueWatchingSection';
import { useHome } from '../hooks/useHome';

// Lazy load do AutoCarousel
const AutoCarousel = lazy(() => import('../components/UI/AutoCarousel'));

// Componente de loading para o carousel
const CarouselLoader = () => (
  <div className="w-full h-[400px] bg-gray-900/50 animate-pulse rounded-lg" />
);

// Memoizar componentes de seção para evitar re-renders desnecessários
const MemoizedChannelPoster = memo(ChannelPoster);
const MemoizedStreamPoster = memo(StreamPoster);
const MemoizedCarouselSection = memo(CarouselSection);
const MemoizedContinueWatchingSection = memo(ContinueWatchingSection);
const MemoizedAdvertisementCarousel = memo(AdvertisementCarousel);

export const Home = () => {
  const {
    isLoading,
    error,
    focusedSection,
    heroItems,
    topChannels,
    recentChannels,
    recentlyWatched,
    newMovies,
    newSeries,
    trendingMovies,
    trendingSeries,
    getFocusedIndex,
    setRecentlyWatched,
    navigate,
    navigateMovie,
    navigateSerie,
    navigateEpisodio,
    navigateLive
  } = useHome();

  // Memoizar dados filtrados
  const lastMovies = useMemo(
    () => recentlyWatched.filter(item => item.type === 'movie'),
    [recentlyWatched]
  );

  const lastSeries = useMemo(
    () => recentlyWatched.filter(item => item.type === 'series'),
    [recentlyWatched]
  );

  const displayChannels = useMemo(
    () => (recentChannels.length > 0 ? recentChannels : topChannels),
    [recentChannels, topChannels]
  );

  const hasAnyContent = useMemo(
    () => trendingMovies.length > 0 || topChannels.length > 0 || trendingSeries.length > 0,
    [trendingMovies, topChannels, trendingSeries]
  );

  // Handler memoizado
  const handleContinueWatchingPlay = useCallback(
    (item: any) => {
      if (item.type === 'movie') {
        navigateMovie(item.content);
      } else if (item.type === 'series') {
        navigateEpisodio(item);
      }
    },
    [navigateMovie, navigateEpisodio]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-y-scroll">
      {/* Auto Carousel Hero - Lazy loading */}
      {heroItems.length > 0 && !isLoading && (
        <div
          data-focused={focusedSection === -1}
          className={focusedSection === -1 ? 'ring-2 ring-red-600 rounded-lg m-4' : ''}
        >
          <Suspense fallback={<CarouselLoader />}>
            <AutoCarousel className="max-h-[700px]" items={heroItems} autoPlayInterval={5000} />
          </Suspense>
        </div>
      )}

      {/* Advertisement Carousel - Memoizado */}
      <MemoizedAdvertisementCarousel />

      {/* Main Content */}
      <div className="w-9/12 mx-auto px-6 space-y-16 pb-16">
        {!isLoading && error && (
          <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4 mb-6">
            <p className="text-red-400">Erro ao carregar conteúdo: {error}</p>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Continue Watching */}
            {recentlyWatched.length > 0 && (
              <MemoizedContinueWatchingSection
                items={recentlyWatched}
                focusedItemIndex={getFocusedIndex('continue-watching')}
                onPlay={handleContinueWatchingPlay}
                onViewHistory={() => navigate('/watch-history')}
                onRecentlyWatched={setRecentlyWatched}
              />
            )}

            {/* Live Channels */}
            {displayChannels.length > 0 && (
              <MemoizedCarouselSection
                title={recentChannels.length > 0 ? 'Últimos Canais Assistidos' : 'Canais ao Vivo'}
                subtitle={
                  recentChannels.length > 0
                    ? 'Continue de onde parou'
                    : 'Seus canais favoritos em tempo real'
                }
                icon={Tv2}
                items={displayChannels}
                focusedItemIndex={getFocusedIndex('live-channels')}
                renderItem={(channel, idx, isFocused) => (
                  <MemoizedChannelPoster
                    channel={channel}
                    isFocused={isFocused}
                    onPlay={() => navigateLive(channel)}
                  />
                )}
                onViewMore={() => navigate('/live')}
              />
            )}

            {/* Last Movies */}
            {lastMovies.length > 0 && (
              <MemoizedCarouselSection
                title="Últimos Filmes Assistidos"
                subtitle="Se gostou, assista novamente"
                icon={TrendingUp}
                items={lastMovies}
                badge="repeat"
                focusedItemIndex={getFocusedIndex('last-movies')}
                renderItem={(movie, idx, isFocused) => (
                  <MemoizedStreamPoster
                    stream={movie}
                    isFocused={isFocused}
                    onPlay={() => navigateMovie(movie.content)}
                  />
                )}
                onViewMore={() => navigate('/movie')}
              />
            )}

            {/* Trending Movies */}
            {trendingMovies.length > 0 && (
              <MemoizedCarouselSection
                title="Filmes em Tendência"
                subtitle="Os filmes mais assistidos neste mês"
                icon={TrendingUp}
                items={trendingMovies}
                badge="trending"
                focusedItemIndex={getFocusedIndex('trending-movies')}
                renderItem={(movie, idx, isFocused) => (
                  <MemoizedStreamPoster
                    stream={movie}
                    isFocused={isFocused}
                    onPlay={() => navigateMovie(movie, 'detail-movie')}
                  />
                )}
                onViewMore={() => navigate('/movie')}
              />
            )}

            {/* New Movies */}
            {newMovies.length > 0 && (
              <MemoizedCarouselSection
                title="Filmes Lançamentos"
                subtitle="Confira os novos filmes adicionados"
                icon={Sparkles}
                items={newMovies}
                badge="novo"
                focusedItemIndex={getFocusedIndex('new-movies')}
                renderItem={(movie, idx, isFocused) => (
                  <MemoizedStreamPoster
                    stream={movie}
                    isFocused={isFocused}
                    onPlay={() => navigateMovie(movie, 'detail-movie')}
                  />
                )}
                onViewMore={() => navigate('/movie')}
              />
            )}

            {/* Last Series */}
            {lastSeries.length > 0 && (
              <MemoizedCarouselSection
                title="Últimas Séries Assistidas"
                subtitle="Se gostou, assista novamente"
                icon={TrendingUp}
                items={lastSeries}
                badge="repeat"
                focusedItemIndex={getFocusedIndex('last-series')}
                renderItem={(series, idx, isFocused) => (
                  <MemoizedStreamPoster
                    stream={series}
                    isFocused={isFocused}
                    onPlay={() => navigateSerie(series, 'detail-series')}
                  />
                )}
                onViewMore={() => navigate('/series')}
              />
            )}

            {/* Trending Series */}
            {trendingSeries.length > 0 && (
              <MemoizedCarouselSection
                title="Séries Populares"
                subtitle="Acompanhe as séries mais assistidas"
                icon={TvMinimalPlay}
                items={trendingSeries}
                badge="trending"
                focusedItemIndex={getFocusedIndex('trending-series')}
                renderItem={(s, idx, isFocused) => (
                  <MemoizedStreamPoster
                    stream={s}
                    isFocused={isFocused}
                    onPlay={() => navigateSerie(s, 'detail-series')}
                  />
                )}
                onViewMore={() => navigate('/series')}
              />
            )}

            {/* New Series */}
            {newSeries.length > 0 && (
              <MemoizedCarouselSection
                title="Séries Lançamentos"
                subtitle="Confira as novas séries adicionadas"
                icon={Sparkles}
                items={newSeries}
                badge="novo"
                focusedItemIndex={getFocusedIndex('new-series')}
                renderItem={(s, idx, isFocused) => (
                  <MemoizedStreamPoster
                    stream={s}
                    isFocused={isFocused}
                    onPlay={() => navigateSerie(s, 'detail-series')}
                  />
                )}
                onViewMore={() => navigate('/series')}
              />
            )}

            {/* Empty State */}
            {!hasAnyContent && (
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
