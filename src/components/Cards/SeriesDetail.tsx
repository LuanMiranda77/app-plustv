import { useState, useEffect, useRef } from 'react';
import type { Episode, Season, Series } from '../../types';
import SeasonSelector from './SeasonSelector';
import EpisodeCard from './EpisodeCard';
import { ArrowLeft } from 'lucide-react';

interface SeriesDetailProps {
  series: Series | null;
  onPlay: (episode: Episode, seasonNumber: number) => void;
  onBack: () => void;
  onToggleFavorite?: (seriesId: string) => void;
  onToggleWatched?: (episodeId: string) => void;
  onLoadDetail?: (seriesId: string) => Promise<Season[]>;
  currentEpisodeId?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getTotalProgress = (seasons: Season[]) => {
  const allEps = seasons.flatMap((s) => s.episodes);
  if (!allEps.length) return { watched: 0, total: 0, percent: 0 };
  const watched = allEps.filter((e) => e.watched).length;
  return {
    watched,
    total: allEps.length,
    percent: Math.round((watched / allEps.length) * 100),
  };
};

const findNextEpisode = (seasons: Season[], currentEpisodeId?: string): Episode | null => {
  const allEps = seasons.flatMap((s) => s.episodes);
  if (currentEpisodeId) {
    const idx = allEps.findIndex((e) => e.id === currentEpisodeId);
    return allEps[idx + 1] ?? null;
  }
  return allEps.find((e) => !e.watched) ?? allEps[0] ?? null;
};

const findNextSeasonForEpisode = (seasons: Season[], episodeId: string): number => {
  for (const season of seasons) {
    if (season.episodes.some((e) => e.id === episodeId)) return season.number;
  }
  return 1;
};

export const SeriesDetail = ({
  series,
  onPlay,
  onBack,
  onToggleFavorite,
  onToggleWatched,
  onLoadDetail,
  currentEpisodeId,
}: SeriesDetailProps) => {
  const [activeSeason, setActiveSeason] = useState(1);
  const [seasons, setSeasons] = useState<Season[]>(series?.seasons || []);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showFullPlot, setShowFullPlot] = useState(false);
  const episodesRef = useRef<HTMLDivElement>(null);
  const { watched, total, percent } = getTotalProgress(seasons);
  const nextEpisode = findNextEpisode(seasons, currentEpisodeId);
  const nextSeasonNumber = nextEpisode ? findNextSeasonForEpisode(seasons, nextEpisode.id) : 1;

  const currentEpisodes = seasons.find((s) => s.number === activeSeason)?.episodes ?? [];

