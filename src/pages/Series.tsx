import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SeriesCard } from '../components/Cards/SeriesCard';
import { Input } from '../components/UI/Input';
import { useContentStore } from '../store/contentStore';

export const Series = () => {
  const navigate = useNavigate();
  const { series, seriesCategories } = useContentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredSeries = series.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || s.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="flex mt-[60px] max-h-[calc(100vh-60px)]">
        {/* Filters */}
        {seriesCategories.length > 0 && (
          <div className="w-3/12 border-b border-gray-800 bg-gray-900/50 sticky top-20 overflow-y-scroll pt-4">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex flex-col gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`text-left px-4 py-2 rounded-tl-full rounded-bl-full text-lg font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === null
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  30 MELHORES
                </button>
                {seriesCategories.map((cat, i) => {
                  const isNew = i < 30;
                  const isVisible = selectedCategory ? true : selectedCategory === null && isNew;
                  return (
                    isVisible && (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`text-left px-4 py-2 rounded-tl-full rounded-bl-full text-lg font-semibold whitespace-nowrap transition-colors ${
                          selectedCategory === cat.name
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {cat.name}
                      </button>
                    )
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="w-9/12 max-w-7xl mx-auto px-6 py-8 overflow-y-scroll">
          <div className="flex-1 mb-5">
            <Input
              type="text"
              placeholder="Buscar séries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {filteredSeries.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredSeries.map((s) => (
                <SeriesCard
                  key={s.id}
                  series={s}
                  onPlay={() => {
                    // Play first episode
                    const firstEpisode = s.seasons?.[0]?.episodes?.[0];
                    if (firstEpisode) {
                      navigate('/player', {
                        state: {
                          streamUrl: firstEpisode.streamUrl,
                          title: `${s.name} - ${firstEpisode.name}`,
                          poster: s.poster,
                          type: 'series',
                        },
                      });
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
    </div>
  );
};
