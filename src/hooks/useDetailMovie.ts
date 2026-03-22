import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { PlayerStream } from '../pages/Player';
import { useAuthStore } from '../store/authStore';
import { useFavoritesStore } from '../store/favoritesStore';
import type { Movie } from '../types';
import { getProgress } from '../utils/progressWatched';
import { useRemoteControl } from './useRemotoControl';
import { useBackGuard } from './useBackGuard';

export function ueseDetailMovie() {
  const { activeProfile } = useAuthStore();
  const profileId = activeProfile?.id;
  const [loading, setLoading] = useState(false);
  const [focusedButton, setFocusedButton] = useState(1); // 0=Voltar, 1=Assistir, 2=Trailer, 3=Favorito
  const [showTrailer, setShowTrailer] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [movie, setMovie] = useState<Movie | null>(null);

  const loadProgress = async (movie: Movie) => {
    const progress = await getProgress('movie', profileId!, String(movie!.id));
    const updatedMovie: any = {
      ...movie!,
      watched: progress.watched,
      progress: progress.progress,
      duration: progress.duration
    };
    setMovie(updatedMovie);
  };

  useEffect(() => {
    const state = location.state as any;
    if (state && movie === null) {
      const load = async () => {
        setLoading(true);
        try {
          // ── Enriquecer com progresso ───────────────────────────────────
          loadProgress(state);
        } catch (error) {
          console.error('❌ Erro ao carregar episódios:', error);
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [location]);

  const handlePlay = () => {
    if (!movie) return;

    const state: PlayerStream = {
      ...movie,
      streamUrl: movie.streamUrl,
      title: movie.name,
      poster: movie.poster,
      type: 'movie',
      location: 'detail-movie'
    };

    setMovie(movie);
    navigate('/player', { state: state });
  };

  const handleBack = () => {
    navigate('/movie', { state: movie });
  };

  const handleToggleFavorite = () => {
    if (!movie) return;

    if (isFavorite(movie.id)) {
      removeFavorite(movie.id);
    } else {
      addFavorite(movie, 'movie');
    }
  };

  // Interceptar voltar nativo do navegador/TV
  useBackGuard(!!movie, showTrailer ? () => setShowTrailer(false) : handleBack);

  const getPorcentagem =
    !movie?.progress || !movie.duration ? 0 : (movie.progress / movie.duration) * 100;

  // Remote Control Navigation
  useRemoteControl({
    onRight: () => {
      // Navegar entre botões (Voltar → Assistir → Trailer → Favorito)
      const maxButtons = 4; // 0=Voltar, 1=Assistir, 2=Trailer, 3=Favorito
      setFocusedButton(prev => (prev + 1) % maxButtons);
    },
    onLeft: () => {
      // Navegar entre botões ao contrário
      const maxButtons = 4;
      setFocusedButton(prev => (prev - 1 + maxButtons) % maxButtons);
    },
    onOk: () => {
      // Executar ação do botão focado
      if (focusedButton === 0) {
        // Voltar
        handleBack();
      } else if (focusedButton === 1) {
        // Assistir
        handlePlay();
      } else if (focusedButton === 2 && movie?.youtube_trailer) {
        // Trailer
        setShowTrailer(true);
      } else if (focusedButton === 3) {
        // Favorito
        handleToggleFavorite();
      }
    },
    onBack: () => {
      handleBack();
    }
  });

  return {
    // Refs
    pageRef,

    // Estado do filme
    movie,
    setMovie,
    loading,

    // UI
    focusedButton,
    setFocusedButton,
    showTrailer,
    setShowTrailer,

    // Progresso
    getPorcentagem,

    // Favoritos
    isFavorite,

    // Ações
    handlePlay,
    handleBack,
    handleToggleFavorite,
    loadProgress,
  };
}
