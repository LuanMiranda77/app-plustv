import { useEffect, useRef, useState } from 'react';
import { useRemoteControl } from '../../hooks/useRemotoControl';
import { useAuthStore } from '../../store/authStore';
import type { Movie } from '../../types';
import { getProgress } from '../../utils/progressWatched';
import { VideoPlayer } from '../Player/VideoPlayer';
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
  const [focusedButton, setFocusedButton] = useState(1); // 0=Voltar, 1=Assistir, 2=Trailer, 3=Favorito
  const [showTrailer, setShowTrailer] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  const loadProgress = async () => {
    const progress = await getProgress('movie', profileId!, String(movie!.id));
    const updatedMovie = {
      ...movie!,
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

  // Remote Control Navigation
  useRemoteControl({
    onRight: () => {
      if (isPlay) return;
      // Navegar entre botões (Voltar → Assistir → Trailer → Favorito)
      const maxButtons = 4; // 0=Voltar, 1=Assistir, 2=Trailer, 3=Favorito
      setFocusedButton((prev) => (prev + 1) % maxButtons);
    },
    onLeft: () => {
      if (isPlay) return;
      // Navegar entre botões ao contrário
      const maxButtons = 4;
      setFocusedButton((prev) => (prev - 1 + maxButtons) % maxButtons);
    },
    onOk: () => {
      if (isPlay) return;
      // Executar ação do botão focado
      if (focusedButton === 0) {
        // Voltar
        onBack();
      } else if (focusedButton === 1) {
        // Assistir
        setIsPlay(true);
      } else if (focusedButton === 2) {
        // Trailer
        setShowTrailer(true);
      } else if (focusedButton === 3) {
        // Favorito
        if (onToggleFavorite && currentStream) onToggleFavorite(currentStream);
      }
    },
    onBack: () => {
      if (isPlay) {
        setIsPlay(false);
      } else {
        onBack();
      }
    },
  });

  // Carregar detalhes do filme
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
          onBack={() => setIsPlay(false)}
        />
      </div>
    </div>
  ) : (
    currentStream && (
      <div
        ref={pageRef}
        className="absolute top-0 max-h-[calc(100vh-60px)] bg-zinc-950 text-white w-full mt-[60px]"
        style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
      >
        <MovieHeroBanner
          movie={currentStream}
          onPlay={() => setIsPlay(true)}
          percent={getPorcentagem}
          onBack={onBack}
          onToggleFavorite={onToggleFavorite}
          focusedButton={focusedButton}
          showTrailer={showTrailer}
          onSetShowTrailer={setShowTrailer}
        />
      </div>
    )
  );
};
export default MovieDetail;
