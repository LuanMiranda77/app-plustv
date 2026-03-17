import { ChevronDown, ChevronUp, Copy } from 'lucide-react'
import { useState } from 'react'

interface StreamInfo {
  url: string
  type?: 'live' | 'movie' | 'series' | 'custom'
  title?: string
  status?: 'working' | 'error' | 'unknown'
  error?: string
}

interface StreamDebuggerProps {
  streamInfo: StreamInfo
}

export const StreamDebugger = ({ streamInfo }: StreamDebuggerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(streamInfo.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const testUrl = async () => {
    try {
      const response = await fetch(streamInfo.url, { method: 'HEAD' })
      console.log(`URL ${streamInfo.type} test:`, response.status)
    } catch (error) {
      console.error(`URL ${streamInfo.type} test failed:`, error)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-gray-900 border border-gray-700 rounded-t-lg p-3 hover:bg-gray-800 transition-colors"
      >
        <span className="text-xs font-semibold text-gray-400">🔍 Debug Stream</span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div className="bg-gray-950 border border-t-0 border-gray-700 rounded-b-lg p-4 space-y-3 text-xs">
          {/* Stream Type */}
          {streamInfo.type && (
            <div>
              <p className="text-gray-500 mb-1">Tipo:</p>
              <p className="text-gray-300 font-mono">{streamInfo.type}</p>
            </div>
          )}

          {/* URL Completa */}
          <div>
            <p className="text-gray-500 mb-1">URL:</p>
            <div className="bg-gray-900 p-2 rounded border border-gray-700 max-h-20 overflow-y-auto">
              <p className="text-gray-300 font-mono break-all whitespace-pre-wrap">{streamInfo.url}</p>
            </div>
          </div>

          {/* URL Breakdown */}
          {streamInfo.type && ['live', 'movie', 'series'].includes(streamInfo.type) && (
            <div>
              <p className="text-gray-500 mb-1">Partes da URL:</p>
              <div className="bg-gray-900 p-2 rounded border border-gray-700 space-y-1">
                {UrlBreakdown(streamInfo.url, streamInfo.type)}
              </div>
            </div>
          )}

          {/* Error */}
          {streamInfo.error && (
            <div className="bg-red-900/20 border border-red-800 rounded p-2">
              <p className="text-red-400 text-xs">{streamInfo.error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="flex-1 flex items-center justify-center gap-1 bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded transition-colors"
            >
              <Copy className="w-3 h-3" />
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
            <button
              onClick={testUrl}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded transition-colors"
            >
              Testar
            </button>
          </div>

          {/* Help */}
          <div className="bg-blue-900/20 border border-blue-800 rounded p-2">
            <p className="text-blue-300 text-xs leading-relaxed">
              Se o stream não funciona:
              <br />
              1. Verifique a URL completa acima
              <br />
              2. Teste a URL em um player VLC
              <br />
              3. Verifique as credenciais do servidor
              <br />
              4. Confira se o conteúdo está disponível
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function UrlBreakdown(url: string, type: string) {
  try {
    const urlObj = new URL(url)
    const parts = urlObj.pathname.split('/').filter(Boolean)

    const breakdown = {
      live: {
        servidor: urlObj.origin,
        tipo: '/live',
        username: parts[1],
        password: parts[2],
        streamId: parts[3],
      },
      movie: {
        servidor: urlObj.origin,
        tipo: '/movie',
        username: parts[1],
        password: parts[2],
        streamId: parts[3],
      },
      series: {
        servidor: urlObj.origin,
        tipo: '/series',
        username: parts[1],
        password: parts[2],
        streamId: parts[3],
      },
    }

    const info = breakdown[type as keyof typeof breakdown]

    return (
      <>
        <div className="flex justify-between">
          <span className="text-gray-500">Servidor:</span>
          <span className="text-gray-300 font-mono">{info.servidor}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Tipo:</span>
          <span className="text-gray-300 font-mono">{info.tipo}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Username:</span>
          <span className="text-gray-300 font-mono">{info.username || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Password:</span>
          <span className="text-gray-300 font-mono">{'*'.repeat((info.password || '').length)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Stream ID:</span>
          <span className="text-gray-300 font-mono">{info.streamId || 'N/A'}</span>
        </div>
      </>
    )
  } catch (error) {
    return <p className="text-red-400">Erro ao decompor URL</p>
  }
}
