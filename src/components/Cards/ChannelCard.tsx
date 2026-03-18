/* eslint-disable @typescript-eslint/no-explicit-any */
import { Heart } from 'lucide-react';
import { useRef, useState } from 'react';
import { useFavoritesStore } from '../../store/favoritesStore';
import type { Channel } from '../../types';

interface ChannelCardProps {
  id: string | number;
  channel: Channel;
  onPlay?: () => void;
}

export const ChannelCard = ({ id, channel, onPlay }: ChannelCardProps) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const isFav = isFavorite(String(channel.id));

  const toggleFavorite = () => {
    if (isFav) {
      removeFavorite(String(channel.id));
    } else {
      addFavorite(channel);
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
        className="
        group
        relative flex 
        flex-col w-full 
        overflow-hidden 
        transition-transform 
        duration-200 bg-gray-800 
        rounded-lg itens-center 
        hover:scale-105
      "
        onClick={() => {
          handleFullscreen();
          onPlay?.();
        }}
      >
        {/* Logo/Thumbnail */}
        <h3
          className="font-semibold text-white text-2xl line-clamp-1 
          group-focus:ring-2 group-focus:bg-red-600 group-focus:ring-offset-2 group-focus:ring-offset-gray-800
          group-hover:ring-2 group-hover:bg-red-600 group-hover:ring-offset-2 group-hover:ring-offset-gray-800
          "
        >
          {channel.name}
        </h3>
        <div className="bg-gray-900 aspect-video flex items-center justify-center">
          <img
            src={channel.logo??'/placeholder.png'}
            alt={channel.name}
            className="max-w-[350px] h-[150px] object-cover group-hover:brightness-75 transition-brightness"
            // className="object-contain w-auto h-auto max-w-full max-h-full"
            onError={(e: any) => {
              // fallback se imagem quebrar
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling.style.display = 'flex';
            }}
          />
        </div>
      </button>
      <button
        onClick={toggleFavorite}
        className={`absolute right-0 bottom-0 px-3 py-1.5 rounded transition-colors ${
          isFav ? 'bg-red-600 text-white' : 'bg-gray-600/50 text-gray-300 hover:bg-gray-600'
        }`}
      >
        <Heart className="w-4 h-4 fill-current" />
      </button>
    </div>
  );
};
