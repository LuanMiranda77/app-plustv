/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { VideoPlayer } from '../../components/Player/VideoPlayer';
import { useBackGuard } from '../../hooks/useBackGuard';
import { useRemoteControl } from '../../hooks/useRemotoControl';
import { useAuthStore } from '../../store/authStore';
import type { Episode, Season, Series } from '../../types';
import { indexedDbStorage } from '../../utils/indexedDbStorage';
import { KEYS_PROCESS_EPISODE } from '../../utils/keys_cache';

export interface PlayerStream {
  id: string | number;
  streamUrl: string;
  title: string;
  poster: string;
  type: 'movie' | 'series' | 'live';
  category?: string;
  location?: string | null;
  parentContent?: Series | null;
  episodeId?: string;
  episodeNumber?: number;
  seasonNumber?: number;
}

// type StreamLikeState = Partial<PlayerStream> & Partial<Channel> & Partial<Movie> & Partial<Episode>;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const normalizePlayerState = (state: PlayerStream): PlayerStream | null => {
  if (!isObject(state)) return null;

  const streamUrl = state.streamUrl;

  if (!streamUrl) return null;

  const fallbackPoster = state.poster || state.thumbnail || state.logo || '';
  const title = state.title || state.name || 'Reproduzindo';

  return {
    id: state.id || state.episodeId || '',
    streamUrl,
    title: title,
    poster: fallbackPoster,
    type: state.type || 'live',
    category: state.category,
    location: state.location || null,
    parentContent: (state.parentContent as Series) || null,
    episodeId: state.episodeId || (state.id ? String(state.id) : undefined),
    episodeNumber: state.episodeNumber || undefined,
    seasonNumber: state.seasonNumber || undefined
  } as PlayerStream;
};

