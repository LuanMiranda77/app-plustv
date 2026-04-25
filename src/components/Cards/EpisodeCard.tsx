import { useState } from 'react';
import type { Episode } from '../../types';
import { calcProgressPercent } from '../../utils/progressWatched';
import StartRating from '../UI/StarRating';

interface EpisodeCardProps {
  episode: Episode;
  seasonNumber: number;
  onPlay: (episode: Episode) => void;
  onToggleWatched?: (episodeId: string) => void;
  isActive?: boolean; // episódio sendo assistido agora (OK pressionado)
  isFocused?: boolean; // foco via controle remoto (navegação d-pad)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (seconds: number): string => {
  if (!seconds) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

export const EpisodeCard = ({
  episode,
  seasonNumber,
  onPlay,
  onToggleWatched,
  isActive = false,
  isFocused = false
}: EpisodeCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const progressPercent = calcProgressPercent(episode.progress ?? 0, episode.duration);
  const hasProgress = progressPercent > 0 && progressPercent < 100;
  const isWatched = episode.watched;

  const focus = 'border-zinc-400/60 ring-2 ring-white/30 scale-[1.01] shadow-xl shadow-black/40';

  return (
    <div
      className={`
        group relative flex gap-4 rounded-xl p-3 cursor-pointer
        transition-all duration-300 ease-out
        border hover:bg-zinc-800/80 hover:border-zinc-600/40
        ${
          isActive
            ? `bg-red-900/60 border-red-600/60 shadow-lg shadow-red-900/30 ${isFocused ? focus : ''}`
            : isFocused
              ? focus + ' bg-zinc-800/80'
              : 'bg-zinc-900/60 border-transparent'
        }
        ${isWatched && !isActive ? 'opacity-60 hover:opacity-90' : ''}
      `}
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
      {/* ── Thumbnail ── */}
      <div
        className="relative flex-shrink-0 w-40 h-24 rounded-lg overflow-hidden bg-zinc-800"
        onClick={() => onPlay(episode)}
      >
        {episode.thumbnail && !imgError ? (
          <img
            src={episode.thumbnail}
            alt={episode.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          /* fallback escuro com número do episódio */
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 gap-1">
            <span className="text-zinc-500 text-2xl max-md:text-xs uppercase tracking-widest">
              EP
            </span>
            <span
              className="text-white font-bold leading-none"
              style={{ fontSize: '2rem', fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              {String(episode.number).padStart(2, '0')}
            </span>
          </div>
        )}

        {/* Overlay play */}
        <div
          className={`absolute inset-0 bg-black/0 group-hover:bg-black/40 ${isActive && 'bg-black/40'} transition-colors duration-200 flex items-center justify-center`}
        >
          <div
            className={`opacity-0 group-hover:opacity-100 ${isActive && 'opacity-100'} transition-opacity duration-200
                          w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm
                          flex items-center justify-center border border-white/30`}
          >
            <svg className="w-4 h-4 text-white fill-white ml-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Barra de progresso */}
        {hasProgress && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700/80">
            <div
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Badge assistido */}
        {isWatched && (
          <div
            className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-sm
                          rounded-full px-1.5 py-0.5 flex items-center gap-1"
          >
            <svg
              className="w-3 h-3 text-green-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-green-400 text-[10px] font-medium">Assistido</span>
          </div>
        )}
      </div>

      {/* ── Info ── */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        {/* Topo: número + nome + duração */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-zinc-500 text-2xl max-md:text-xs font-mono tracking-wider">
                T{String(seasonNumber).padStart(2, '0')}-E{String(episode.number).padStart(2, '0')}
              </span>
              {episode.rating && <StartRating rating={Number(episode.rating).toFixed(1)} />}
            </div>
            <h4
              className={`font-semibold leading-snug truncate text-3xl max-md:text-lg text-white`}
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              {episode.name.replaceAll(
                `- S${String(seasonNumber).padStart(2, '0')}E${String(episode.number).padStart(2, '0')} -`,
                ''
              )}
            </h4>
          </div>

          {/* Duração */}
          {episode.duration && (
            <span className="flex-shrink-0 text-zinc-500 text-2xl max-md:text-xs mt-0.5">
              {formatTime(episode.duration)}
            </span>
          )}
        </div>

        {/* Plot com expand */}
        {episode.plot && (
          <div className="mt-1.5">
            <p
              className={`text-zinc-400 text-2xl max-md:text-xs leading-relaxed transition-all duration-300 text-justify
                ${expanded ? '' : 'line-clamp-2'}`}
            >
              {episode.plot}
            </p>
            {episode.plot.length > 120 && (
              <button
                className="text-zinc-500 hover:text-zinc-300 text-2xl max-md:text-xs mt-0.5 transition-colors"
                onClick={e => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
              >
                {expanded ? 'Ver menos ↑' : 'Ver mais ↓'}
              </button>
            )}
          </div>
        )}

        {/* Rodapé: data de exibição + progresso + ações */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            {episode.airDate && (
              <span className="text-zinc-600 text-2xl max-md:text-xs">{episode.airDate}</span>
            )}
            {hasProgress && (
              <span className="text-zinc-500 text-2xl max-md:text-xs">
                {progressPercent}% assistido
                {episode.duration && episode.progress && (
                  <> · resta {formatTime(episode.duration - episode.progress)}</>
                )}
              </span>
            )}
          </div>

          {/* Ações */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {/* Marcar como assistido */}
            {/* {onToggleWatched && (
              <button
                title={isWatched ? 'Marcar como não assistido' : 'Marcar como assistido'}
                className={`p-1.5 rounded-lg transition-colors duration-200
                  ${
                    isWatched
                      ? 'text-green-400 hover:text-green-300 hover:bg-green-900/30'
                      : 'text-zinc-500 hover:text-white hover:bg-zinc-700'
                  }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWatched(episode.id);
                }}
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )} */}

            {/* Botão play */}
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-2xl max-md:text-xs font-semibold
                         bg-red-600 hover:bg-red-500 text-white transition-colors duration-200"
              onClick={e => {
                e.stopPropagation();
                onPlay(episode);
              }}
            >
              <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              {hasProgress ? 'Continuar' : 'Assistir'}
            </button>
          </div>
        </div>
      </div>

      {/* Linha lateral colorida quando ativo */}
      {isActive && <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-red-500" />}
    </div>
  );
};

export default EpisodeCard;

// ─── Exemplo de uso ───────────────────────────────────────────────────────────
//
// <EpisodeCard
//   episode={ep}
//   seasonNumber={1}
//   onPlay={(ep) => navigate(`/player?url=${ep.streamUrl}`)}
//   onToggleWatched={(id) => toggleWatched(id)}
//   isActive={currentEpisodeId === ep.id}
// />
