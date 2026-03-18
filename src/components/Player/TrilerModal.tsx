import { useEffect } from 'react';

export const TrailerModal = ({
  open,
  youtubeId,
  onClose,
}: {
  open: boolean;
  youtubeId: string;
  onClose: () => void;
}) => {
  // Fechar com tecla ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    open && (
      <div
        className="fixed inset-0 z-[99] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose} // clica fora = fecha
      >
        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60
                     flex items-center justify-center text-white hover:bg-black transition-colors"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div
          className="relative w-full max-w-4xl mx-4 aspect-video rounded-2xl overflow-hidden
                   shadow-2xl shadow-black border border-white/10 pointer-events-none"
          onClick={(e) => e.stopPropagation()} // não fecha ao clicar no player
        >
          {/* iframe YouTube */}
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&controls=0&mute=0&autohide=1&showinfo=0&loop=1&playlist=${youtubeId}`}
            className="w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
          {/* <PlayerTrailer title="Triler" youtubeId={youtubeId??''} /> */}

          {/* ✅ Overlay invisível que bloqueia cliques no iframe */}
          {/* Remova esta div se quiser que o usuário interaja com o player */}
          {/* <div className="absolute inset-0 z-10" /> */}
        </div>
      </div>
    )
  );
};
