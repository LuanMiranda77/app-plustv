import { useEffect, useRef } from 'react'
import { useWatchHistoryStore } from '../store/watchHistoryStore'
import type { Channel, Movie, Series } from '../types'
import { useAuthStore } from '../store/authStore'

interface UseVideoTrackingProps {
  videoRef: React.RefObject<HTMLVideoElement>
  content: Movie | Series | Channel
  contentType: 'movie' | 'series' | 'channel'
  enabled?: boolean
}

/**
 * Hook para rastrear o progresso de vídeos e armazenar no histórico de visualização
 * Atualiza automaticamente o histórico a cada 10 segundos ou quando o vídeo termina
 */
export const useVideoTracking = ({
  videoRef,
  content,
  contentType,
  enabled = true,
}: UseVideoTrackingProps) => {
  const { addToHistory } = useWatchHistoryStore()
    const {serverConfig} = useAuthStore();
  const updateIntervalRef = useRef<any | null>(null)

  useEffect(() => {
    if (!enabled || !videoRef.current) return

    const video = videoRef.current

    const startTracking = () => {
      // Update history every 10 seconds
      updateIntervalRef.current = setInterval(() => {
        if (video.duration && video.currentTime > 0) {
          addToHistory(
            {
              id: content.id,
              type: contentType,
              name:
                contentType === 'channel'
                  ? (content as Channel).name
                  : (content as Movie | Series).name,
              poster: contentType !== 'channel' ? (content as Movie | Series).poster : undefined,
              logo: contentType === 'channel' ? (content as Channel).logo : undefined,
              progress: Math.round((video.currentTime / video.duration) * 100),
              duration: Math.round(video.duration),
              watched: Math.round(video.currentTime),
              lastWatched: new Date(),
              content
            },
            serverConfig!
          );
        }
      }, 10000) // Every 10 seconds
    }

    const stopTracking = () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
        updateIntervalRef.current = null
      }
    }

    const handleEnded = () => {
      // Mark as fully watched
      addToHistory(
        {
          id: content.id,
          type: contentType,
          name:
            contentType === 'channel'
              ? (content as Channel).name
              : (content as Movie | Series).name,
          poster: contentType !== 'channel' ? (content as Movie | Series).poster : undefined,
          logo: contentType === 'channel' ? (content as Channel).logo : undefined,
          progress: 100,
          duration: Math.round(video.duration),
          watched: Math.round(video.duration),
          lastWatched: new Date(),
          content
        },
        serverConfig!
      );
      stopTracking()
    }

    video.addEventListener('play', startTracking)
    video.addEventListener('pause', stopTracking)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('play', startTracking)
      video.removeEventListener('pause', stopTracking)
      video.removeEventListener('ended', handleEnded)
      stopTracking()
    }
  }, [enabled, content, contentType, videoRef, addToHistory])
}
