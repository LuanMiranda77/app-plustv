import { useRef } from 'react'
import { X, Check } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ServerFormData {
  name: string
  url: string
  username: string
  password: string
}

export interface ServerFormErrors {
  name?: string
  url?: string
  username?: string
  password?: string
}

interface ServerFormProps {
  formData: ServerFormData
  errors?: ServerFormErrors
  editingId?: string | null
  formFocusIndex?: number
  isInputActive?: boolean
  onChange: (data: ServerFormData) => void
  onSave: () => void
  onCancel: () => void
  onInputRefsReady?: (refs: Array<HTMLInputElement | null>) => void
}

// ─── Sub-componente: campo de input ──────────────────────────────────────────

interface FieldProps {
  label: string
  value: string
  placeholder: string
  type?: string
  error?: string
  isFocused: boolean
  inputRef: (el: HTMLInputElement | null) => void
  onChange: (value: string) => void
}

const Field = ({
  label,
  value,
  placeholder,
  type = 'text',
  error,
  isFocused,
  inputRef,
  onChange,
}: FieldProps) => (
  <div>
    <label className="block text-gray-400 text-2xl max-sm:text-sm mb-1">
      {label}
    </label>
    <input
      ref={inputRef}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`
        w-full bg-gray-900 border text-white px-4 py-2.5 rounded-lg
        focus:border-red-600 focus:outline-none transition-colors
        ${isFocused ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-600'}
      `}
    />
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
)

// ─── Component ────────────────────────────────────────────────────────────────

export const ServerForm = ({
  formData,
  errors = {},
  editingId,
  formFocusIndex = -1,
  isInputActive = false,
  onChange,
  onSave,
  onCancel,
  onInputRefsReady,
}: ServerFormProps) => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const setRef = (index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el
    if (onInputRefsReady) onInputRefsReady(inputRefs.current)
  }

  const isFieldFocused = (index: number) =>
    formFocusIndex === index && !isInputActive

  const fields: Array<{
    key: keyof ServerFormData
    label: string
    placeholder: string
    type?: string
    index: number
  }> = [
    { key: 'name',     label: 'Nome',           placeholder: 'Ex: Meu Servidor',         index: 0 },
    { key: 'url',      label: 'URL do Servidor', placeholder: 'http://servidor.com:8080', index: 1 },
    { key: 'username', label: 'Usuário',         placeholder: 'Usuário',                  index: 2 },
    { key: 'password', label: 'Senha',           placeholder: 'Senha', type: 'password',  index: 3 },
  ]

  return (
    <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-6 mb-8">

      {/* Título */}
      <h2 className="text-xl font-semibold text-white mb-4">
        {editingId ? 'Editar Servidor' : 'Adicionar Servidor'}
      </h2>

      {/* Campos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(({ key, label, placeholder, type, index }) => (
          <Field
            key={key}
            label={label}
            value={formData[key]}
            placeholder={placeholder}
            type={type}
            error={errors[key]}
            isFocused={isFieldFocused(index)}
            inputRef={setRef(index)}
            onChange={(value) => onChange({ ...formData, [key]: value })}
          />
        ))}
      </div>

      {/* Ações */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onCancel}
          className={`
            flex items-center gap-2 px-5 py-2
            bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors
            ${formFocusIndex === 4 ? 'ring-2 ring-red-500 scale-105' : ''}
          `}
        >
          <X className="w-4 h-4" />
          Cancelar
        </button>

        <button
          onClick={onSave}
          className={`
            flex items-center gap-2 px-5 py-2
            bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors
            ${formFocusIndex === 5 ? 'ring-2 ring-red-500 scale-105' : ''}
          `}
        >
          <Check className="w-4 h-4" />
          {editingId ? 'Salvar Alterações' : 'Adicionar'}
        </button>
      </div>
    </div>
  )
}

export default ServerForm


// ─── Exemplo de uso ───────────────────────────────────────────────────────────
//
// const [formData, setFormData] = useState<ServerFormData>({
//   name: '', url: '', username: '', password: ''
// })
// const [errors, setErrors] = useState<ServerFormErrors>({})
// const [formFocusIndex, setFormFocusIndex] = useState(0)
// const [isInputActive, setIsInputActive] = useState(false)
//
// {showForm && (
//   <ServerForm
//     formData={formData}
//     errors={errors}
//     editingId={editingId}
//     formFocusIndex={formFocusIndex}
//     isInputActive={isInputActive}
//     onChange={setFormData}
//     onSave={handleSave}
//     onCancel={handleCancel}
//   />
// )}
