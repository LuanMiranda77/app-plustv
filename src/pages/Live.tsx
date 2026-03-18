/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChannelCard } from '../components/Cards/ChannelCard';
import { VideoPlayer } from '../components/Player/VideoPlayer';
import { Input } from '../components/UI/Input';
import { useContentStore } from '../store/contentStore';

export const Live = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { channels, liveCategories } = useContentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentStream, setCurrentStream] = useState<any | null>(null);

  const filteredChannels = channels.filter((channel) => {
    const matchesSearch =
      channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      channel.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || channel.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    const state = location.state as any;
    if (state) {
      setCurrentStream(state);
      setSelectedCategory(state.category || null);
      console.log(`cd-${state.id}`);
      console.log(document.getElementById(`cd-${state.id}`));
      document.getElementById(`cd-${state.id}`)?.focus();
      document.getElementById(state.id)?.click();
    } else {
      setCurrentStream(null);
    }
  }, [location]);

  return (
    <div className="max-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="flex mt-[60px] max-h-[calc(100vh-60px)]">
        {/* Filters */}
        {liveCategories.length > 0 && (
          <div className="w-3/12 max-w-[300px] border-gray-800 w-border-b bg-gray-900/50 overflow-y-scroll pt-4">
            <div className="px-3 py-4 mx-auto max-w-7xl">
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
                    onClick={() => {
                      setCurrentStream(null);
                      setSelectedCategory(cat.id);
                    }}
                    className={`text-left px-4 py-2 rounded-tl-full rounded-bl-full text-lg max-md:text-xs font-semibold whitespace-nowrap transition-colors ${
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
        <div
          className={`flex-1 px-3 py-8 overflow-y-scroll`}
        >
          <div className="flex-1 mb-5">
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
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredChannels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  id={channel.id}
                  channel={channel}
                  onPlay={() => {
                    if (Boolean(currentStream) == false || currentStream.id !== channel.id) {
                      setCurrentStream({
                        id: channel.id,
                        streamUrl: channel.streamUrl,
                        title: channel.name,
                        poster: channel.logo,
                        type: 'live',
                        category: channel.category,
                      });
                    } else {
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
                    }
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
        {currentStream && (
          <div className="w-3/12 max-w-[700px] t-[30px]">
            <div className="flex flex-col items-center justify-center flex-1 border-6 border-gray-950 rounded-lg mx-4">
              <div className="w-full text-2xl max-md:text-sm font-semibold line-clamp-1 bg-netflix-red">
                Preview
              </div>
              <VideoPlayer
                title={currentStream.title}
                source={currentStream.streamUrl}
                poster={currentStream.poster}
                autoPlay
                isControlsVisible={false}
                onError={(error) => {
                  console.error('Erro no player:', error);
                }}
              />
            </div>
            <div></div>
          </div>
        )}
      </div>
    </div>
  );
};
