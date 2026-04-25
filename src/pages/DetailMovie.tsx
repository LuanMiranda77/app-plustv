import { useLocation } from 'react-router-dom';
import MovieHeroBanner from '../components/UI/MovieHeroBanner';
import { ueseDetailMovie } from '../hooks/useDetailMovie';

export const DetailMovie = () => {
  const location = useLocation();
  const {
    // Refs
    pageRef,

    // Estado do filme
    movie,

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
  } = ueseDetailMovie({ movie: location.state });

  return (
    movie && (
      <div
        ref={pageRef}
        className="absolute top-0 max-h-[calc(100vh-60px)] bg-zinc-950 text-white w-full overflow-y-auto"
        style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
      >
        <MovieHeroBanner
          movie={movie}
          onPlay={handlePlay}
          percent={getPorcentagem}
          onBack={handleBack}
          onToggleFavorite={handleToggleFavorite}
          focusedButton={focusedButtonDetail}
          showTrailer={showTrailer}
          onSetShowTrailer={setShowTrailer}
          isLoadingFav={false}
        />
      </div>
    )
  );
};
