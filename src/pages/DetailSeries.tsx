import EpisodeCard from '../components/Cards/EpisodeCard';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import SeasonSelector from '../components/UI/SeasonSelector';
import SeriesHeroBanner from '../components/UI/SeriesHeroBanner';
import { useSeriesDetail } from '../hooks/useDetailSeries';

export const DetailSeries = () => {
  const {
    // Estado da UI
    activeSeason,
    setActiveSeason,
    seasons,
    loading,
    showTrailer,
    focusedButton,
    series,

    // Episódios
    currentEpisodes,
    currentEpisode,
    selectedEpisodeIndex,

    // Progresso
    watched,
    total,
    percent,

    // Próximo episódio
    nextEpisode,

    // Ações
    handlePlay,
    handlePlayNext,
    scrollToEpisodes,
    handleToggleFavorite,
    handleBack,
    handleToggleWatched,
    setShowTrailer,

    // Refs
    episodesRef,
    pageRef
  } = useSeriesDetail();

  return (
    series && (
      <div
        ref={pageRef}
        className="absolute top-0 max-h-[calc(100vh-60px)] bg-zinc-950 text-white w-full overflow-y-auto"
        style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
      >
        <SeriesHeroBanner
          series={series}
          seasons={seasons}
          total={total}
          percent={percent}
          nextEpisode={nextEpisode}
          currentEpisodeId={currentEpisode?.id}
          onBack={handleBack}
          onPlayNext={handlePlayNext}
          onToggleFavorite={handleToggleFavorite}
          onScrollToEpisodes={scrollToEpisodes}
          focusedButton={focusedButton}
          showTrailer={showTrailer}
          onSetShowTrailer={setShowTrailer}
        />
        {/* ── Episódios ─────────────────────────────────────────────────────────── */}
        <div ref={episodesRef} className="px-6 md:px-14 py-8">
          {/* Header da seção */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h2
                className="text-2xl font-bold text-white mb-1"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              >
                Episódios
              </h2>
              {total > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${percent === 100 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-zinc-500 text-sm">
                    {watched}/{total} assistidos
                  </span>
                </div>
              )}
            </div>

            {/* Season Selector */}
            {seasons.length > 0 && (
              <SeasonSelector
                seasons={seasons}
                activeSeason={activeSeason}
                onSeasonChange={setActiveSeason}
                currentEpisodeId={currentEpisode?.id}
              />
            )}
          </div>

          {/* Lista de episódios */}
          {loading ? (
            <LoadingSpinner message="Carregando episódios..." />
          ) : currentEpisodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-600">
              <svg
                className="w-12 h-12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="2" y="7" width="20" height="15" rx="2" />
                <path d="M16 3l-4 4-4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm">Nenhum episódio encontrado</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2" data-episodes-container>
              {currentEpisodes.map((episode, index) => (
                <div key={episode.id} data-episode-index={index}>
                  <EpisodeCard
                    episode={episode}
                    seasonNumber={activeSeason}
                    onPlay={ep => handlePlay(ep, activeSeason)}
                    onToggleWatched={handleToggleWatched}
                    isActive={episode.id === currentEpisode?.id || index === selectedEpisodeIndex}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  );
};
