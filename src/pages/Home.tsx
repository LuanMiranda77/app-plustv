import { Clock, Film, Play, Sparkles, TrendingUp, Tv2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChannelCard } from '../components/Cards/ChannelCard'
import { ContinueWatchingCard } from '../components/Cards/ContinueWatchingCard'
import { MovieCard } from '../components/Cards/MovieCard'
import { SeriesCard } from '../components/Cards/SeriesCard'
import { Carousel } from '../components/Carousel'
import { LoadingSpinner } from '../components/UI/LoadingSpinner'
import {
  mockChannels,
  mockLiveCategories,
  mockMovies,
  mockSeries,
  mockSeriesCategories,
  mockVodCategories,
  mockWatchHistory,
} from '../data/mockData'
import { useAuthStore } from '../store/authStore'
import { useContentStore } from '../store/contentStore'
import { useWatchHistoryStore } from '../store/watchHistoryStore'

export const Home = () => {
  const navigate = useNavigate()
  const { activeProfile, serverConfig } = useAuthStore()
  const { movies, channels, series, isLoading, error, setMovies, setSeries, setChannels, setVodCategories, setSeriesCategories, setLiveCategories, fetchServerContent } = useContentStore()
  const { addToHistory, getRecentlyWatched } = useWatchHistoryStore()
  const [scrolling, setScrolling] = useState(false)
  const [recentlyWatched, setRecentlyWatched] = useState<typeof mockWatchHistory>([])
  const hasLoadedData = useRef(false)

  useEffect(() => {
    // Only load data once on mount
    if (hasLoadedData.current) return
    hasLoadedData.current = true

    // Tentar buscar do servidor real se houver configuração
    if (serverConfig) {
      fetchServerContent(serverConfig)
    } else {
      // Fallback para mock data se não houver config do servidor
      if (movies.length === 0) {
        setMovies(mockMovies)
        setSeries(mockSeries)
        setChannels(mockChannels)
        setVodCategories(mockVodCategories)
        setSeriesCategories(mockSeriesCategories)
        setLiveCategories(mockLiveCategories)
      }
    }

    // Load mock watch history
    mockWatchHistory.forEach((item) => {
      addToHistory(item)
    })

    // Get recently watched items after loading history
    setTimeout(() => {
      setRecentlyWatched(getRecentlyWatched(6))
    }, 0)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolling(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const trendingMovies = movies.slice(0, 8)
  const newMovies = movies.slice(0, 6)
  const topChannels = channels.slice(0, 8)
  const trendingSeries = series.slice(0, 8)

  const NavigationCard = ({
    icon: Icon,
    title,
    description,
    onClick,
    count,
  }: {
    icon: any
    title: string
    description: string
    onClick: () => void
    count: number
  }) => (
    <button
      onClick={onClick}
      className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-red-600/50 transition-all duration-200 hover:scale-105 text-left overflow-hidden"
    >
      <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <Icon className="w-8 h-8 text-red-600 mb-3" />
        <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
        <div className="mt-4 text-xs text-gray-500">{count} itens</div>
      </div>
    </button>
  )

  const CarouselSection = ({
    title,
    subtitle,
    icon: Icon,
    items,
    renderItem,
    onViewMore,
    badge,
  }: {
    title: string
    subtitle?: string
    icon?: any
    items: any[]
    renderItem: (item: any) => React.ReactNode
    onViewMore: () => void
    badge?: 'novo' | 'trending'
  }) => (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-6 h-6 text-red-600" />}
            <h2 className="text-2xl font-bold text-white">{title}</h2>
          </div>
          {badge === 'novo' && (
            <span className="flex items-center gap-1 px-3 py-1 bg-green-600/20 border border-green-600/50 rounded-full text-xs text-green-400">
              <Sparkles className="w-3 h-3" />
              Novo
            </span>
          )}
          {badge === 'trending' && (
            <span className="flex items-center gap-1 px-3 py-1 bg-red-600/20 border border-red-600/50 rounded-full text-xs text-red-400">
              <TrendingUp className="w-3 h-3" />
              Tendência
            </span>
          )}
        </div>
        <button
          onClick={onViewMore}
          className="text-red-600 hover:text-red-500 font-semibold text-sm transition-colors flex items-center gap-1"
        >
          Ver mais <span className="text-lg">→</span>
        </button>
      </div>
      {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}

      {items.length > 0 ? (
        <Carousel>
          {items.map((item) => (
            <div key={item.id} className="w-64 flex-shrink-0">
              {renderItem(item)}
            </div>
          ))}
        </Carousel>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhum conteúdo disponível</p>
        </div>
      )}
    </section>
  )


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Hero Banner */}
      <div className="w-full bg-no-repeat bg-right" style={{ backgroundImage: 'url(/icons.png)' }}>
        <div className="relative h-96 bg-gradient-to-r from-red-600/40 via-transparent to-transparent overflow-hidden flex items-center p-8 mb-16">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent opacity-50" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <h2 className="text-5xl font-bold text-white mb-4">Comece a Assistir</h2>
            <p className="text-gray-300 text-lg mb-6 max-w-2xl">
              Acesse seus filmes, séries e canais favoritos em qualquer lugar
            </p>
            <button
              onClick={() => navigate('/movies')}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-red-600/50"
            >
              <Play className="w-5 h-5 fill-current" />
              Explorar Conteúdo
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 space-y-16 pb-16">
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner />
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4 mb-6">
            <p className="text-red-400">Erro ao carregar conteúdo: {error}</p>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Navigation Cards */}
            {/* <div>
          <h2 className="text-2xl font-bold text-white mb-6">Navegação Rápida</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <NavigationCard
              icon={Film}
              title="Filmes"
              description="Assista seus filmes favoritos"
              onClick={() => navigate('/movies')}
              count={movies.length}
            />
            <NavigationCard
              icon={Tv2}
              title="Séries"
              description="Maratonas completas"
              onClick={() => navigate('/series')}
              count={series.length}
            />
            <NavigationCard
              icon={Radio}
              title="TV ao Vivo"
              description="Canais em tempo real"
              onClick={() => navigate('/live')}
              count={channels.length}
            />
            <NavigationCard
              icon={Heart}
              title="Favoritos"
              description="Seus conteúdos salvos"
              onClick={() => navigate('/favorites')}
              count={0}
            />
          </div>
        </div> */}

            {/* Continue Watching */}
            {recentlyWatched.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
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
                    let streamUrl = ''
                    if (item.type === 'movie' && 'streamUrl' in item.content) {
                      streamUrl = item.content.streamUrl
                    } else if (item.type === 'channel' && 'streamUrl' in item.content) {
                      streamUrl = item.content.streamUrl
                    } else if (item.type === 'series' && 'seasons' in item.content && item.content.seasons[0]?.episodes[0]) {
                      streamUrl = item.content.seasons[0].episodes[0].streamUrl
                    }

                    return (
                      <div key={item.id} className="w-80 flex-shrink-0">
                        <ContinueWatchingCard
                          item={item}
                          onPlay={() => {
                            if (item.type === 'movie') {
                              navigate('/player', {
                                state: { movieId: item.id, streamUrl },
                              })
                            } else if (item.type === 'series') {
                              navigate('/player', {
                                state: { seriesId: item.id, streamUrl },
                              })
                            } else {
                              navigate('/player', {
                                state: { channelId: item.id, streamUrl },
                              })
                            }
                          }}
                        />
                      </div>
                    )
                  })}
                </Carousel>
              </section>
            )}

            {/* Trending Movies */}
            {trendingMovies.length > 0 && (
              <CarouselSection
                title="Filmes em Tendência"
                subtitle="Os filmes mais assistidos neste mês"
                icon={TrendingUp}
                items={trendingMovies}
                badge="trending"
                renderItem={(movie) => <MovieCard movie={movie} />}
                onViewMore={() => navigate('/movies')}
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
                renderItem={(movie) => <MovieCard movie={movie} />}
                onViewMore={() => navigate('/movies')}
              />
            )}

            {/* Live Channels */}
            {topChannels.length > 0 && (
              <CarouselSection
                title="Canais ao Vivo"
                subtitle="Seus canais favoritos em tempo real"
                icon={Tv2}
                items={topChannels}
                renderItem={(channel) => <ChannelCard channel={channel} />}
                onViewMore={() => navigate('/live')}
              />
            )}

            {/* Trending Series */}
            {trendingSeries.length > 0 && (
              <CarouselSection
                title="Séries Populares"
                subtitle="Acompanhe as séries mais assistidas"
                icon={Tv2}
                items={trendingSeries}
                badge="trending"
                renderItem={(s) => <SeriesCard series={s} />}
                onViewMore={() => navigate('/series')}
              />
            )}

            {/* Empty State */}
            {trendingMovies.length === 0 && topChannels.length === 0 && trendingSeries.length === 0 && (
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
  )
}
