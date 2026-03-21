import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChannelCard } from '../components/Cards/ChannelCard';
import { MovieCard } from '../components/Cards/MovieCard';
import { SeriesCard } from '../components/Cards/SeriesCard';
import ButtonCategory from '../components/UI/ButtonCategory';
import { Input } from '../components/UI/Input';
import { useFocusZone } from '../Context/FocusContext';
import { useRemoteControl } from '../hooks/useRemotoControl';
import { useFavoritesStore } from '../store/favoritesStore';

export const Favorites = () => {
  const navigate = useNavigate();
  const { getFavoritesByType } = useFavoritesStore();
  const { activeZone, setActiveZone } = useFocusZone();
  const [focusedCat, setFocusedCat] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>('1');
  const [focusedInput, setFocusedInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isZoneCat = activeZone === 'content';
  const isZoneList = activeZone === 'list';

  const favoriteChannels = getFavoritesByType('live').map(item => ({
    ...item,
    category_fav: '1'
  }));
  const favoriteMovies = getFavoritesByType('movie').map(item => ({
    ...item,
    category_fav: '2'
  }));
  const favoriteSeries = getFavoritesByType('series').map(item => ({
    ...item,
    category_fav: '3'
  }));
  const combinedList = favoriteChannels.concat(favoriteMovies, favoriteSeries);

  const favoriteCategories = [
    {
      id: '1',
      name: 'CANAIS'
    },
    {
      id: '2',
      name: 'FILMES'
    },
    {
      id: '3',
      name: 'SÉRIES'
    }
  ] as any[];

  const filteredSeries = combinedList.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category_fav?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || s.category_fav == selectedCategory;

    return matchesSearch && matchesCategory;
  });

  useRemoteControl({
    onRight: () => {
      if (isZoneCat) {
        setActiveZone('list');
        setFocusedIndex(0);
        setFocusedInput(false);
      }
      // Navegar direita dentro da lista (mesma linha)
      if (isZoneList && selectedCategory !== '1') {
        const column = focusedIndex % 5; // 5 colunas para filmes/séries
        const isLastColumn = column === 4;
        if (!isLastColumn && focusedIndex < filteredSeries.length - 1) {
          setFocusedIndex(focusedIndex + 1);
        }
      }
    },
    onLeft: () => {
      if (isZoneList) {
        // Para canais (1 coluna), volta direto
        if (selectedCategory === '1') {
          setActiveZone('content');
          setFocusedCat(0);
        } else {
          // Para filmes/séries (5 colunas)
          const column = focusedIndex % 5;
          const isFirstColumn = column === 0;
          if (isFirstColumn) {
            setActiveZone('content');
            setFocusedCat(0);
          } else {
            setFocusedIndex(focusedIndex - 1);
          }
        }
      }
    },
    onDown: () => {
      if (focusedInput) {
        setFocusedInput(false);
        setFocusedIndex(0);
        return;
      }
      if (isZoneCat && focusedCat < favoriteCategories.length) {
        setFocusedCat(Math.min(focusedCat + 1, favoriteCategories.length));
      }
      if (isZoneList && focusedIndex < filteredSeries.length - 1) {
        setFocusedIndex(
          Math.min(focusedIndex + (selectedCategory == '1' ? 1 : 5), filteredSeries.length - 1)
        );
      }
    },
    onUp: () => {
      if (focusedInput) {
        setFocusedInput(false);
        inputRef.current?.blur();
        setActiveZone('menu');
        return;
      }
      if (isZoneCat && focusedCat === 0) {
        setActiveZone('menu');
      } else if (isZoneCat && focusedCat > 0) {
        setFocusedCat(Math.max(focusedCat - 1, 0));
      }
      if (isZoneList) {
        if (selectedCategory === '1') {
          // Para canais (1 coluna)
          if (focusedIndex === 0) {
            setFocusedIndex(-1);
            setFocusedInput(true);
            setTimeout(() => inputRef.current?.focus(), 0);
            gridRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (focusedIndex > 0) {
            setFocusedIndex(focusedIndex - 1);
          }
        } else {
          // Para filmes/séries (5 colunas)
          if (focusedIndex >= 0 && focusedIndex < 5) {
            setFocusedIndex(-1);
            setFocusedInput(true);
            setTimeout(() => inputRef.current?.focus(), 0);
            gridRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (focusedIndex > 0) {
            setFocusedIndex(Math.max(focusedIndex - 5, 0));
          }
        }
      }
    },
    onOk: () => {
      if (isZoneCat) {
        setSelectedCategory(filteredSeries[focusedCat]?.id || null);
      }
      if (isZoneList) {
        //  setIsFullScreen(true);
      }
    },
    onBack: () => {
      if (isZoneList || isZoneCat) {
        setActiveZone('menu'); // ← volta para categorias
        return;
      }
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="flex mt-[60px] h-[calc(100vh-60px)]">
        {/* Filters */}
        {favoriteCategories.length > 0 && (
          <div className="w-3/12 max-md:w-4/12 border-b border-gray-800 bg-gray-900/50 sticky top-20 overflow-y-scroll pt-4">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex flex-col gap-2 pb-2">
                {favoriteCategories.map((cat, i) => {
                  return (
                    <ButtonCategory
                      key={cat.id}
                      id={cat.id}
                      name={cat.name}
                      isSelected={selectedCategory === cat.id}
                      isFocused={focusedCat === i}
                      onClick={() => setSelectedCategory(cat.id)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="flex-1 mx-auto px-6 py-8 overflow-y-scroll">
          <div className={`flex-1 mb-5 ${focusedInput ? 'ring-2 ring-red-600' : ''}`}>
            <Input
              ref={inputRef}
              type="text"
              placeholder="Buscar séries..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          {filteredSeries.length > 0 && selectedCategory != '1' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredSeries.map((stream, i) => {
                if (stream.category_fav === '2') {
                  return (
                    <MovieCard
                      key={stream.id}
                      movie={stream as any}
                      isFocused={activeZone === 'content' && focusedIndex === i}
                      onPlay={() => {
                        navigate('/player', {
                          state: {
                            id: stream.id,
                            streamUrl: stream.streamUrl,
                            title: stream.name,
                            poster: stream.poster,
                            type: 'movie',
                            category: stream.category
                          }
                        });
                      }}
                    />
                  );
                }
                if (stream.category_fav === '3') {
                  return (
                    <SeriesCard
                      key={stream.id}
                      series={stream as any}
                      isFocused={activeZone === 'content' && focusedIndex === i}
                      onPlay={() => {
                        navigate('/series', {
                          state: {
                            id: stream.id,
                            streamUrl: stream.streamUrl,
                            title: stream.name,
                            poster: stream.poster,
                            type: 'series',
                            category: stream.category
                          }
                        });
                      }}
                    />
                  );
                }
              })}
            </div>
          ) : selectedCategory == '1' ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredSeries.map((stream, i) => {
                return (
                  <ChannelCard
                    key={stream.id}
                    channel={stream as any}
                    isFocused={activeZone === 'content' && focusedIndex === i}
                    onPlay={() => {
                      navigate('/player', {
                        state: {
                          id: stream.id,
                          streamUrl: stream.streamUrl,
                          title: stream.name,
                          poster: stream.logo,
                          type: 'live',
                          category: stream.category
                        }
                      });
                    }}
                  />
                );
              })}
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
