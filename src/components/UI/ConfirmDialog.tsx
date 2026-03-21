import type { ReactNode } from "react"
import { Button } from "./Button"



interface ConfirmDialogProps {
  open: boolean
  icon?: ReactNode
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  confirmClassName?: string
  onConfirm: () => void
  onCancel: () => void
  isFocusedCancelar?: boolean
  isFocusedConfirmar?: boolean
}

export const ConfirmDialog = ({
  open,
  icon,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmClassName = 'bg-red-600 hover:bg-red-700',
  onConfirm,
  onCancel,
  isFocusedCancelar = false,
  isFocusedConfirmar = false,
}: ConfirmDialogProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-600 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          {icon && <div className="flex-shrink-0">{icon}</div>}
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>

        {/* Descrição */}
        <p className="text-gray-300 text-lg mb-6">{description}</p>

        {/* Ações */}
        <div className="flex justify-end gap-3">
          <Button
            onClick={onCancel}
            className="px-6 py-2.5 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors text-lg"
            isFocused={isFocusedCancelar}
            variant="secondary"
          >
            {cancelLabel}
          </Button>
          <Button
          isFocused={isFocusedConfirmar}
            onClick={onConfirm}
            className={`px-6 py-2.5 text-white rounded-lg transition-colors text-lg font-semibold ${confirmClassName}`}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog


// ─── Exemplo de uso ───────────────────────────────────────────────────────────
//
// import { RefreshCw } from 'lucide-react'
//
// <ConfirmDialog
//   open={confirmRefresh}
//   icon={<RefreshCw className="w-8 h-8 text-red-500" />}
//   title="Atualizar Conteúdo"
//   description="Deseja realmente atualizar todo o conteúdo do servidor? Isso pode levar alguns instantes."
//   confirmLabel="Atualizar"
//   cancelLabel="Cancelar"
//   onConfirm={() => { setConfirmRefresh(false); forceRefresh() }}
//   onCancel={() => setConfirmRefresh(false)}
// />