export const Player = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [currentStream, setCurrentStream] = useState<PlayerStream | null>(null);
  const [currentEpisodeId, setCurrentEpisodeId] = useState<string | null>(null);
  const [currentSeasonNumber, setCurrentSeasonNumber] = useState<number>(1);
  const { serverConfig } = useAuthStore();

  // ── Carregar episódios do cache ───────────────────────────────────────────
  const loadEpisodesForSeries = async (seriesId: string | number) => {
    const KEY = `${KEYS_PROCESS_EPISODE}_${serverConfig?.url}_${seriesId}`;
    const cached = await indexedDbStorage.get(KEY);
    if (cached && Array.isArray(cached)) {
      console.log('📺 Episódios carregados do cache - player:', seriesId);
      setSeasons(cached as Season[]);
    }
  };

  // Função que encontra o episódio anterior
  const getPreviousEpisode = (
    currentEpisodeId: string | null,
    currentSeasonNumber: number,
    seasons: Season[]
  ): any | null => {
    // Encontrar a temporada atual
    if (currentStream?.type != 'series') return null;
    const currentSeason = seasons.find(s => s.number === currentSeasonNumber);
    if (!currentSeason) return null;

    // Encontrar índice do episódio atual na temporada
    const currentEpisodeIndex = currentSeason.episodes.findIndex(ep => ep.id === currentEpisodeId);

    if (currentEpisodeIndex > 0) {
      // Existe episódio anterior na mesma temporada
      return currentSeason.episodes[currentEpisodeIndex - 1];
    } else {
      // Verificar temporada anterior
      const previousSeasonNumber = currentSeasonNumber - 1;
      const previousSeason = seasons.find(s => s.number === previousSeasonNumber);
      if (!previousSeason || previousSeason.episodes.length === 0) return null;

      // Retornar último episódio da temporada anterior
      return previousSeason.episodes[previousSeason.episodes.length - 1];
    }
  };

  // ── Inicializar stream ────────────────────────────────────────────────────
  useEffect(() => {
    const parsedStream = normalizePlayerState(location.state);

    if (parsedStream && currentStream === null) {
      setCurrentStream(parsedStream);
      if (parsedStream.type === 'series' && parsedStream.parentContent) {
        loadEpisodesForSeries(parsedStream.parentContent.id);
        setCurrentEpisodeId(parsedStream.episodeId || null);
        setCurrentSeasonNumber(parsedStream.seasonNumber || 1);
      }
    }
  }, [location, currentStream]);

  // ── Lista flat de todos os episódios em ordem ─────────────────────────────
  const allEpisodes: (Episode & { _season: number })[] = seasons
    .sort((a, b) => a.number - b.number)
    .flatMap(season => season.episodes.map(ep => ({ ...ep, _season: season.number })));

  const currentEpisodeIndex = allEpisodes.findIndex(ep => ep.id === currentEpisodeId);
  const nextEpisode = allEpisodes[currentEpisodeIndex + 1] ?? null;
  const nextSeasonNumber = nextEpisode?._season ?? currentSeasonNumber;

  const previousEpisode = getPreviousEpisode(currentEpisodeId, currentSeasonNumber, seasons);
  const previousSeasonNumber = previousEpisode?.seasonNumber;

  // ── Episódio anterior ──────────────────────────────────────────────────────
  const handlePreviousEpisode = () => {
    if (!previousEpisode || !currentStream?.parentContent) {
      // Não existe episódio anterior — voltar para a série
      navigate('/detail-series', { state: currentStream?.parentContent });
      return;
    }
    setCurrentStream(prev => ({
      ...prev!,
      id: previousEpisode.id,
      streamUrl: previousEpisode.streamUrl,
      title: `${currentStream.parentContent?.name} — T${previousSeasonNumber}:E${String(previousEpisode.number).padStart(2, '0')}${previousEpisode.name ? ` · ${previousEpisode.name}` : ''}`,
      poster: previousEpisode.thumbnail || prev!.poster,
      episodeId: previousEpisode.id,
      episodeNumber: previousEpisode.number,
      seasonNumber: previousSeasonNumber
    }));

    setCurrentEpisodeId(previousEpisode.id);
    setCurrentSeasonNumber(previousSeasonNumber);
  };

  // ── Próximo episódio ──────────────────────────────────────────────────────
  const handleNextEpisode = () => {
    if (!nextEpisode || !currentStream?.parentContent) {
      // Acabou tudo — voltar para a série
      navigate('/series', { state: currentStream?.parentContent });
      return;
    }

    setCurrentStream(prev => ({
      ...prev!,
      id: nextEpisode.id,
      streamUrl: nextEpisode.streamUrl,
      title: `${currentStream.parentContent?.name} — T${nextSeasonNumber}:E${String(nextEpisode.number).padStart(2, '0')}${nextEpisode.name ? ` · ${nextEpisode.name}` : ''}`,
      poster: nextEpisode.thumbnail || prev!.poster,
      episodeId: nextEpisode.id,
      episodeNumber: nextEpisode.number,
      seasonNumber: nextSeasonNumber
    }));

    setCurrentEpisodeId(nextEpisode.id);
    setCurrentSeasonNumber(nextSeasonNumber);
  };

  // ── Voltar ────────────────────────────────────────────────────────────────
  const handleGoBack = () => {
    navigate(`/${currentStream?.location ?? currentStream?.type}`, {
      state: currentStream?.parentContent ?? currentStream
    });
    setCurrentStream(null);
  };

  useBackGuard(!!currentStream, handleGoBack);

  useRemoteControl({
    onBack: () => {
      if (currentStream) window.history.back();
    }
  });

  return (
    currentStream && (
      <div className="flex flex-col min-h-screen bg-black">
        <div className="flex items-center justify-center flex-1">
          <VideoPlayer
            key={String(currentStream.id)} // ← re-mount a cada episódio
            title={currentStream.title}
            source={currentStream.streamUrl}
            poster={currentStream.poster}
            autoPlay
            onError={error => console.error('Erro no player:', error)}
            streamId={currentStream.id}
            type={currentStream.type}
            isAutoSave={currentStream.type !== 'live'}
            isControlsVisible
            onBack={handleGoBack}
            nextEpisode={nextEpisode}
            currentSeason={currentSeasonNumber}
            onNextEpisode={currentStream.type === 'series' ? handleNextEpisode : undefined}
            onBackEpisode={currentStream.type === 'series' ? handlePreviousEpisode : undefined}
            contentObject={{ ...currentStream, parentContent: null } as any}
            parentContent={currentStream.parentContent}
          />
        </div>
      </div>
    )
  );
};
