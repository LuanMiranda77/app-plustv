import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChannelCard } from '../components/Cards/ChannelCard';
import { MovieCard } from '../components/Cards/MovieCard';
import { SeriesCard } from '../components/Cards/SeriesCard';
import { useFavoritesStore } from '../store/favoritesStore';

export const Favorites = () => {
  const navigate = useNavigate();
  const { getFavoritesByType } = useFavoritesStore();

  const favoriteMovies = getFavoritesByType('movie');
  const favoriteChannels = getFavoritesByType('live');
  const favoriteSeries = getFavoritesByType('series');

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        {/* Canais Favoritos */}
        {favoriteChannels.length > 0 && (
          <section>
            <h2 className="text-left text-2xl font-bold text-white mb-4">Canais Favoritos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-2 gap-4">
              {favoriteChannels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel as any}
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
              ))}
            </div>
          </section>
        )}

        {/* Filmes Favoritos */}
        {favoriteMovies.length > 0 && (
          <section>
            <h2 className="text-left text-2xl font-bold text-white mb-4">Filmes Favoritos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {favoriteMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie as any}
                  onPlay={() => {
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
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Séries Favoritas */}
        {favoriteSeries.length > 0 && (
          <section>
            <h2 className="text-left text-2xl font-bold text-white mb-4">Séries Favoritas</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {favoriteSeries.map((series) => (
                <SeriesCard
                  key={series.id}
                  series={series as any}
                  onPlay={() => {
                    navigate('/series', {
                      state: {
                        id: series.id,
                        streamUrl: series.streamUrl,
                        title: series.name,
                        poster: series.poster,
                        type: 'series',
                        category: series.category,
                      },
                    });
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {favoriteMovies.length === 0 &&
          favoriteChannels.length === 0 &&
          favoriteSeries.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">Você ainda não adicionou nada aos favoritos</p>
              <p className="text-gray-500 text-sm mt-2">
                Clique no ícone de coração para adicionar itens
              </p>
            </div>
          )}
      </div>
    </div>
  );
};
