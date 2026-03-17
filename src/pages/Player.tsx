import { ArrowLeft, Copy, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { StreamDebugger } from '../components/Debug/StreamDebugger'
import { VideoPlayer } from '../components/Player/VideoPlayer'
import { Button } from '../components/UI/Button'
import { Input } from '../components/UI/Input'
import { useAuthStore } from '../store/authStore'

export const Player = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [testUrl, setTestUrl] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const { serverConfig } = useAuthStore()
  const [currentStream, setCurrentStream] = useState<{
    url: string
    title: string
    poster?: string
    type?: string
  } | null>(null)

  // Pegar streamUrl do state ou como query param
  useEffect(() => {
    const state = location.state as any
    const server = serverConfig?.url
    const username = serverConfig?.username
    const password = serverConfig?.password
    if (state?.stream_id) {
      const streamId = state.stream_id
      const extension = state.extension
      const streamType = state.type
      const streamUrl = `${server}/${streamType}/${username}/${password}/${streamId}.${extension}`
      setCurrentStream({
        url: streamUrl,
        title: state.title || 'Reproduzindo',
        poster: state.poster,
        type: state.type || 'live',
      })
      console.log('Stream URL:', state.stream_id)
    }
  }, [location])

  // URLs de teste (exemplos com streams públicos)
  const testStreams = [
    {
      id: 'test-hls',
      title: 'Teste HLS (Big Buck Bunny)',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
      poster: 'https://via.placeholder.com/1280x720?text=Big+Buck+Bunny',
    },
    {
      id: 'test-tears',
      title: 'Teste Stream (Tears of Steel)',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/TearsOfSteel.mp4',
      poster: 'https://via.placeholder.com/1280x720?text=Tears+of+Steel',
    },
    {
      id: 'test-hls-vod',
      title: 'HLS Live Test',
      url: 'https://test-streams.mux.dev/x36xhzz/x3zzv.m3u8',
      poster: 'https://via.placeholder.com/1280x720?text=Mux+Stream',
    },
  ]

  const handlePlayStream = (stream: (typeof testStreams)[0]) => {
    setCurrentStream({
      url: stream.url,
      title: stream.title,
      poster: stream.poster,
    })
  }

  const handleCustomUrl = (e: React.FormEvent) => {
    e.preventDefault()
    if (!testUrl.trim()) return

    setCurrentStream({
      url: testUrl,
      title: testUrl.split('/').pop() || 'Stream Customizado',
      type: 'custom',
    })
    setShowUrlInput(false)
  }

  const copyUrlToClipboard = () => {
    if (currentStream?.url) {
      navigator.clipboard.writeText(currentStream.url)
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
    }
  }

  return currentStream && (
    <div className="min-h-screen  bg-black flex flex-col">
      {/* Back button */}
      <div className="flex itens-center absolute top-4 left-4 z-10">
        <button
          onClick={() => { navigate('/live'); setCurrentStream(null); }}
          className="flex items-center gap-2 text-white hover:text-red-600 transition-colors p-2 rounded hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>
      </div>

      {/* Player */}
      <div className="flex-1 flex items-center justify-center">
        <VideoPlayer
          source={currentStream.url}
          poster={currentStream.poster}
          autoPlay
          onError={(error) => {
            console.error('Erro no player:', error)
          }}
        />
      </div>

      {/* Info com URL Debug */}
      {/* <div className="bg-gray-900 p-4 border-t border-gray-800 max-h-48 overflow-y-auto">
          <h2 className="text-white font-semibold mb-2">{currentStream.title}</h2>
          <div className="space-y-2">
            <div>
              <p className="text-gray-400 text-xs mb-1">URL Completa:</p>
              <p className="text-gray-300 text-xs font-mono break-all bg-gray-950 p-2 rounded border border-gray-700">
                {currentStream.url}
              </p>
            </div>
            {currentStream.type && (
              <div>
                <p className="text-gray-400 text-xs">Tipo: <span className="text-gray-300">{currentStream.type}</span></p>
              </div>
            )}
          </div>
        </div> */}

      {/* Stream Debugger */}
      {/* <StreamDebugger
          streamInfo={{
            url: currentStream.url,
            type: currentStream.type as any,
            title: currentStream.title,
          }}
        /> */}
    </div>
  )
}
