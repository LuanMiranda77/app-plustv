import { Heart, Play } from 'lucide-react'
import { useFavoritesStore } from '../../store/favoritesStore'
import type { Channel } from '../../types'
import { useRef, useState } from 'react'

interface ChannelCardProps {
  channel: Channel
  onPlay?: () => void
}

export const ChannelCard = ({ channel, onPlay }: ChannelCardProps) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore()
  const isFav = isFavorite(String(channel.num))

  const toggleFavorite = () => {
    if (isFav) {
      removeFavorite(String(channel.num))
    } else {
      addFavorite(channel)
    }
  }
  const containerRef = useRef<HTMLDivElement>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const handleFullscreen = async () => {
    if (!containerRef.current) return

    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen()
          setIsFullscreen(true)
        }
      } else {
        if (document.fullscreenElement) {
          await document.exitFullscreen()
          setIsFullscreen(false)
        }
      }
    } catch (err) {
      console.error('Fullscreen error:', err)
    }
  }

  return (
    <div className='flex itens-center justify-between'>
      <button className="flex itens-center gap-2 relative w-full bg-gray-800 rounded-lg overflow-hidden hover:scale-101 transition-transform duration-200" onClick={()=>{handleFullscreen(); onPlay?.()}}>
        {/* Logo/Thumbnail */}
        <div className="aspect-video bg-gray-900">
          {channel.stream_icon ? (
            <img
              src={channel.stream_icon}
              alt={channel.name}
              className="w-[80px] h-[80px] object-cover group-hover:brightness-75 transition-brightness"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600">
              <span className="text-5xl">📺</span>
            </div>
          )}
        </div>
        <h3 className="text-white font-semibold text-xl-3 line-clamp-1 ml-3">
          {channel.name}
        </h3>
      </button>
      <button
        onClick={toggleFavorite}
        className={`px-3 py-1.5 rounded transition-colors ${isFav
          ? 'bg-red-600 text-white'
          : 'bg-gray-600/50 text-gray-300 hover:bg-gray-600'
          }`}
      >
        <Heart className="w-4 h-4 fill-current" />
      </button>
    </div>
  )
}
