/* eslint-disable no-extra-boolean-cast */
import { useState } from 'react';
import { useFavoritesStore } from '../../store/favoritesStore';
import type { Movie } from '../../types';
import { calcProgressPercent } from '../../utils/progressWatched';
import { TrailerModal } from '../Player/TrilerModal';
import { ButtonBack } from './ButtonBack';
import ButtonFavorite from './ButtonFavorite';
import PlayButton from './ButtonPlay';
import { ButtonTrailer } from './ButtonTrailer';
import GenreBadges from './GenreBadges';
import MetaText from './MetaText';
import PlotText from './PlotText';
import Poster from './Poster';

interface SeriesHeroBannerProps {
  movie: Movie;
  percent: number;
  onBack: () => void;
  onPlay: () => void;
  onToggleFavorite?: (movie: Movie) => void;
  focusedButton?: number; // 0=Voltar, 1=Assistir, 2=Trailer, 3=Favorito
  showTrailer?: boolean;
  onSetShowTrailer?: (show: boolean) => void;
}

export const MovieHeroBanner = ({
  movie,
  percent,
  focusedButton,
  showTrailer: propsShowTrailer,
  onSetShowTrailer,
  onBack,
  onPlay,
  onToggleFavorite,
}: SeriesHeroBannerProps) => {
  const [imgError, setImgError] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const { isFavorite } = useFavoritesStore();
  const isFav = isFavorite(String(movie.id));
  const progressPercent = calcProgressPercent(movie.progress ?? 0, movie.duration);
  // const hasProgress = progressPercent > 0 && progressPercent < 100;

  // Usar showTrailer dos props se fornecido, senão usar o state local
  const isShowingTrailer = propsShowTrailer !== undefined ? propsShowTrailer : showTrailer;
  const handleSetShowTrailer = (show: boolean) => {
    if (onSetShowTrailer) {
      onSetShowTrailer(show);
    } else {
      setShowTrailer(show);
    }
  };

  return (
    <div className="relative h-[calc(100vh-60px)] overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${movie.poster})`,
          animation: 'heroFade 0.8s ease both',
          filter: imgError ? 'none' : undefined,
        }}
      />

      {/* Gradientes */}
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

      {/* Botão voltar */}
      <ButtonBack
        className="absolute top-6 left-6 z-10"
        onClick={onBack}
        isFocused={focusedButton === 0}
      />
      <TrailerModal
        youtubeId={movie.youtube_trailer ?? ''}
        open={isShowingTrailer}
        onClose={() => handleSetShowTrailer(false)}
      />

      {/* Conteúdo hero */}
      <div className="absolute inset-0 mt-10 flex items-end pb-10 px-8 md:px-14">
        <div className="flex gap-8 items-end max-w-7xl w-full">
          {/* Poster */}
          <Poster poster={movie.poster} name={movie.name} progressPercent={progressPercent} />

          {/* Info */}
          <div className="flex-1 min-w-0" style={{ animation: 'fadeSlideIn 0.6s ease 0.2s both' }}>
            <GenreBadges genre={movie.genre ?? ''} max={5} />

            {/* Título */}
            <h1
              className="text-7xl max-md:text-4xl font-bold leading-tight mb-3 text-white drop-shadow-lg text-left"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              {movie.name}
            </h1>
            <MetaText
              year={movie.year}
              rating={movie.rating ? Number(movie.rating) : 0}
              percent={percent}
            />

            <PlotText plot={movie.plot ?? ''} />

            {/* Ações */}
            <div className="flex items-center gap-3 flex-wrap">
              <PlayButton isFocused={focusedButton === 1} streamId={movie.id} onClick={onPlay} />
              <ButtonTrailer
                isFocused={focusedButton === 2}
                disabled={!Boolean(movie?.youtube_trailer)}
                onClick={() => handleSetShowTrailer(true)}
              />
              {onToggleFavorite && (
                <ButtonFavorite
                  onClick={() => onToggleFavorite(movie)}
                  isFocused={focusedButton === 3 || isFav}
                  isFav={isFav}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieHeroBanner;

// ─── Exemplo de uso ───────────────────────────────────────────────────────────
//
// <SeriesHeroBanner
//   movie={movie}
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
