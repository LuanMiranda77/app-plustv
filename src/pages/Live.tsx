import { Heart } from 'lucide-react';
import { Fragment } from 'react';
import { ChannelCard } from '../components/Cards/ChannelCard';
import { VideoPlayer } from '../components/Player/VideoPlayer';
import ButtonCategory from '../components/UI/ButtonCategory';
import { EpgList } from '../components/UI/EpgList';
import { Input } from '../components/UI/Input';
import RemoteHint from '../components/UI/RemoteHint';
import { useLivePage } from '../hooks/useLivePage';

export const Live = () => {
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    currentStream,
    isFullScreen,
    setIsFullScreen,
    epgList,
    isLoadingEpg,
    loadMoreRef,
    gridRef,
    categoriesRef,
    inputRef,
    // epgRef,
    isMobile,
    isZoneCat,
    isZoneList,
    isZoneEpg,
    focusedCat,
    focusedIndex,
    focusedEpgIndex,
    setFocusedInput,
    categoriesWithAll,
    filteredChannels,
    displayedChannels,
    hasMoreChannels,
    isLoadingMore,
    setlectLiveIndex,
    handleInputKeyDown,
    handlePlayStream,
    navigateLive,
    isAdultUnlocked,
    handleFavoriteToggle,
    isFavorite,
  } = useLivePage();

  return (
    <div className="max-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="flex mt-[60px] h-[calc(100vh-60px)]">
        {/* ── Categorias ───────────────────────────────────────────────────── */}
        {categoriesWithAll.length > 0 && (
          <div
            ref={categoriesRef}
            className="w-3/12 max-md:w-4/12 max-w-[400px] border-gray-800 w-border-b bg-gray-900/50 overflow-y-scroll pt-4"
          >
            <div className="px-3 py-4 mx-auto max-w-7xl">
              <div className="flex flex-col gap-2 pb-2">
                {categoriesWithAll
                  .filter(item => {
                    if (isAdultUnlocked) return item;
                    if (!item.name.toUpperCase().includes('ADULTO')) return item;
                  })
                  .map((cat, i) => (
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
                      onClick={() => setSelectedCategory(cat.id as any)}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Grid de canais ───────────────────────────────────────────────── */}
        <div ref={gridRef} className="flex-1 px-4 py-8 overflow-y-scroll overflow-x-none">
          {/* Busca */}
          <div className="flex-1 mb-5">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Buscar canais..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onFocus={() => setFocusedInput(true)}
              onBlur={() => setFocusedInput(false)}
              onKeyDown={handleInputKeyDown}
            />
          </div>

          {filteredChannels.length > 0 ? (
            <div className="grid gap-4 grid-cols-1">
              {displayedChannels.map((channel, i) => (
                <ChannelCard
                  key={channel.id}
                  id={channel.id}
                  channel={channel}
                  isFocused={isZoneList && focusedIndex === i}
                  setlected={setlectLiveIndex === channel.id}
                  onFavoriteToggle={handleFavoriteToggle}
                  isFav={isFavorite(String(channel.id))}
                  onPlay={() => {
                    if (!isMobile && (!currentStream || currentStream.id !== channel.id)) {
                      handlePlayStream(channel);
                    } else if (isMobile) {
                      navigateLive(channel);
                    } else {
                      setIsFullScreen(true);
                    }
                  }}
                />
              ))}

              {/* Sentinel — infinite scroll */}
              <div ref={loadMoreRef} className="col-span-full py-4">
                {hasMoreChannels && isLoadingMore && (
                  <div className="flex justify-center">
                    <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {!hasMoreChannels && displayedChannels.length > 0 && (
                  <p className="text-center text-gray-500 text-sm">Fim da lista</p>
                )}
              </div>
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-lg text-gray-400">Nenhum canal encontrado</p>
            </div>
          )}
        </div>

        {/* ── Player + EPG ─────────────────────────────────────────────────── */}
        {!isMobile && (
          <div
            className={`
              flex flex-col items-center
              ${
                isFullScreen
                  ? 'fixed inset-0 z-50 bg-black'
                  : 'w-5/12 max-w-[1000px] relative mt-[35px] mx-4'
              }
            `}
          >
            {!isFullScreen && (
              <div className="w-full text-2xl max-md:text-sm font-semibold line-clamp-1 bg-netflix-red">
                {currentStream
                  ? ` Canal - ${currentStream.name}`
                  : 'Escolha um canal para assistir'}
              </div>
            )}

            {currentStream ? (
              <VideoPlayer
                title={currentStream?.name || ''}
                source={currentStream ? currentStream.streamUrl : ''}
                poster={currentStream?.logo}
                autoPlay
                isControlsVisible
                onError={error => console.error('Erro no player:', error)}
                streamId={currentStream?.id}
                type="live"
                onBack={() => setIsFullScreen(false)}
                epgList={epgList ? epgList.slice(0, 2) : []} // ← passar só os próximos 5 programas para o player
              />
            ) : (
              <div className="w-full aspect-video bg-zinc-900 flex items-center justify-center rounded-xl">
                <p className="text-zinc-500 text-3xl max-md:text-sm">Nenhum canal selecionado</p>
              </div>
            )}

            {!isFullScreen && (
              <Fragment>
                <section className="flex flex-col gap-4 w-full max-w-7xl mt-4">
                  <div className="border-b border-gray-800 text-2xl font-semibold line-clamp-1 pb-2">
                    <h4>Funções dos botão</h4>
                  </div>
                  <div className="flex items-center text-2xl">
                    <RemoteHint color="yellow" label="Favoritar canal" />
                  </div>
                </section>

                <EpgList
                  // ref={epgRef}
                  epgList={epgList}
                  isZoneEpg={isZoneEpg}
                  focusedEpgIndex={focusedEpgIndex}
                  isLoadingEpg={isLoadingEpg}
                />
              </Fragment>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
