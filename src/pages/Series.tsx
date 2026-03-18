import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SeriesCard } from '../components/Cards/SeriesCard';
import { Input } from '../components/UI/Input';
import SeriesDetail from '../components/UI/SeriesDetail';
import { useAuthStore } from '../store/authStore';
import { useContentStore } from '../store/contentStore';
import type { Season, Series } from '../types';
import { xtreamApi } from '../utils/xtreamApi';

export const PageSeries = () => {
  const { series, seriesCategories } = useContentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { serverConfig } = useAuthStore();
  const [currentSerie, setCurrentSerie] = useState<Series | null>(null);

  // 2. Só busca episódios quando o usuário ABRE a série
  const loadSeriesDetail = async (seriesId: string) => {
    const data = await xtreamApi.getSeriesInfo(serverConfig!, seriesId);
    const episodesMap = data.episodes as Record<string, any[]>;
    const seasons: Season[] = Object.entries(episodesMap)
      .map(([seasonNum, episodes]) => ({
        number: Number(seasonNum),
        progress: 0,
        episodes: episodes.map((ep) => ({
          id: String(ep.id),
          name: ep.title || `Episódio ${ep.episode_num}`,
          number: ep.episode_num,
          streamUrl: `${serverConfig!.url}/series/${serverConfig!.username}/${serverConfig!.password}/${ep.id}.${ep.container_extension}`,
          watched: false,
          progress: 0,
          thumbnail: ep.info?.movie_image || '',
          plot: ep.info?.plot || '',
          duration: ep.info?.duration_secs || undefined,
          displayDuration: ep.info?.duration || undefined,
          rating: ep.info?.rating || '',
          airDate: ep.air_date || '',
        })),
      }))
      .sort((a, b) => a.number - b.number); // ordenar temporadas

    return seasons;
  };

  const filteredSeries = series.filter((s, index) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || s.category === selectedCategory;
    
    if (matchesCategory && matchesSearch ) {
      const ratringNum = s.rating && s.rating != 'N/A' ? Number(s.rating ?? 0) : 0;
      return index < 60 && ratringNum > 5;
    }

    return matchesSearch && matchesCategory;
  });

  // const loadInBatches = async (seriesList: Series[]) => {
  //   const batchSize = 5;
  //   for (let i = 0; i < seriesList.length; i += batchSize) {
  //     const batch = seriesList.slice(i, i + batchSize);
  //     await Promise.all(batch.map((s) => loadSeriesDetail(s.id)));
  //   }
  // };

  return currentSerie ? (
    <SeriesDetail
      series={currentSerie}
      onBack={() => setCurrentSerie(null)}
      onToggleFavorite={(id) => toggleFavorite(id)}
      onToggleWatched={(id) => toggleWatched(id)}
      onLoadDetail={(id) => loadSeriesDetail(id)}
    />
  ) : (
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
                {seriesCategories.map((cat) => {
                  return (
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
                <SeriesCard key={s.id} series={s} onPlay={() => setCurrentSerie(s)} />
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
