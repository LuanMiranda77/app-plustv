import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ChannelCard } from '../components/Cards/ChannelCard'
import { MovieCard } from '../components/Cards/MovieCard'
import { SeriesCard } from '../components/Cards/SeriesCard'
import { useFavoritesStore } from '../store/favoritesStore'

export const Favorites = () => {
  const navigate = useNavigate()
  const { getFavoritesByType } = useFavoritesStore()

  const favoriteMovies = getFavoritesByType('movie')
  const favoriteChannels = getFavoritesByType('channel')
  const favoriteSeries = getFavoritesByType('series')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 sticky top-0 z-40 bg-gray-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/home')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-3xl font-bold text-white">Meus Favoritos</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        {/* Canais Favoritos */}
        {favoriteChannels.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Canais Favoritos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {favoriteChannels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel as any}
                  onPlay={() => {
                    window.location.href = `/player?url=${encodeURIComponent((channel as any).streamUrl)}`
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Filmes Favoritos */}
        {favoriteMovies.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Filmes Favoritos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {favoriteMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie as any}
                  onPlay={() => {
                    window.location.href = `/player?url=${encodeURIComponent((movie as any).streamUrl)}`
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Séries Favoritas */}
        {favoriteSeries.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Séries Favoritas</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {favoriteSeries.map((series) => (
                <SeriesCard
                  key={series.id}
                  series={series as any}
                  onPlay={() => console.log('Play series:', series.id)}
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
              <p className="text-gray-400 text-lg">
                Você ainda não adicionou nada aos favoritos
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Clique no ícone de coração para adicionar itens
              </p>
            </div>
          )}
      </div>
    </div>
  )
}
