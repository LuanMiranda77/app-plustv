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
    const server   = serverConfig?.url
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

  if (currentStream) {
    return (
      <div className="min-h-screen  bg-black flex flex-col">
        {/* Back button */}
        <div className="flex itens-center absolute top-4 left-4 z-10">
          <button
            onClick={() => {navigate('/live');setCurrentStream(null); }}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Teste do Player</h1>
            <p className="text-gray-400">
              Selecione um stream de teste para visualizar o player HLS.js em ação
            </p>
          </div>
          <button
            onClick={() => navigate('/profiles')}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded hover:bg-gray-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Test Streams */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {testStreams.map((stream) => (
            <div
              key={stream.id}
              className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden hover:border-red-600/50 transition-colors"
            >
              <div className="aspect-video bg-gray-900 overflow-hidden">
                <img
                  src={stream.poster}
                  alt={stream.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold mb-3 line-clamp-2">
                  {stream.title}
                </h3>
                <Button
                  onClick={() => handlePlayStream(stream)}
                  size="sm"
                  className="w-full"
                >
                  Reproduzir
                </Button>
              </div>
            </div>
          ))}

          {/* Custom URL Card */}
          <div className="bg-gray-800/30 border-2 border-dashed border-gray-700 rounded-lg p-4 flex flex-col items-center justify-center hover:border-red-600 transition-colors">
            <p className="text-gray-400 text-sm mb-4">URL Customizada</p>
            <Button
              variant="secondary"
              onClick={() => setShowUrlInput(!showUrlInput)}
            >
              {showUrlInput ? 'Cancelar' : 'Adicionar'}
            </Button>
          </div>
        </div>

        {/* Custom URL Form */}
        {showUrlInput && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-10">
            <form onSubmit={handleCustomUrl} className="space-y-4">
              <Input
                type="url"
                placeholder="https://seu-stream.m3u8 ou .mp4"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                label="URL do Stream"
              />
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={!testUrl.trim()}
                  className="flex-1"
                >
                  Reproduzir
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowUrlInput(false)
                    setTestUrl('')
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Info */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
          <h3 className="text-white font-semibold mb-3">Recursos do Player</h3>
          <ul className="text-gray-400 text-sm space-y-2">
            <li>✅ Suporte a HLS.js (M3U8) e MP4</li>
            <li>✅ Controles customizados (play, volume, fullscreen)</li>
            <li>✅ Qualidade adaptativa</li>
            <li>✅ Atalhos de teclado (Espaço, F, M, Setas)</li>
            <li>✅ Compatível com Android TV e LG webOS</li>
            <li>✅ Auto-hide de controles</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
