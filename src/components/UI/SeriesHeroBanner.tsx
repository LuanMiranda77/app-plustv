import { useState } from 'react';
import { FaYoutube } from 'react-icons/fa';
import useWindowSize from '../../hooks/useWindowSize';
import type { Episode, Season, Series } from '../../types';
import { TrailerModal } from '../Player/TrilerModal';
import { ButtonBack } from './ButtonBack';
import StartRating from './StarRating';
import { ButtonTrailer } from './ButtonTrailer';

interface SeriesHeroBannerProps {
  series: Series;
  seasons: Season[];
  total: number;
  percent: number;
  nextEpisode: Episode | null;
  currentEpisodeId?: string;
  onBack: () => void;
  onPlayNext: () => void;
  onToggleFavorite?: (id: string) => void;
  onScrollToEpisodes: () => void;
}

export const SeriesHeroBanner = ({
  series,
  seasons,
  total,
  percent,
  nextEpisode,
  currentEpisodeId,
  onBack,
  onPlayNext,
  onToggleFavorite,
  onScrollToEpisodes,
}: SeriesHeroBannerProps) => {
  const [imgError, setImgError] = useState(false);
  const [showFullPlot, setShowFullPlot] = useState(false);
  const { isMobile } = useWindowSize();
  const [showTrailer, setShowTrailer] = useState(false);

  return (
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
      <ButtonBack className="absolute top-6 left-6 z-10" onClick={onBack} />
      <TrailerModal
        youtubeId={series.youtube_trailer ?? ''}
        open={showTrailer}
        onClose={() => setShowTrailer(false)}
      />

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
          <div className="flex-1 min-w-0" style={{ animation: 'fadeSlideIn 0.6s ease 0.2s both' }}>
            {/* Gênero badges */}
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
              {series.rating && <StartRating rating={series.rating} />}
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
                  className={`text-zinc-300 text-sm leading-relaxed text-justify
                               ${showFullPlot ? '' : 'line-clamp-3'}`}
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
              {/* Assistir / Continuar */}
              <button
                onClick={onPlayNext}
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
              <ButtonTrailer disabled={!series.youtube_trailer} onClick={() => setShowTrailer(true)}/>

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
                onClick={onScrollToEpisodes}
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
  );
};

export default SeriesHeroBanner;

// ─── Exemplo de uso ───────────────────────────────────────────────────────────
//
// <SeriesHeroBanner
//   series={series}
//   seasons={seasons}
//   total={total}
//   percent={percent}
//   nextEpisode={nextEpisode}
//   currentEpisodeId={currentEpisode?.id}
//   onBack={() => navigate(-1)}
//   onPlayNext={handlePlayNext}
//   onToggleFavorite={(id) => toggleFavorite(id)}
//   onScrollToEpisodes={scrollToEpisodes}
// />
