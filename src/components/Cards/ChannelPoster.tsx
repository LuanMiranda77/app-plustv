import { Radio } from 'lucide-react';
import type { Channel } from '../../types';

interface ChannelPosterProps {
  channel: Channel;
  onPlay?: () => void;
  isFocused?: boolean;
}

export const ChannelPoster = ({ channel, onPlay, isFocused }: ChannelPosterProps) => {
  return (
    <button
      data-focused={isFocused ? 'true' : 'false'}
      onClick={onPlay}
      className={`group relative bg-gray-800 rounded-xl overflow-hidden w-full
        transition-all duration-200
        ${isFocused ? 'scale-105 ring-2 ring-red-600 shadow-lg shadow-red-600/30' : 'hover:scale-105 hover:shadow-lg hover:shadow-red-600/20'}
      `}
    >
      {/* Logo area */}
      <div className="aspect-[6/3] bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center p-3">
        {channel.logo ? (
          <img
            src={channel.logo}
            alt={channel.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain group-hover:brightness-110 transition-all duration-200"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.style.display = 'none';
              const sibling = e.currentTarget.nextElementSibling as HTMLElement;
              if (sibling) sibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="w-full h-full items-center justify-center text-gray-500"
          style={{ display: channel.logo ? 'none' : 'flex' }}
        >
          <Radio className="w-8 h-8" />
        </div>
      </div>

      {/* Channel name */}
      <div className="px-2 py-2 bg-gray-800/90">
        <h3 className="text-white text-2xl max-md:text-xs font-semibold truncate text-center" title={channel.name}>
          {channel.name}
        </h3>
      </div>

      {/* Live badge */}
      <div className="absolute opacity-80 top-1 right-1 flex items-center gap-1 bg-red-600/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
        AO VIVO
      </div>
    </button>
  );
};
