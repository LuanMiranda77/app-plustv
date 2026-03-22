import { Check, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { ServerConfig } from '../../types';
import { Input } from './Input';

interface FormServerProps {
  formData: ServerConfig;
  errors: Partial<ServerConfig>;
  editingId: string | null;
  formFocusIndex: number;
  isInputActive: boolean;
  onChange: (data: ServerConfig) => void;
  onSave: () => void;
  onCancel: () => void;
  onAdvance?: () => void;
}

export default function FormServer({
  formData,
  errors,
  editingId,
  formFocusIndex,
  isInputActive,
  onChange,
  onSave,
  onCancel,
  onAdvance,
}: FormServerProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isInputActive && formFocusIndex <= 3) {
      // Focar o input atual
      inputRefs.current[formFocusIndex]?.focus()
    } else {
      // ✅ isInputActive desligou ou foi para botão — blur em todos
      inputRefs.current.forEach(ref => ref?.blur())
    }
  }, [formFocusIndex, isInputActive])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      e.preventDefault()
      onAdvance?.()
    }
  }

  const isFieldFocused = (index: number) =>
    formFocusIndex === index && !isInputActive

  return (
    <div className="bg-gray-800/80 border border-gray-700 rounded-xl px-6 mb-8">
      <h2 className="text-xl font-semibold text-white mb-4 pt-4">
        {editingId ? 'Editar Servidor' : 'Adicionar Servidor'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          ref={el => { inputRefs.current[0] = el }}
          label="Nome" type="text"
          value={formData.name} placeholder="Ex: Meu Servidor"
          error={errors.name}
          onChange={e => onChange({ ...formData, name: e.target.value })}
          onKeyDown={handleKeyDown}
          className={isFieldFocused(0) ? 'border-red-500 ring-2 ring-red-500' : ''}
        />
        <Input
          ref={el => { inputRefs.current[1] = el }}
          label="URL do Servidor" type="text"
          value={formData.url} placeholder="http://servidor.com:8080"
          error={errors.url}
          onChange={e => onChange({ ...formData, url: e.target.value })}
          onKeyDown={handleKeyDown}
          className={isFieldFocused(1) ? 'border-red-500 ring-2 ring-red-500' : ''}
        />
        <Input
          ref={el => { inputRefs.current[2] = el }}
          label="Usuário" type="text"
          value={formData.username} placeholder="Usuário"
          error={errors.username}
          onChange={e => onChange({ ...formData, username: e.target.value })}
          onKeyDown={handleKeyDown}
          className={isFieldFocused(2) ? 'border-red-500 ring-2 ring-red-500' : ''}
        />
        <Input
          ref={el => { inputRefs.current[3] = el }}
          label="Senha" type="password"
          value={formData.password} placeholder="Senha"
          error={errors.password}
          onChange={e => onChange({ ...formData, password: e.target.value })}
          onKeyDown={handleKeyDown}
          className={isFieldFocused(3) ? 'border-red-500 ring-2 ring-red-500' : ''}
        />
      </div>

      <div className="flex justify-end gap-3 mt-6 pb-4">
        <button
          onClick={onCancel}
          className={`flex items-center gap-2 px-5 py-2 bg-gray-600 hover:bg-gray-500
                      text-white rounded-lg transition-colors
                      ${formFocusIndex === 4 ? 'ring-2 ring-red-500 scale-105' : ''}`}
        >
          <X className="w-4 h-4" /> Cancelar
        </button>
        <button
          onClick={onSave}
          className={`flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700
                      text-white rounded-lg transition-colors
                      ${formFocusIndex === 5 ? 'ring-2 ring-red-500 scale-105' : ''}`}
        >
          <Check className="w-4 h-4" />
          {editingId ? 'Salvar Alterações' : 'Adicionar'}
        </button>
      </div>
    </div>
  )
}
