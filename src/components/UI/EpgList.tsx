import { useRef, useEffect } from 'react'

interface EpgProgram {
  start_timestamp?: number
  stop_timestamp?: number
  title?: string
  NAME?: string
  description?: string
}

interface EpgListProps {
  epgList: EpgProgram[]
  isZoneEpg?: boolean
  focusedEpgIndex?: number
  isLoadingEpg?: boolean
}

function safeAtob(str?: string): string {
  if (!str) return ''
  try {
    return atob(str)
  } catch {
    return str
  }
}

function formatTime(timestamp?: number): string {
  if (!timestamp) return ''
  return new Date(timestamp * 1000).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function EpgList({
  epgList,
  isZoneEpg = false,
  focusedEpgIndex = -1,
  isLoadingEpg = false,
}: EpgListProps) {
  const epgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!epgRef.current || focusedEpgIndex < 0) return
    const focused = epgRef.current.querySelector('[data-focused="true"]')
    focused?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [focusedEpgIndex])

  if (epgList.length === 0) return null

  return (
    <section className="w-full max-w-7xl mt-6">
      {/* Header */}
      <div
        className={`border-b text-2xl font-semibold line-clamp-1 pb-2 ${
          isZoneEpg ? 'border-red-600 text-red-500' : 'border-gray-800'
        }`}
      >
        <h4>
          📺 Programação do Canal{' '}
          {isZoneEpg && (
            <span className="text-sm text-gray-400 font-normal">
              ← → para navegar
            </span>
          )}
        </h4>
      </div>

      {/* List */}
      <div
        ref={epgRef}
        className="space-y-2 mt-3 max-h-[calc(100vh-900px)] overflow-y-auto"
      >
        {/* Loading */}
        {isLoadingEpg && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600" />
          </div>
        )}

        {/* Programs */}
        {!isLoadingEpg &&
          epgList.map((program, idx) => {
            const startTime = formatTime(program.start_timestamp)
            const endTime = formatTime(program.stop_timestamp)
            const isFocused = isZoneEpg && focusedEpgIndex === idx
            const title =
              safeAtob(program.title) || safeAtob(program.NAME) || 'Sem título'
            const description = safeAtob(program.description)

            return (
              <div
                key={idx}
                data-focused={isFocused}
                className={`p-3 rounded border transition ${
                  isFocused
                    ? 'bg-red-600/20 border-red-600 ring-1 ring-red-600'
                    : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Time */}
                  <div className="text-2xl max-md:text-sm font-mono text-red-500 flex-shrink-0 min-w-max">
                    {startTime && endTime ? `${startTime} - ${endTime}` : ''} ➜
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <p className="text-left text-2xl max-md:text-sm font-medium text-gray-100 line-clamp-1">
                      {title}
                    </p>
                    {description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
      </div>
    </section>
  )
}
