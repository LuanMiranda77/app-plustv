import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChannelCard } from '../components/Cards/ChannelCard'
import { Input } from '../components/UI/Input'
import { useContentStore } from '../store/contentStore'

export const Live = () => {
  const navigate = useNavigate()
  const { channels, liveCategories } = useContentStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredChannels = channels.filter((channel) => {
    const matchesSearch =
      channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      channel.category_id?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || channel.category_id === selectedCategory

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
            <h1 className="text-3xl font-bold text-white">TV ao Vivo</h1>
          </div>

          {/* Search */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Buscar canais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {liveCategories.length > 0 && (
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
              {liveCategories.map((cat) => (
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
        {filteredChannels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-1 gap-1">
            {filteredChannels.map((channel) => (
              <ChannelCard
                key={channel.num}
                channel={channel}
                onPlay={() => {
                  navigate('/player', {
                    state: {
                      stream_id: channel.stream_id,
                      title: channel.name,
                      poster: channel.stream_icon,
                      type: channel.stream_type,
                      extension: 'm3u8',
                    },
                  })
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">Nenhum canal encontrado</p>
          </div>
        )}
      </div>
    </div>
  )
}
