import { useEffect, useRef, useState } from 'react';
import { useDetailContext } from '../Context/DetailContext';
import type { PlayerStream } from '../pages/Player';
import { useAuthStore } from '../store/authStore';
import { useMovieStore } from '../store/contentStore';
import type { Movie } from '../types';
import { getProgress } from '../utils/progressWatched';
import { useBackGuard } from './useBackGuard';
import { useRemoteControl } from './useRemotoControl';
import { useFocusZone, type FocusZone } from '../Context/FocusContext';

export function ueseDetailMovie({ ...props }: any) {
  const { activeProfile } = useAuthStore();
  const profileId = activeProfile?.id;
  const [loading, setLoading] = useState(false);
  const maxButtons = 4;
  const [focusedButtonDetail, setFocusedButtonDetail] = useState(1); // 0=Voltar, 1=Assistir, 2=Trailer, 3=Favorito
  const [showTrailer, setShowTrailer] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const { toggleFavorite } = useMovieStore();
  const [playerStream, setPlayerStream] = useState<PlayerStream | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoadingFav, setIsLoadingFav] = useState(false);
  const { serverConfig } = useAuthStore();
  const { isDetail, setIsDetail } = useDetailContext();
  const { isActiveZone, setActiveZone } = useFocusZone();
  const zoneDetail: FocusZone = 'detail';

  // const currentMovie = props?.currentMovie as Movie | null;

  const loadProgress = async (movie: Movie) => {
    const progress = await getProgress('movie', profileId!, String(movie!.id), serverConfig!);
    const updatedMovie: any = {
      ...movie!,
      watched: progress.watched,
      progress: progress.progress,
      duration: progress.duration
    };
    setMovie(updatedMovie);
  };

  useEffect(() => {
    console.log(props);
    // if (!props?.currentMovie) {
    //   setMovie(null);
    //   return;
    // }

    const load = async () => {
      setLoading(true);
      try {
        // ── Enriquecer com progresso ───────────────────────────────────
        await loadProgress(props?.currentMovie);
      } catch (error) {
        console.error('❌ Erro ao carregar episódios:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [props?.currentMovie]);

  const handlePlay = () => {
    if (!movie) return;

    const state: PlayerStream = {
      ...movie,
      streamUrl: movie.streamUrl,
      title: movie.name,
      poster: movie.poster,
      type: 'movie',
      location: 'movie'
    };
    // setMovie(movie);
    setPlayerStream(state);
    // setIsDetail(true);
    // navigate('/player', { state: state });
  };

  const handleBack = () => {
    // navigate('/movie', { state: movie });
    // setIsDetail(false);
    setPlayerStream(null);
    setIsDetail(false);
    setActiveZone('list');
    props.onClose();
  };

  const handleToggleFavorite = async () => {
    if (!movie) return;
    setIsLoadingFav(true);
    await toggleFavorite(movie.id, serverConfig!);
    setMovie({ ...movie, isFavorite: !movie.isFavorite });
    setIsLoadingFav(false);
  };

  // Interceptar voltar nativo do navegador/TV
  useBackGuard(isDetail, showTrailer ? () => setShowTrailer(false) : handleBack);

  const getPorcentagem =
    !movie?.progress || !movie.duration ? 0 : (movie.progress / movie.duration) * 100;

  // Remote Control Navigation
  useRemoteControl({
    onUp: () => {
      if (!isActiveZone(zoneDetail)) return;
      setFocusedButtonDetail(0); // Focar no botão Voltar
    },
    onDown() {
      if (!isActiveZone(zoneDetail)) return;
      setFocusedButtonDetail(1); // Focar no botão Assistir
    },
    onRight: () => {
      if (!isActiveZone(zoneDetail)) return;
      if (focusedButtonDetail < maxButtons - 1) {
        console.log(focusedButtonDetail + 1);
        return setFocusedButtonDetail(prev => prev + 1);
      }
    },
    onLeft: () => {
      if (!isActiveZone(zoneDetail)) return;
      // Navegar entre botões ao contrário
      if (focusedButtonDetail > 1) {
        console.log(focusedButtonDetail - 1);
        setFocusedButtonDetail(prev => prev - 1);
      }
    },
    onOk: () => {
      if (!isActiveZone(zoneDetail)) return;
      // Executar ação do botão focado
      if (focusedButtonDetail === 0) {
        // Voltar
        handleBack();
      } else if (focusedButtonDetail === 1) {
        // Assistir
        handlePlay();
      } else if (focusedButtonDetail === 2 && movie?.youtube_trailer) {
        // Trailer
        setShowTrailer(true);
      } else if (focusedButtonDetail === 3) {
        // Favorito
        handleToggleFavorite();
      }
    },
    onBack: () => {
      if (!isActiveZone(zoneDetail)) return;
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
    playerStream,
    setPlayerStream,
    isDetail,
    isLoadingFav,
    setIsLoadingFav,

    // UI
    focusedButtonDetail,
    setFocusedButtonDetail,
    showTrailer,
    setShowTrailer,

    // Progresso
    getPorcentagem,

    // Ações
    handlePlay,
    handleBack,
    handleToggleFavorite,
    loadProgress
  };
}
