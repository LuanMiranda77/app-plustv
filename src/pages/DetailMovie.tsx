import MovieHeroBanner from '../components/UI/MovieHeroBanner';
import { ueseDetailMovie } from '../hooks/useDetailMovie';

export const DetailMovie = () => {
  const {
    // Refs
    pageRef,

    // Estado do filme
    movie,

    // UI
    focusedButton,
    showTrailer,
    setShowTrailer,

    // Progresso
    getPorcentagem,

    // Favoritos
    isFavorite,

    // Ações
    handlePlay,
    handleBack,
    handleToggleFavorite
  } = ueseDetailMovie();
 
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
          focusedButton={focusedButton}
          showTrailer={showTrailer}
          onSetShowTrailer={setShowTrailer}
          isFav={isFavorite(movie.id)}
        />
      </div>
    )
  );
};
