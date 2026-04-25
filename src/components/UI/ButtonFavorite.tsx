import { Heart } from 'lucide-react';

type Props = {
  isFav?: boolean;
  isFocused: boolean;
  isLoading?: boolean;
  onClick: () => void;
};

export default function ButtonFavorite({ isFav, isFocused, onClick, isLoading }: Props) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-3 rounded-xl text-2xl max-md:text-sm font-medium
        transition-all duration-200 border
        ${
          isFocused
            ? 'scale-105 ring-1 ring-red-500 border-red-600 text-white'
            : isFav
              ? 'bg-red-950/60 border-red-600/60 text-red-400 hover:bg-red-950'
              : 'bg-white/10 border-white/10 text-zinc-300 hover:bg-white/20 hover:text-white'
        }
      `}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      ) : (
        <Heart
          className={`
          w-8 h-8 max-md:w-5 max-md:h-5 transition-all duration-200
          ${isFocused || isFav ? 'stroke-red-500 fill-red-500' : 'fill-none stroke-current'}
        `}
          strokeWidth={2}
        />
      )}
      {/* {isFav ? 'Favoritado' : 'Favoritar'} */}
    </button>
  );
}
