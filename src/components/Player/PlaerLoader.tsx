import React from 'react';
interface PlayerLoaderProps {
  title: string;
  poster?: string;
}

const PlayerLoader: React.FC<PlayerLoaderProps> = ({ title, poster }) => {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black">
      {/* Poster desfocado de fundo */}
      {poster && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 blur-xl scale-110"
          style={{ backgroundImage: `url(${poster})` }}
        />
      )}

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-white/10" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-600 animate-spin" />
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-400 animate-spin"
            style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
          />
        </div>

        {/* Título */}
        <div className="text-center px-8">
          <p className="text-zinc-400 text-sm uppercase tracking-widest mb-1">Carregando...</p>
          <p
            className="text-white font-semibold text-2xl max-md:text-lg line-clamp-2 max-w-sm"
          >
            {title}
          </p>
        </div>
      </div>

      <style>{`
      @keyframes loadingBar {
        0%   { width: 0%;   margin-left: 0%; }
        50%  { width: 70%;  margin-left: 15%; }
        100% { width: 0%;   margin-left: 100%; }
      }
    `}</style>
    </div>
  );
};

export default PlayerLoader;
