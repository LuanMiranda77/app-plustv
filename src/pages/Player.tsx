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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const state = location.state as any
    // const server = serverConfig?.url
    // const username = serverConfig?.username
    // const password = serverConfig?.password
    if (state?.streamUrl) {
      // const streamId = state.stream_id
      // const extension = state.extension
      // const streamType = state.type
      // const streamUrl = `${server}/${streamType}/${username}/${password}/${streamId}.${extension}`
      setCurrentStream({
        url: state.streamUrl,
        title: state.title || 'Reproduzindo',
        poster: state.poster,
        type: state.type || 'live',
      })
      console.log('Stream URL:', state.streamUrl)
    }
  }, [location])

  return currentStream && (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Back button */}
      <div className="absolute z-10 flex itens-center top-4 left-4">
        <button
          onClick={() => { navigate('/live'); setCurrentStream(null); }}
          className="flex items-center gap-2 p-2 text-white transition-colors rounded hover:text-red-600 hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>
      </div>

      {/* Player */}
      <div className="flex items-center justify-center flex-1">
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
      {/* <div className="p-4 overflow-y-auto bg-gray-900 border-t border-gray-800 max-h-48">
          <h2 className="mb-2 font-semibold text-white">{currentStream.title}</h2>
          <div className="space-y-2">
            <div>
              <p className="mb-1 text-xs text-gray-400">URL Completa:</p>
              <p className="p-2 font-mono text-xs text-gray-300 break-all border border-gray-700 rounded bg-gray-950">
                {currentStream.url}
              </p>
            </div>
            {currentStream.type && (
              <div>
                <p className="text-xs text-gray-400">Tipo: <span className="text-gray-300">{currentStream.type}</span></p>
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
