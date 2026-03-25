/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { VideoPlayer } from '../components/Player/VideoPlayer';
import { useBackGuard } from '../hooks/useBackGuard';
import { useRemoteControl } from '../hooks/useRemotoControl';
import type { Episode, Season, Series } from '../types';
import { indexedDbStorage } from '../utils/indexedDbStorage';
import { KEYS_PROCESS_EPISODE } from '../utils/keys_cache';
import { useAuthStore } from '../store/authStore';

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

  // ── Inicializar stream ────────────────────────────────────────────────────
  useEffect(() => {
    const state = location.state as any;
    if (state?.streamUrl && currentStream === null) {
      setCurrentStream({
        ...state,
        poster: state.poster,
        title: state.title || 'Reproduzindo',
        type: state.type || 'live',
        location: state.location || null,
        parentContent: state.parentContent || null,
        episodeId: state.episodeId || null,
        episodeNumber: state.episodeNumber || null,
        seasonNumber: state.seasonNumber || 1
      });
      if (state.type === 'series' && state.parentContent) {
        loadEpisodesForSeries(state.parentContent.id);
        setCurrentEpisodeId(state.episodeId || null);
        setCurrentSeasonNumber(state.seasonNumber || 1);
      }
    }
  }, [location]);

  // ── Lista flat de todos os episódios em ordem ─────────────────────────────
  const allEpisodes: (Episode & { _season: number })[] = seasons
    .sort((a, b) => a.number - b.number)
    .flatMap(season => season.episodes.map(ep => ({ ...ep, _season: season.number })));

  const currentEpisodeIndex = allEpisodes.findIndex(ep => ep.id === currentEpisodeId);
  const nextEpisode = allEpisodes[currentEpisodeIndex + 1] ?? null;
  const nextSeasonNumber = nextEpisode?._season ?? currentSeasonNumber;

  // ── Próximo episódio ──────────────────────────────────────────────────────
  const handleNextEpisode = () => {
    if (!nextEpisode || !currentStream?.parentContent) {
      // Acabou tudo — voltar para a série
      console.log('🎬 Fim da série — voltando para /series');
      navigate('/series', { state: currentStream?.parentContent });
      return;
    }

    console.log(`▶️ Próximo: T${nextSeasonNumber}:E${nextEpisode.number} — ${nextEpisode.name}`);

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
            isControlsVisible={currentStream.type !== 'live'}
            onBack={handleGoBack}
            nextEpisode={nextEpisode}
            currentSeason={currentSeasonNumber}
            onNextEpisode={currentStream.type === 'series' ? handleNextEpisode : undefined}
            contentObject={{ ...currentStream, parentContent:null } as any}
            parentContent={currentStream.parentContent}
          />
        </div>
      </div>
    )
  );
};
