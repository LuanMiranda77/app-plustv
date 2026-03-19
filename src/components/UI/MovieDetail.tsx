import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import type { Movie } from '../../types';
import { getProgress } from '../../utils/progressWatched';
import { VideoPlayer } from '../Player/VideoPlayer';
import { ButtonBack } from './ButtonBack';
import { LoadingSpinner } from './LoadingSpinner';
import { MovieHeroBanner } from './MovieHeroBanner';

interface MovieDetailProps {
  movie: Movie | null;
  onBack: () => void;
  onToggleFavorite?: (movie: Movie) => void;
}

export const MovieDetail = ({ movie, onBack, onToggleFavorite }: MovieDetailProps) => {
  const { activeProfile } = useAuthStore();
  const profileId = activeProfile?.id;
  const [loading, setLoading] = useState(false);
  const [isPlay, setIsPlay] = useState(false);
  const [currentStream, setCurrentStrem] = useState<Movie | null>(null);

  const loadProgress = async () => {
    const progress = await getProgress('movie', profileId!, String(movie!.id));
    const updatedMovie = {
      ...movie,
      watched: progress.watched,
      progress: progress.progress,
      duration: progress.duration,
    };
    setCurrentStrem(updatedMovie);
  };

  const getPorcentagem =
    !currentStream?.progress || !currentStream.duration
      ? 0
      : (currentStream.progress / currentStream.duration) * 100;

  // Carregar detalhes da série
  useEffect(() => {
    if (!movie) return;

    const load = async () => {
      setLoading(true);
      try {
        // ── Enriquecer com progresso ───────────────────────────────────
        loadProgress();
      } catch (error) {
        console.error('❌ Erro ao carregar episódios:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [movie?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <LoadingSpinner />
      </div>
    );
  }

  return currentStream && isPlay ? (
    <div className="flex flex-col min-h-screen bg-black">
      <ButtonBack
        className="absolute z-[99999] top-2"
        title={currentStream.name}
        onClick={() => setIsPlay(false)}
      />
      {/* Player */}
      <div className="absolute z-[9999] w-screen h-h-screen flex items-center justify-center flex-1">
        <VideoPlayer
          title={currentStream.name}
          source={currentStream.streamUrl}
          poster={currentStream.poster || ''}
          autoPlay
          onError={(error) => {
            console.error('Erro no player:', error);
          }}
          streamId={currentStream.id}
          type="movie"
          isAutoSave
        />
      </div>
    </div>
  ) : (
    movie && (
      <div
        className="absolute top-0 max-h-[calc(100vh-60px)] bg-zinc-950 text-white w-full mt-[60px]"
        style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
      >
        <MovieHeroBanner
          movie={movie}
          onPlay={() => setIsPlay(true)}
          percent={getPorcentagem}
          onBack={onBack}
          onToggleFavorite={onToggleFavorite}
        />
      </div>
    )
  );
};
export default MovieDetail;
