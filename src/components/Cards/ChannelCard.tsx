/* eslint-disable @typescript-eslint/no-explicit-any */
import { Heart } from 'lucide-react';
import { useRef, useState } from 'react';
import type { Channel } from '../../types';
const placehoder = './placeholde.png';

interface ChannelCardProps {
  id?: string | number;
  channel: Channel;
  onPlay?: () => void;
  onFavoriteToggle?: (channel: Channel) => void;
  isFocused?: boolean;
  setlected?: boolean;
}

export const ChannelCard = ({
  id,
  channel,
  onPlay,
  isFocused,
  setlected,
  onFavoriteToggle
}: ChannelCardProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const handleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };
  const focus = 'scale-[1.01] bg-gray-700 shadow-lg shadow-red-600/40 ring-2 ring-red-600';

  return (
    <div className="relative flex items-center justify-between">
      <div
        id={`cd-${id}`}
        data-focused={isFocused ? 'true' : 'false'}
        className={`
        group
        relative 
        flex 
        w-full 
        overflow-hidden 
        transition-all 
        duration-200 
        rounded-lg
        items-center
        gap-3
        ${setlected ? ` bg-red-800 ${isFocused && focus}` : isFocused ? focus : 'bg-gray-800/80'}
        hover:scale-[1.01] hover:bg-gray-700 hover:shadow-lg hover:shadow-red-600/30
      `}
        onClick={() => {
          handleFullscreen();
          onPlay?.();
        }}
      >
        {/* Logo/Thumbnail */}
        <div className="bg-gray-700/50 flex-shrink-0 flex items-center justify-center rounded-l-lg">
          <img
            src={channel.logo}
            alt={channel.name}
            loading="lazy"
            decoding="async"
            className="w-25 h-25 max-md:w-15 max-md:h-15 object-contain p-2"
            onError={(e: any) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextElementSibling)
                e.currentTarget.nextElementSibling.style.display = 'flex';
            }}
          />
          <img
            className="
            hidden 
            w-25 h-25 max-md:w-15 max-md:h-15 object-contain p-2
          "
            src={placehoder}
          />
        </div>

        {/* Channel info */}
        <div className="flex-1 flex flex-col justify-center py-3 pr-2 text-left min-w-0">
          <h3 className="text-white text-2xl max-md:text-base font-semibold line-clamp-1 break-all">
            {channel.name}
          </h3>
        </div>

        {/* Favorite button */}
        <button
          onClick={e => {
            e.stopPropagation();
            onFavoriteToggle?.(channel);
          }}
          className={`
          flex-shrink-0 w-[100px] h-[100px] max-md:w-[60px] max-md:h-[60px]
          flex items-center justify-center
          rounded-r-lg transition-colors 
          bg-gray-700/30 hover:bg-gray-600 
          ${channel.isFavorite ? 'text-red-500' : 'text-gray-400'}
        `}
        >
          <Heart className={`w-6 h-6 ${channel.isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
};
