import { PlayerCoomponent } from '../../components/Player/PlayerComponent';
import MovieHeroBanner from '../../components/UI/MovieHeroBanner';
import { ueseDetailMovie } from '../../hooks/useDetailMovie';
import type { Movie } from '../../types';

interface DetailMovieProps {
  currentMovie: Movie | null;
  onClose: () => void;
  // setCurrentMovie: (movie: Movie | null) => void;
}

export const DetailMovie = ({ ...porps }: DetailMovieProps) => {
  const {
    // Refs
    pageRef,
    isDetail,
    isLoadingFav,

    // Estado do filme
    movie,
    playerStream,
    setPlayerStream,

    // UI
    focusedButtonDetail,
    showTrailer,

    // Progresso
    getPorcentagem,

    // Ações
    handlePlay,
    handleBack,
    handleToggleFavorite,
    setShowTrailer
  } = ueseDetailMovie({ ...porps });

  return (
    <>
      <div className={`${playerStream ? 'block' : 'hidden'}`}>
        <PlayerCoomponent playerStream={playerStream!} handleBack={() => setPlayerStream(null)} />
      </div>
      <div
        ref={pageRef}
        className={`h-screen bg-zinc-950 text-white w-full overflow-y-auto ${isDetail && !playerStream ? 'block' : 'hidden'}`}
        style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
      >
        <MovieHeroBanner
          movie={movie!}
          onPlay={handlePlay}
          percent={getPorcentagem}
          onBack={handleBack}
          onToggleFavorite={handleToggleFavorite}
          focusedButton={focusedButtonDetail}
          showTrailer={showTrailer}
          onSetShowTrailer={setShowTrailer}
          isLoadingFav={isLoadingFav}
        />
      </div>
    </>
  );
};
