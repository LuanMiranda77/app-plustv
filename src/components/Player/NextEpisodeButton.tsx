import { useEffect, useState } from 'react';

interface NextEpisodeButtonProps {
  episodeName?: string;
  episodeNumber?: number;
  seasonNumber?: number;
  timeRemaining?: number; // segundos restantes
  autoPlayDelay?: number; // segundos para autoplay (0 = desabilitar)
  onNext: () => void;
  onDismiss?: () => void;
}

export const NextEpisodeButton = ({
  episodeName,
  episodeNumber,
  seasonNumber,
  timeRemaining,
  autoPlayDelay = 10,
  onNext,
  onDismiss
}: NextEpisodeButtonProps) => {
  const [countdown, setCountdown] = useState(autoPlayDelay);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (autoPlayDelay <= 0) return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onNext();
          return 0;
        }
        return prev - 1;
      });
      setProgress(prev => prev + 100 / autoPlayDelay);
    }, 1000);

    return () => clearInterval(interval);
  }, [autoPlayDelay]);

  const label = episodeNumber
    ? `T${seasonNumber ?? 1}:E${String(episodeNumber).padStart(2, '0')}${episodeName ? ` — ${episodeName}` : ''}`
    : 'Próximo episódio';

  const circumference = 2 * Math.PI * 20; // raio 20
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="flex flex-col items-end gap-3 animate-[fadeSlideIn_0.4s_ease_both]"
      style={{ animation: 'fadeSlideIn 0.4s ease both' }}
    >
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Label */}
      <div className="text-right">
        <p className="text-zinc-400 text-xs uppercase tracking-widest mb-0.5">A seguir</p>
        <p className="text-white text-sm font-medium line-clamp-1 max-w-[280px]">{label}</p>
      </div>

      {/* Botão principal */}
      <div className="flex items-center gap-2">
        {/* Botão dispensar */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="px-4 py-2.5 rounded-lg text-sm font-medium
                       bg-white/10 hover:bg-white/20 text-white
                       border border-white/10 hover:border-white/20
                       transition-all duration-200"
          >
            Dispensar
          </button>
        )}

        {/* Botão próximo com countdown */}
        <button
          onClick={onNext}
          className="group relative flex items-center gap-3 pl-4 pr-5 py-2.5 rounded-lg
                     bg-white hover:bg-zinc-100 text-black font-semibold text-sm
                     transition-all duration-200 hover:scale-105
                     shadow-lg shadow-black/30"
        >
          {/* Countdown circular */}
          {autoPlayDelay > 0 && countdown > 0 && (
            <div className="relative w-10 h-10 flex-shrink-0 -ml-1">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                {/* Trilha */}
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth="3"
                />
                {/* Progresso */}
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="rgba(0,0,0,0.6)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              {/* Número */}
              <span
                className="absolute inset-0 flex items-center justify-center
                               text-xs font-bold text-black leading-none"
              >
                {countdown}
              </span>
            </div>
          )}
          {/* Ícone play */}
          <svg className="w-4 h-4 fill-black flex-shrink-0" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          Próximo episódio
          {/* ✅ Countdown circular ao lado do nome */}
          {autoPlayDelay > 0 && countdown > 0 && (
            <span className="relative w-8 h-8 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth="3"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="rgba(0,0,0,0.6)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <span
                className="absolute inset-0 flex items-center justify-center
                         text-[10px] font-bold text-black leading-none"
              >
                {countdown}
              </span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default NextEpisodeButton;

// ─── Exemplo de uso no VideoPlayer ───────────────────────────────────────────
//
// {showNextEpisodeBtn && type === 'series' && onNextEpisode && (
//   <div className="absolute bottom-24 right-8 z-[99999]">
//     <NextEpisodeButton
//       episodeName="O Último Dia"
//       episodeNumber={nextEpisode?.number}
//       seasonNumber={currentSeason}
//       timeRemaining={timeRemaining}
//       autoPlayDelay={10}
//       onNext={() => {
//         setShowNextEpisodeBtn(false)
//         onNextEpisode()
//       }}
//       onDismiss={() => setShowNextEpisodeBtn(false)}
//     />
//   </div>
// )}
