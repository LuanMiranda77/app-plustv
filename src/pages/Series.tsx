import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SeriesCard } from '../components/Cards/SeriesCard'
import { Input } from '../components/UI/Input'
import { useContentStore } from '../store/contentStore'

export const Series = () => {
  const navigate = useNavigate()
  const { series, seriesCategories } = useContentStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredSeries = series.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || s.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 sticky top-0 z-40 bg-gray-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/home')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-3xl font-bold text-white">Séries</h1>
          </div>

          {/* Search */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Buscar séries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {seriesCategories.length > 0 && (
        <div className="border-b border-gray-800 bg-gray-900/50 sticky top-20 z-30">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === null
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Todos
              </button>
              {seriesCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat.name
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredSeries.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredSeries.map((s) => (
              <SeriesCard
                key={s.id}
                series={s}
                onPlay={() => {
                  // Play first episode
                  const firstEpisode = s.seasons?.[0]?.episodes?.[0]
                  if (firstEpisode) {
                    navigate('/player', {
                      state: {
                        streamUrl: firstEpisode.streamUrl,
                        title: `${s.name} - ${firstEpisode.name}`,
                        poster: s.poster,
                        type: 'series',
                      },
                    })
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">Nenhuma série encontrada</p>
          </div>
        )}
      </div>
    </div>
  )
}
