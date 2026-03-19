/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { VideoPlayer } from '../components/Player/VideoPlayer';
import { ButtonBack } from '../components/UI/ButtonBack';
import { useRemoteControl } from '../hooks/useRemotoControl';
// import { useAuthStore } from '../store/authStore';

export const Player = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const [testUrl, setTestUrl] = useState('');
  // const [showUrlInput, setShowUrlInput] = useState(false);
  // const [copiedUrl, setCopiedUrl] = useState(false);
  // const { serverConfig } = useAuthStore();
  const [currentStream, setCurrentStream] = useState<{
    id: string | number;
    streamUrl: string;
    title: string;
    poster?: string;
    type?: string;
    category?: string;
  } | null>(null);

  // Pegar streamUrl do state ou como query param
  useEffect(() => {
    const state = location.state as any;
    if (state?.streamUrl) {
      setCurrentStream({
        id: state.id,
        streamUrl: state.streamUrl,
        title: state.title || 'Reproduzindo',
        poster: state.poster,
        type: state.type || 'live',
        category: state.category || '',
      });
    }
  }, [location]);

  const handleGoBack = () => {
    navigate(`/${!currentStream?.type ? 'home' : currentStream?.type}`, {
      state: currentStream,
    });
    setCurrentStream(null);
  };

  useRemoteControl({
    onBack: () => handleGoBack(),
  });

  return (
    currentStream && (
      <div className="flex flex-col min-h-screen bg-black">
        {/* Back button */}
        <ButtonBack
          className="absolute z-10 top-2"
          title={currentStream.title}
          onClick={() => {
            navigate(`/${!currentStream.type ? 'home' : currentStream.type}`, {
              state: currentStream,
            });
            setCurrentStream(null);
          }}
        />

        {/* Player */}
        <div className="flex items-center justify-center flex-1">
          <VideoPlayer
            title={currentStream.title}
            source={currentStream.streamUrl}
            poster={currentStream.poster}
            autoPlay
            onError={(error) => {
              console.error('Erro no player:', error);
            }}
            streamId={currentStream.id}
            type={(currentStream.type as 'movie' | 'series' | 'live') || 'live'}
            isAutoSave={currentStream.type !== 'live'} // Não salvar progresso para lives
          />
        </div>

        {/* Info com URL Debug */}
        {/* <div className="p-4 overflow-y-auto bg-gray-900 border-t border-gray-800 max-h-48">
          <h2 className="mb-2 font-semibold text-white">{currentStream.title}</h2>
          <div className="space-y-2">
            <div>
              <p className="mb-1 text-xs text-gray-400">URL Completa:</p>
              <p className="p-2 font-mono text-xs text-gray-300 break-all border border-gray-700 rounded bg-gray-950">
                {currentStream.url}
              </p>
            </div>
            {currentStream.type && (
              <div>
                <p className="text-xs text-gray-400">Tipo: <span className="text-gray-300">{currentStream.type}</span></p>
              </div>
            )}
          </div>
        </div> */}

        {/* Stream Debugger */}
        {/* <StreamDebugger
          streamInfo={{
            url: currentStream.url,
            type: currentStream.type as any,
            title: currentStream.title,
          }}
        /> */}
      </div>
    )
  );
};
