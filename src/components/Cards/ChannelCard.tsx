/* eslint-disable @typescript-eslint/no-explicit-any */
import { Heart } from 'lucide-react';
import { useRef, useState } from 'react';
import { useFavoritesStore } from '../../store/favoritesStore';
import type { Channel } from '../../types';

interface ChannelCardProps {
  id?: string | number;
  channel: Channel;
  onPlay?: () => void;
  isFocused?: boolean;
}

export const ChannelCard = ({ id, channel, onPlay, isFocused }: ChannelCardProps) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const isFav = isFavorite(String(channel.id));

  const toggleFavorite = () => {
    if (isFav) {
      removeFavorite(String(channel.id));
    } else {
      addFavorite(channel, 'live');
    }
  };
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

  return (
    <div className="relative flex items-center justify-between">
      <button
        id={`cd-${id}`}
        className={`
        group
        relative 
        flex items-start
        w-full 
        overflow-hidden 
        transition-all 
        duration-200 bg-gray-800 
        rounded-tl rounded-bl
        items-center
        ${isFocused ? 'scale-105 shadow-lg shadow-red-600/50' : ''}
        hover:scale-105
      `}
        onClick={() => {
          handleFullscreen();
          onPlay?.();
        }}
      >
        {/* Logo/Thumbnail */}
        <div className="bg-gray-600/50 hover:bg-gray-600 aspect-video flex items-center justify-center z-40">
          <img
            src={channel.logo ?? '/placeholder.png'}
            alt={channel.name}
            loading="lazy" // carrega só quando visível
            decoding="async" // não bloqueia render
            className="max-w-[80px] h-[80px] max-md:max-w-[50px] max-md:h-[50px]  object-contain group-hover:brightness-75 transition-brightness p-1"
            onError={(e: any) => {
              // fallback se imagem quebrar
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling.style.display = 'flex';
            }}
          />
        </div>
        <h3
          className={`
          text-white text-4xl max-md:text-lg
          w-full h-[80px] max-md:h-[50px] text-left font-semibold 
          flex items-center line-clamp-1 px-2 break-all
          transition-all duration-200
          ${isFocused ? 'bg-red-600 ring-2 ring-red-500 ring-offset-2 ring-offset-gray-800' : 'group-hover:ring-2 group-hover:bg-red-600 group-hover:ring-offset-2 group-hover:ring-offset-gray-800'}
          `}
        >
          {channel.name}
        </h3>
      </button>
      <button
        onClick={toggleFavorite}
        className={`
          max-w-[80px] h-[80px] max-md:max-w-[50px] max-md:h-[50px] 
          px-3 py-1.5 rounded-tr rounded-br transition-colors 
          bg-gray-600/50 hover:bg-gray-600 
          ${isFav ? 'text-netflix-red ' : ' text-gray-300 '}
        `}
      >
        <Heart className="w-5 h-5 fill-current" />
      </button>
    </div>
  );
};
