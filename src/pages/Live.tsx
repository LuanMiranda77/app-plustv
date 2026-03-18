import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChannelCard } from '../components/Cards/ChannelCard';
import { Input } from '../components/UI/Input';
import { useContentStore } from '../store/contentStore';

export const Live = () => {
  const navigate = useNavigate();
  const { channels, liveCategories } = useContentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredChannels = channels.filter((channel) => {
    const matchesSearch =
      channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      channel.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || channel.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="flex mt-[60px] max-h-[calc(100vh-60px)]">
        {/* Filters */}
        {liveCategories.length > 0 && (
          <div className="w-3/12 border-gray-800 w-border-b bg-gray-900/50 overflow-y-scroll pt-4">
            <div className="px-6 py-4 mx-auto max-w-7xl">
              <div className="flex flex-col gap-2 pb-2 overflow-x-auto">
                {/* <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${selectedCategory === null
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                >
                  Todos
                </button> */}
                {liveCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-left px-4 py-2 rounded-tl-full rounded-bl-full text-lg font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {cat.name.replace('CANAIS |', '')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="w-9/12 px-6 py-8 overflow-y-scroll">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Buscar canais..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={liveCategories.length === 0 || !selectedCategory}
            />
          </div>
          {!selectedCategory ? (
            <div className="flex justify-center items-center opacity-30">
              <img src="/icons.png" />
            </div>
          ) : filteredChannels.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2">
              {filteredChannels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  onPlay={() => {
                    navigate('/player', {
                      state: {
                        streamUrl: channel.streamUrl,
                        title: channel.name,
                        poster: channel.logo,
                        type: 'live',
                        extension: 'm3u8',
                      },
                    });
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-lg text-gray-400">Nenhum canal encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
