import { useState, useRef, useEffect } from 'react'
import type { Season } from '../../types'

interface SeasonSelectorProps {
  seasons: Season[]
  activeSeason: number
  onSeasonChange: (seasonNumber: number) => void
  currentEpisodeId?: string // para indicar qual temporada está ativa
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getSeasonProgress = (season: Season) => {
  if (!season.episodes.length) return { watched: 0, total: 0, percent: 0 }
  const watched = season.episodes.filter((ep) => ep.watched).length
  const total = season.episodes.length
  const percent = Math.round((watched / total) * 100)
  return { watched, total, percent }
}

const hasCurrentEpisode = (season: Season, currentEpisodeId?: string) =>
  season.episodes.some((ep) => ep.id === currentEpisodeId)

// ─── Component ────────────────────────────────────────────────────────────────

export const SeasonSelector = ({
  seasons,
  activeSeason,
  onSeasonChange,
  currentEpisodeId,
}: SeasonSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredSeason, setHoveredSeason] = useState<number | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  const active = seasons.find((s) => s.number === activeSeason) || seasons[0]

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Scroll para o item ativo quando abre
  useEffect(() => {
    if (isOpen && activeRef.current) {
      activeRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [isOpen])

  // Navegação por teclado (D-pad TV)
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.keyCode === 8) setIsOpen(false)
      if (e.key === 'ArrowDown' || e.keyCode === 40) {
        const next = seasons.find((s) => s.number > activeSeason)
        if (next) onSeasonChange(next.number)
      }
      if (e.key === 'ArrowUp' || e.keyCode === 38) {
        const prev = [...seasons].reverse().find((s) => s.number < activeSeason)
        if (prev) onSeasonChange(prev.number)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, activeSeason, seasons, onSeasonChange])

  if (!seasons.length) return null

