import { Heart } from 'lucide-react';
import { StreamPoster } from '../components/Cards/StreamPoster';
import ButtonCategory from '../components/UI/ButtonCategory';
import { Input } from '../components/UI/Input';
import { useSeriesPage } from '../hooks/useSeriesPage';

export const PageSeries = () => {
  const {
    // Busca e filtros
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,

    // Série atual
    // currentSerie,

    // Refs
    loadMoreRef,
    gridRef,
    categoriesRef,
    inputRef,

    // Foco
    isZoneCat,
    isZoneList,
    focusedCat,
    focusedIndex,
    focusedInput,
    setFocusedInput,

    // Dados
    categoriesWithAll,
    filteredSeries,
    displayedSeries,
    hasMoreSeries,
    isLoadingMore,

    // Funções
    handleNavigate,
  } = useSeriesPage();

  return (
    <div className="max-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="flex mt-[60px] h-[calc(100vh-60px)]">
        {/* ── Categorias ───────────────────────────────────────────────────── */}
        {categoriesWithAll.length > 0 && (
          <div
            ref={categoriesRef}
            className="w-3/12 max-md:w-4/12 border-b border-gray-800 bg-gray-900/50 sticky top-20 overflow-y-scroll pt-4"
          >
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex flex-col gap-2 pb-2">
                {categoriesWithAll.map((cat, i) => (
                  <ButtonCategory
                    key={cat.id || 'all'}
                    id={String(cat.id || '-2')}
                    name={cat.name.replace('SÉRIES |', '')}
                    isSelected={selectedCategory === (cat.id as any)}
                    isFocused={isZoneCat && focusedCat === i}
                    icon={
                      cat.id === '-1' ? (
                        <Heart className="w-6 h-6 max-md:w-6 max-md:h-4 text-white-600 fill-white" />
                      ) : undefined
                    }
                    onClick={() => setSelectedCategory(cat.id as any)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Grid de séries ───────────────────────────────────────────────── */}
        <div ref={gridRef} className="flex-1 mx-auto px-6 py-8 overflow-y-scroll">
          {/* Busca */}
          <div className={`flex-1 mb-5 ${focusedInput ? 'ring-2 ring-red-600' : ''}`}>
            <Input
              ref={inputRef}
              type="text"
              placeholder="Buscar séries..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onFocus={() => setFocusedInput(true)}
              onBlur={() => setFocusedInput(false)}
            />
          </div>

          {filteredSeries.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {displayedSeries.map((s, i) => (
                <StreamPoster
                  key={s.id}
                  stream={s}
                  isFocused={isZoneList && focusedIndex === i}
                  onPlay={() => handleNavigate(s)}
                />
              ))}

              {/* Sentinel — infinite scroll */}
              <div ref={loadMoreRef} className="col-span-full py-4">
                {hasMoreSeries && isLoadingMore && (
                  <div className="flex justify-center">
                    <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {!hasMoreSeries && displayedSeries.length > 0 && (
                  <p className="text-center text-gray-500 text-sm">Fim da lista</p>
                )}
              </div>
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
}
