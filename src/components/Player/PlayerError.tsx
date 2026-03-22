import React from 'react';
interface PlayerErrorProps {
  error: string;
  onBack?: () => void;
}

const PlayerError: React.FC<PlayerErrorProps> = ({ error, onBack }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90">
      <div className="text-center px-8 max-w-sm">
        <div
          className="w-16 h-16 rounded-full bg-red-600/20 border border-red-600/40
                        flex items-center justify-center mx-auto mb-4"
        >
          <svg
            className="w-8 h-8 text-red-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-white font-semibold mb-1">Erro ao reproduzir</p>
        <p className="text-zinc-400 text-sm mb-6">{error}</p>
        {onBack && (
          <button
            onClick={onBack}
            className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm
                       font-medium rounded-lg transition-colors"
          >
            Voltar
          </button>
        )}
      </div>
    </div>
  );
};

export default PlayerError;
