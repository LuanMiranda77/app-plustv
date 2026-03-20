import type { Episode } from '../../types';

type Props = {
  isFocused: boolean;
  disabled?: boolean;
  streamId?: string;
  onClick: () => void;
  nextEpisode?: Episode;
};

export default function ButtonPlay({ isFocused, disabled, streamId, nextEpisode,  onClick }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-2.5 px-8 py-3 rounded-xl font-semibold text-2xl max-md:text-sm
        transition-all duration-200 shadow-lg
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
        ${
          isFocused
            ? 'bg-red-500 text-white shadow-red-900/80 scale-105 ring-1 ring-red-400'
            : 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/40 hover:shadow-red-900/60 hover:scale-105'
        }
      `}
    >
      <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
      {streamId ? 'Continuar' : 'Assistir'}
      {nextEpisode && (
        <span className="text-red-200 font-normal text-xl max-md:text-xs">
          E{String(nextEpisode?.number).padStart(2, '0')}
        </span>
      )}
    </button>
  );
}
