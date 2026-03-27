export function safeAtob(str?: string): string {
  if (!str) return ''
  try {
    return atob(str)
  } catch {
    return str
  }
}

export function formatTimeEpg(timestamp?: number): string {
  if (!timestamp) return ''
  return new Date(timestamp * 1000).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}