import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/UI/Button'
import { Input } from '../components/UI/Input'
import { useAuthStore } from '../store/authStore'
import type { ServerConfig } from '../types'
import { xtreamApi } from '../utils/xtreamApi'

export const Login = () => {
  const navigate = useNavigate()
  const { setServerConfig, setLoading, setError, isLoading, error } =
    useAuthStore()

  const [formData, setFormData] = useState<ServerConfig>({
    name: '',
    url: '',
    username: '',
    password: '',
  })

  const [validationErrors, setValidationErrors] = useState<Partial<ServerConfig>>({})
  const urlInputRef = useRef<HTMLInputElement>(null)

  const validateForm = (): boolean => {
    const errors: Partial<ServerConfig> = {}

    if (!formData.url.trim()) {
      errors.url = 'URL do servidor é obrigatória'
    } else if (!formData.url.startsWith('http')) {
      errors.url = 'URL deve começar com http:// ou https://'
    }

    if (!formData.username.trim()) {
      errors.username = 'Usuário é obrigatório'
    }

    if (!formData.password.trim()) {
      errors.password = 'Senha é obrigatória'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Limpar erro ao começar a digitar
    if (validationErrors[name as keyof ServerConfig]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)

      // Testar autenticação
      const response = await xtreamApi.authenticate(formData)

      if (!response.user_info) {
        throw new Error('Resposta inválida do servidor')
      }

      // Salvar config e autenticar
      setServerConfig(formData)

      setLoading(false)
      navigate('/profiles')
    } catch (err) {
      setLoading(false)
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full -top-40 -right-40 w-80 h-80 bg-red-600/10 blur-3xl" />
        <div className="absolute rounded-full -bottom-40 -left-40 w-80 h-80 bg-red-600/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <img className='w-[100px] h-[100px]' src="/icons.png" alt="logo" />
          <div className='mt-1'>
            <h1 className="text-5xl font-bold text-netflix-red">Plus<b className='text-[#ff751f]'>TV</b></h1>
            <h6 className='p-0 m-0 text-md'>O MELHOR APP DE IPTV</h6>
          </div>
        </div>

        {/* Form Card */}
        <div className="p-8 border border-gray-800 shadow-2xl bg-gray-900/40 backdrop-blur-xl rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              ref={urlInputRef}
              type="name"
              name="name"
              label="Nome do Servidor"
              placeholder="meu_servidor"
              value={formData.name}
              onChange={handleInputChange}
              error={validationErrors.name}
              disabled={isLoading}
              autoComplete="off"
            />

            <Input
              type="text"
              name="username"
              label="Usuário"
              placeholder="seu_usuario"
              value={formData.username}
              onChange={handleInputChange}
              error={validationErrors.username}
              disabled={isLoading}
              autoComplete="off"
            />

            <Input
              type="password"
              name="password"
              label="Senha"
              placeholder="sua_senha"
              value={formData.password}
              onChange={handleInputChange}
              error={validationErrors.password}
              disabled={isLoading}
              autoComplete="off"
            />

            <Input
              ref={urlInputRef}
              type="url"
              name="url"
              label="URL do Servidor"
              placeholder="http://seu-servidor.com:8080"
              value={formData.url}
              onChange={handleInputChange}
              error={validationErrors.url}
              disabled={isLoading}
              autoComplete="off"
            />

            {error && (
              <div className="p-3 border rounded-lg bg-red-500/10 border-red-500/50">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !formData.url || !formData.username || !formData.password}
              isLoading={isLoading}
              size="lg"
              className="w-full mt-6"
            >
              {isLoading ? 'Conectando...' : 'Conectar'}
            </Button>
          </form>

          {/* Help text */}
          <div className="p-4 mt-6 border rounded-lg bg-gray-800/30 border-gray-700/30">
            <p className="text-xs text-gray-400">
              💡 <strong>Dica:</strong> Você pode encontrar essas credenciais na sua conta de
              provedor IPTV. A URL geralmente é algo como{' '}
              <span className="font-mono text-gray-300">http://iptv-provider.com:8080</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-sm text-center text-gray-500">
          <p>Todos os dados são salvos localmente no seu dispositivo</p>
        </div>
      </div>
    </div>
  )
}
