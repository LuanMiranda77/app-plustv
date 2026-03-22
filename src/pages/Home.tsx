import { Film, Sparkles, TrendingUp, Tv2, TvMinimalPlay } from 'lucide-react';
import AutoCarousel from '../components/AutoCarousel';
import { ChannelPoster } from '../components/Cards/ChannelPoster';
import { SeriesCard } from '../components/Cards/SeriesCard';
import { StreamPoster } from '../components/Cards/StreamPoster';
import AdvertisementCarousel from '../components/UI/AdvertisementCarousel';
import CarouselSection from '../components/UI/CarouselSection';
import ContinueWatchingSection from '../components/UI/ContinueWatchingSection';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { useHome } from '../hooks/useHome';

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
    navigateEpisodio
  } = useHome();

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
              focusedItemIndex={getFocusedIndex('continue-watching')}
              onPlay={item => {
                if (item.type === 'movie') {
                  navigateMovie(item.content);
                } else if (item.type === 'series') {
                  navigateEpisodio(item);
                }
              }}
              onViewHistory={() => navigate('/watch-history')}
              onRecentlyWatched={setRecentlyWatched}
            />

            {/* Live Channels */}
            {topChannels.length > 0 && (
              <CarouselSection
                title={recentChannels.length > 0 ? 'Últimos Canais Assistidos' : 'Canais ao Vivo'}
                subtitle={
                  recentChannels.length > 0
                    ? 'Continue de onde parou'
                    : 'Seus canais favoritos em tempo real'
                }
                icon={Tv2}
                items={topChannels}
                focusedItemIndex={getFocusedIndex('live-channels')}
                renderItem={(channel, idx, isFocused) => (
                  <ChannelPoster
                    channel={channel}
                    isFocused={isFocused}
                    onPlay={() => navigate('/player', { state: channel })}
                  />
                )}
                onViewMore={() => navigate('/live')}
              />
            )}

            {/* Utimate Movies */}
            {recentlyWatched.length > 0 && (
              <CarouselSection
                title="Utimos Filmes Assistidos"
                subtitle="Se gostou, assista novamente"
                icon={TrendingUp}
                items={recentlyWatched.filter(item => item.type === 'movie')}
                badge="repeat"
                focusedItemIndex={getFocusedIndex('last-movies')}
                renderItem={(movie, idx, isFocused) => (
                  <StreamPoster
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
              <CarouselSection
                title="Filmes em Tendência"
                subtitle="Os filmes mais assistidos neste mês"
                icon={TrendingUp}
                items={trendingMovies}
                badge="trending"
                focusedItemIndex={getFocusedIndex('trending-movies')}
                renderItem={(movie, idx, isFocused) => (
                  <StreamPoster
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
              <CarouselSection
                title="Lançamentos"
                subtitle="Confira os novos filmes adicionados"
                icon={Sparkles}
                items={newMovies}
                badge="novo"
                focusedItemIndex={getFocusedIndex('new-movies')}
                renderItem={(movie, idx, isFocused) => (
                  <StreamPoster
                    stream={movie}
                    isFocused={isFocused}
                    onPlay={() => navigateMovie(movie, 'detail-movie')}
                  />
                )}
                onViewMore={() => navigate('/movie')}
              />
            )}

            {/* Utimate Series */}
            {recentlyWatched.length > 0 && (
              <CarouselSection
                title="Utimos Séries Assistidos"
                subtitle="Se gostou, assista novamente"
                icon={TrendingUp}
                items={recentlyWatched.filter(item => item.type === 'series')}
                badge="repeat"
                focusedItemIndex={getFocusedIndex('last-series')}
                renderItem={(series, idx, isFocused) => (
                  <StreamPoster
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
              <CarouselSection
                title="Séries Populares"
                subtitle="Acompanhe as séries mais assistidas"
                icon={TvMinimalPlay}
                items={trendingSeries}
                badge="trending"
                focusedItemIndex={getFocusedIndex('trending-series')}
                renderItem={(s, idx, isFocused) => (
                  <SeriesCard
                    series={s}
                    isFocused={isFocused}
                    onPlay={() => navigateSerie(s, 'detail-series')}
                  />
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
                focusedItemIndex={getFocusedIndex('new-series')}
                renderItem={(s, idx, isFocused) => (
                  <SeriesCard
                    series={s}
                    isFocused={isFocused}
                    onPlay={() => navigateSerie(s, 'detail-series')}
                  />
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