  // ── Layout compacto para poucas temporadas (≤ 6) ──
  if (seasons.length <= 6) {
    return (
      <div
        className="flex items-center gap-2 flex-wrap"
        style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
      >
        <span className="text-zinc-500 text-sm mr-1">Temporada</span>
        {seasons.map((season) => {
          const { percent, watched, total } = getSeasonProgress(season)
          const isCurrent = hasCurrentEpisode(season, currentEpisodeId)
          const isActive = season.number === activeSeason

          return (
            <button
              key={season.number}
              onClick={() => onSeasonChange(season.number)}
              onMouseEnter={() => setHoveredSeason(season.number)}
              onMouseLeave={() => setHoveredSeason(null)}
              className={`
                relative group flex flex-col items-center justify-center
                w-12 h-12 rounded-xl font-bold text-sm
                transition-all duration-200 overflow-hidden
                border
                ${isActive
                  ? 'bg-red-600 border-red-500 text-white scale-110 shadow-lg shadow-red-900/40'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:border-zinc-500 hover:text-white'
                }
              `}
            >
              {/* Anel de progresso */}
              {percent > 0 && !isActive && (
                <svg
                  className="absolute inset-0 w-full h-full -rotate-90"
                  viewBox="0 0 48 48"
                >
                  <circle
                    cx="24" cy="24" r="21"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${(percent / 100) * 132} 132`}
                    className="text-green-500/60"
                  />
                </svg>
              )}

              <span className="relative z-10 leading-none">{season.number}</span>

              {/* Indicador de episódio atual */}
              {isCurrent && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2
                                w-1 h-1 rounded-full bg-red-400" />
              )}

              {/* Tooltip */}
              {hoveredSeason === season.number && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2
                                bg-zinc-900 border border-zinc-700 rounded-lg
                                px-2 py-1 text-xs text-zinc-300 whitespace-nowrap
                                pointer-events-none z-50 shadow-xl">
                  {watched}/{total} eps
                  {percent === 100 && (
                    <span className="text-green-400 ml-1">✓</span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  // ── Layout dropdown para muitas temporadas (> 6) ──
  const { watched, total, percent } = active ? getSeasonProgress(active) : { watched: 0, total: 0, percent: 0 }

  return (
    <div
      ref={dropdownRef}
      className="relative"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-3 px-4 py-2.5 rounded-xl
          border transition-all duration-200 min-w-[200px]
          ${isOpen
            ? 'bg-zinc-800 border-red-600/60 shadow-lg shadow-red-900/20'
            : 'bg-zinc-900 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800'
          }
        `}
      >
        {/* Info da temporada ativa */}
        <div className="flex-1 text-left">
          <div className="text-white text-sm font-semibold leading-none mb-0.5">
            {active?.name || `Temporada ${active?.number}`}
          </div>
          <div className="text-zinc-500 text-xs">
            {total} episódios
            {percent > 0 && (
              <span className="text-green-400 ml-1.5">· {percent}% assistido</span>
            )}
          </div>
        </div>

        {/* Mini barra de progresso */}
        {percent > 0 && (
          <div className="w-8 h-8 relative flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="12" fill="none" stroke="#27272a" strokeWidth="3" />
              <circle
                cx="16" cy="16" r="12"
                fill="none"
                stroke={percent === 100 ? '#22c55e' : '#ef4444'}
                strokeWidth="3"
                strokeDasharray={`${(percent / 100) * 75.4} 75.4`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center
                             text-[9px] font-bold text-zinc-300">
              {percent}%
            </span>
          </div>
        )}

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-zinc-400 transition-transform duration-200 flex-shrink-0
            ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[260px]
                        bg-zinc-900 border border-zinc-700 rounded-xl
                        shadow-2xl shadow-black/60 z-50
                        max-h-80 overflow-y-auto
                        scrollbar-thin scrollbar-track-zinc-800 scrollbar-thumb-zinc-600">

          {seasons.map((season, index) => {
            const { watched, total, percent } = getSeasonProgress(season)
            const isActive = season.number === activeSeason
            const isCurrent = hasCurrentEpisode(season, currentEpisodeId)

            return (
              <button
                key={season.number}
                ref={isActive ? activeRef : null}
                onClick={() => { onSeasonChange(season.number); setIsOpen(false) }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-left
                  transition-colors duration-150
                  ${index !== 0 ? 'border-t border-zinc-800' : ''}
                  ${isActive
                    ? 'bg-red-950/50 text-white'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }
                `}
              >
                {/* Número */}
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center
                  text-sm font-bold flex-shrink-0
                  ${isActive ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400'}
                `}>
                  {season.number}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium leading-none">
                      {season.name || `Temporada ${season.number}`}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] bg-red-600/20 text-red-400
                                       border border-red-600/30 rounded-full px-1.5 py-0.5
                                       font-medium uppercase tracking-wider">
                        Assistindo
                      </span>
                    )}
                    {percent === 100 && (
                      <svg className="w-3.5 h-3.5 text-green-400 flex-shrink-0" viewBox="0 0 24 24"
                           fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  {/* Barra de progresso */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1 bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500
                          ${percent === 100 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-zinc-500 text-xs flex-shrink-0">
                      {watched}/{total}
                    </span>
                  </div>
                </div>

                {/* Seta ativa */}
                {isActive && (
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SeasonSelector


// ─── Exemplo de uso ───────────────────────────────────────────────────────────
//
// const [activeSeason, setActiveSeason] = useState(1)
//
// <SeasonSelector
//   seasons={series.seasons}
//   activeSeason={activeSeason}
//   onSeasonChange={setActiveSeason}
//   currentEpisodeId={currentEpisode?.id}
// />
//
// // Exibir episódios da temporada ativa
// const currentSeasonEpisodes = series.seasons
//   .find(s => s.number === activeSeason)?.episodes ?? []
//
// {currentSeasonEpisodes.map(ep => (
//   <EpisodeCard key={ep.id} episode={ep} seasonNumber={activeSeason} ... />
// ))}