  // Carregar detalhes da série
  useEffect(() => {
    if (series) {
      if (series.loaded || !onLoadDetail) return;
      setLoading(true);
      onLoadDetail(series.id)
        .then((loadedSeasons) => {
          setSeasons(loadedSeasons);
          // Ir para a temporada do episódio atual se houver
          if (currentEpisodeId) {
            const seasonNum = findNextSeasonForEpisode(loadedSeasons, currentEpisodeId);
            setActiveSeason(seasonNum);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [series?.id]);

  // Sincronizar temporada com episódio atual
  useEffect(() => {
    if (currentEpisodeId && seasons.length) {
      const num = findNextSeasonForEpisode(seasons, currentEpisodeId);
      setActiveSeason(num);
    }
  }, [currentEpisodeId]);

  const handlePlay = (episode: Episode) => {
    onPlay(episode, activeSeason);
  };

  const handlePlayNext = () => {
    if (!nextEpisode) return;
    setActiveSeason(nextSeasonNumber);
    onPlay(nextEpisode, nextSeasonNumber);
  };

  const scrollToEpisodes = () => {
    episodesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    series && (
      <div
        className="absolute top-0 max-h-[calc(100vh-60px)] bg-zinc-950 text-white w-full mt-[60px]"
        style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
      >
        {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
        <div className="relative h-[60vh] min-h-[500px] overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${series.poster})`,
              animation: 'heroFade 0.8s ease both',
              filter: imgError ? 'none' : undefined,
            }}
          />

          {/* Gradientes */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

          {/* Botão voltar */}
          <button
            onClick={onBack}
            className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 rounded
                     text-white transition-colors hover:text-red-600 hover:bg-white/10"
          >
            <ArrowLeft size={15}/>
            <span className="text-sm font-medium">Voltar</span>
          </button>

          {/* Conteúdo hero */}
          <div className="absolute inset-0 flex items-end pb-10 px-8 md:px-14">
            <div className="flex gap-8 items-end max-w-4xl w-full">
              {/* Poster */}
              <div
                className="hidden md:block flex-shrink-0 w-40 rounded-2xl overflow-hidden
                            shadow-2xl shadow-black/80 border border-white/10"
              >
                <img
                  src={series.poster}
                  alt={series.name}
                  className="w-full aspect-[2/3] object-cover"
                  onError={() => setImgError(true)}
                />
              </div>

              {/* Info */}
              <div
                className="flex-1 min-w-0"
                style={{ animation: 'fadeSlideIn 0.6s ease 0.2s both' }}
              >
                {/* Gênero badge */}
                {series.genre && (
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {series.genre
                      .split(',')
                      .slice(0, 3)
                      .map((g) => (
                        <span
                          key={g}
                          className="text-xs px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm
                                 border border-white/10 text-zinc-300"
                        >
                          {g.trim()}
                        </span>
                      ))}
                  </div>
                )}

                {/* Título */}
                <h1
                  className="text-4xl md:text-5xl font-bold leading-tight mb-3 text-white drop-shadow-lg text-left"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  {series.name}
                </h1>

                {/* Meta */}
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                  {series.year && <span className="text-zinc-400 text-sm">{series.year}</span>}
                  {series.rating && (
                    <span className="flex items-center gap-1 text-yellow-400 text-sm font-medium">
                      <svg className="w-4 h-4 fill-yellow-400" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      {series.rating}
                    </span>
                  )}
                  <span className="text-zinc-400 text-sm">
                    {seasons.length} temporada{seasons.length !== 1 ? 's' : ''}
                  </span>
                  {total > 0 && <span className="text-zinc-400 text-sm">{total} episódios</span>}
                  {percent > 0 && (
                    <span
                      className={`text-sm font-medium ${percent === 100 ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {percent === 100 ? '✓ Completo' : `${percent}% assistido`}
                    </span>
                  )}
                </div>

                {/* Plot */}
                {series.plot && (
                  <div className="mb-5 max-w-xl">
                    <p
                      className={`text-zinc-300 text-sm leading-relaxed text-justify ${showFullPlot ? '' : 'line-clamp-3'}`}
                    >
                      {series.plot}
                    </p>
                    {series.plot.length > 200 && (
                      <button
                        className="text-zinc-500 hover:text-zinc-300 text-xs mt-1 transition-colors"
                        onClick={() => setShowFullPlot(!showFullPlot)}
                      >
                        {showFullPlot ? 'Ver menos ↑' : 'Ver mais ↓'}
                      </button>
                    )}
                  </div>
                )}

                {/* Ações */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Botão principal */}
                  <button
                    onClick={handlePlayNext}
                    disabled={!nextEpisode}
                    className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm
                             bg-red-600 hover:bg-red-500 text-white transition-all duration-200
                             shadow-lg shadow-red-900/40 hover:shadow-red-900/60 hover:scale-105
                             disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    {currentEpisodeId ? 'Continuar' : 'Assistir'}
                    {nextEpisode && (
                      <span className="text-red-200 font-normal text-xs">
                        E{String(nextEpisode.number).padStart(2, '0')}
                      </span>
                    )}
                  </button>

                  {/* Favoritar */}
                  {onToggleFavorite && (
                    <button
                      onClick={() => onToggleFavorite(series.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium
                                border transition-all duration-200
                                ${
                                  series.isFavorite
                                    ? 'bg-red-950/60 border-red-600/60 text-red-400 hover:bg-red-950'
                                    : 'bg-white/10 border-white/10 text-zinc-300 hover:bg-white/20 hover:text-white'
                                }`}
                    >
                      <svg
                        className={`w-5 h-5 transition-all duration-200
                                     ${series.isFavorite ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-current'}`}
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path
                          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {series.isFavorite ? 'Favoritado' : 'Favoritar'}
                    </button>
                  )}

                  {/* Ver episódios */}
                  <button
                    onClick={scrollToEpisodes}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium
                             bg-white/10 border border-white/10 text-zinc-300
                             hover:bg-white/20 hover:text-white transition-all duration-200"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Episódios
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                currentEpisodeId={currentEpisodeId}
              />
            )}
          </div>

          {/* Lista de episódios */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin" />
              <span className="text-zinc-500 text-sm">Carregando episódios...</span>
            </div>
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
            <div className="flex flex-col gap-2">
              {currentEpisodes.map((episode, index) => (
                <EpisodeCard
                  key={episode.id}
                  episode={episode}
                  seasonNumber={activeSeason}
                  onPlay={handlePlay}
                  onToggleWatched={onToggleWatched}
                  isActive={episode.id === currentEpisodeId}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  );
};
export default SeriesDetail;
// ─── Exemplo de uso ───────────────────────────────────────────────────────────
//
// <SeriesDetail
//   series={selectedSeries}
//   currentEpisodeId={currentEpisode?.id}
//   onPlay={(episode, season) => {
//     setCurrentEpisode(episode)
//     navigate(`/player?url=${episode.streamUrl}`)
//   }}
//   onBack={() => navigate(-1)}
//   onToggleFavorite={(id) => toggleFavorite(id)}
//   onToggleWatched={(id) => toggleWatched(id)}
//   onLoadDetail={(id) => xtreamApi.getSeriesInfo(id).then(mapSeasons)}
// />
