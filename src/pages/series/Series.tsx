import { Heart } from 'lucide-react';
import { Fragment } from 'react';
import { StreamPoster } from '../../components/Cards/StreamPoster';
import ButtonCategory from '../../components/UI/ButtonCategory';
import { Input } from '../../components/UI/Input';
import { Modal } from '../../components/UI/Modal';
import { useSeriesPage } from '../../hooks/useSeriesPage';
import { DetailSeries } from './DetailSeries';

export const PageSeries = () => {
  const {
    // Busca e filtros
    searchTerm,
    setSearchTerm,
    selectedCategory,
    isDetail,

    // Série atual
    currentSerie,
    // setCurrentSerie,

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
    setFocusedInput,

    // Dados
    categoriesWithAll,
    filteredSeries,
    displayedSeries,
    hasMoreSeries,
    isLoadingMore,
    // isAdultUnlocked,

    // Funções
    handleNavigate,
    handleCategoryClick,
    handleInputKeyDown,
    handleClose
  } = useSeriesPage();

  return (
    <Fragment>
      <Modal open={isDetail} onClose={handleClose} disableBackGuard>
        <DetailSeries currentSerie={currentSerie} onClose={handleClose} />
      </Modal>
      <div className="max-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="flex mt-15 h-[calc(100vh-60px)]">
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
                      name={cat.name}
                      isSelected={selectedCategory === (cat.id as any)}
                      isFocused={isZoneCat && focusedCat === i}
                      icon={
                        cat.id === '-1' ? (
                          <Heart className="w-6 h-6 max-md:w-6 max-md:h-4 text-white-600 fill-white" />
                        ) : undefined
                      }
                      onClick={() => handleCategoryClick(cat.id as any)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Grid de séries ───────────────────────────────────────────────── */}
          <div ref={gridRef} className="flex-1 mx-auto px-6 py-8 overflow-y-scroll">
            {/* Busca */}
            <div className={`flex-1 mb-5 `}>
              <Input
                ref={inputRef}
                type="text"
                placeholder="Buscar séries..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onFocus={() => setFocusedInput(true)}
                onBlur={() => setFocusedInput(false)}
                onKeyDown={handleInputKeyDown}
              />
            </div>

            {filteredSeries.length > 0 ? (
              <div
                key={selectedCategory ?? 'all'}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
              >
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
    </Fragment>
  );
};
