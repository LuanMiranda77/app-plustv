import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { useRemoteControl } from '../hooks/useRemotoControl';
import { useAuthStore } from '../store/authStore';
import type { ServerConfig } from '../types';
import { xtreamApi } from '../utils/xtreamApi';

export const Login = () => {
  const navigate = useNavigate();
  const { setServerConfig, setLoading, setError, isLoading, error } = useAuthStore();

  const [formData, setFormData] = useState<ServerConfig>({
    name: '',
    url: '',
    username: '',
    password: '',
  });

  const [validationErrors, setValidationErrors] = useState<Partial<ServerConfig>>({});
  const [focusedFieldIndex, setFocusedFieldIndex] = useState(0);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // Campos: 0=name, 1=username, 2=password, 3=url, 4=submit button
  const fields = ['name', 'username', 'password', 'url'] as const;
  const fieldRefs = {
    name: nameInputRef,
    username: usernameInputRef,
    password: passwordInputRef,
    url: urlInputRef,
  };

  // Focar botão submit quando necessário
  useEffect(() => {
    if (focusedFieldIndex === 4 && submitButtonRef.current) {
      submitButtonRef.current.focus();
    }
  }, [focusedFieldIndex]);

  const validateForm = (): boolean => {
    const errors: Partial<ServerConfig> = {};

    if (!formData.url.trim()) {
      errors.url = 'URL do servidor é obrigatória';
    } else if (!formData.url.startsWith('http')) {
      errors.url = 'URL deve começar com http:// ou https://';
    }

    if (!formData.username.trim()) {
      errors.username = 'Usuário é obrigatório';
    }

    if (!formData.password.trim()) {
      errors.password = 'Senha é obrigatória';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validar campo específico
  const validateField = (index: number): boolean => {
    const fieldName = fields[index];
    const errors: Partial<ServerConfig> = {};

    if (fieldName === 'url') {
      if (!formData.url.trim()) {
        errors.url = 'URL do servidor é obrigatória';
      } else if (!formData.url.startsWith('http')) {
        errors.url = 'URL deve começar com http:// ou https://';
      }
    } else if (fieldName === 'username') {
      if (!formData.username.trim()) {
        errors.username = 'Usuário é obrigatório';
      }
    } else if (fieldName === 'password') {
      if (!formData.password.trim()) {
        errors.password = 'Senha é obrigatória';
      }
    }

    setValidationErrors((prev) => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  // Navegação por controle remoto/teclado
  useRemoteControl({
    onDown: () => {
      // Validar campo atual antes de ir para o próximo
      if (focusedFieldIndex < fields.length) {
        if (!validateField(focusedFieldIndex)) {
          // Campo inválido, não avança
          return;
        }
      }

      setFocusedFieldIndex((prev) => {
        const next = prev + 1;
        if (next <= fields.length) {
          if (next < fields.length) {
            setTimeout(() => {
              const fieldName = fields[next];
              fieldRefs[fieldName].current?.focus();
            }, 0);
          }
          return next;
        }
        return prev;
      });
    },
    onUp: () => {
      setFocusedFieldIndex((prev) => {
        const next = prev - 1;
        if (next >= 0) {
          if (next < fields.length) {
            setTimeout(() => {
              const fieldName = fields[next];
              fieldRefs[fieldName].current?.focus();
            }, 0);
          }
          return next;
        }
        return prev;
      });
    },
    onOk: () => {
      if (focusedFieldIndex === fields.length) {
        // Botão submit - validar TODOS os campos
        if (validateForm()) {
          const form = document.getElementById('login-form') as HTMLFormElement;
          if (form) {
            form.dispatchEvent(new Event('submit', { bubbles: true }));
          }
        }
      } else if (focusedFieldIndex < fields.length) {
        // Campo de input - validar antes de ir para próximo
        if (validateField(focusedFieldIndex)) {
          // Campo válido, ir para próximo
          setFocusedFieldIndex((prev) => {
            const next = prev + 1;
            if (next <= fields.length) {
              if (next < fields.length) {
                setTimeout(() => {
                  const fieldName = fields[next];
                  fieldRefs[fieldName].current?.focus();
                }, 0);
              }
              return next;
            }
            return prev;
          });
        }
      }
    },
    onBack: () => {
      // Reset ou voltar
      setFocusedFieldIndex(0);
      nameInputRef.current?.focus();
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpar erro ao começar a digitar
    if (validationErrors[name as keyof ServerConfig]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Testar autenticação
      const response = await xtreamApi.authenticate(formData);

      if (!response.user_info) {
        throw new Error('Resposta inválida do servidor');
      }

      // Salvar config e autenticar
      setServerConfig(formData);

      setLoading(false);
      navigate('/profiles');
    } catch (err) {
      setLoading(false);
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
    }
  };

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
          <img className="w-[100px] h-[100px]" src="/icons.png" alt="logo" />
          <div className="mt-1">
            <h1 className="text-5xl font-bold text-netflix-red">
              Plus<b className="text-[#ff751f]">TV</b>
            </h1>
            <h6 className="p-0 m-0 text-md">O MELHOR APP DE IPTV</h6>
          </div>
        </div>

        {/* Form Card */}
        <div className="p-8 border border-gray-800 shadow-2xl bg-gray-900/40 backdrop-blur-xl rounded-2xl">
          <form id="login-form" onSubmit={handleSubmit} className="space-y-5">
            <Input
              ref={nameInputRef}
              type="text"
              name="name"
              label="Nome do Servidor"
              placeholder="meu_servidor"
              value={formData.name}
              onChange={handleInputChange}
              error={validationErrors.name}
              disabled={isLoading}
              autoComplete="off"
              className={focusedFieldIndex === 0 ? 'ring-2 ring-red-600' : ''}
              onFocus={() => setFocusedFieldIndex(0)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (validateField(0)) {
                    setFocusedFieldIndex(1);
                    setTimeout(() => usernameInputRef.current?.focus(), 0);
                  }
                }
              }}
            />

            <Input
              ref={usernameInputRef}
              type="text"
              name="username"
              label="Usuário"
              placeholder="seu_usuario"
              value={formData.username}
              onChange={handleInputChange}
              error={validationErrors.username}
              disabled={isLoading}
              autoComplete="off"
              className={focusedFieldIndex === 1 ? 'ring-2 ring-red-600' : ''}
              onFocus={() => setFocusedFieldIndex(1)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (validateField(1)) {
                    setFocusedFieldIndex(2);
                    setTimeout(() => passwordInputRef.current?.focus(), 0);
                  }
                }
              }}
            />

            <Input
              ref={passwordInputRef}
              type="password"
              name="password"
              label="Senha"
              placeholder="sua_senha"
              value={formData.password}
              onChange={handleInputChange}
              error={validationErrors.password}
              disabled={isLoading}
              autoComplete="off"
              className={focusedFieldIndex === 2 ? 'ring-2 ring-red-600' : ''}
              onFocus={() => setFocusedFieldIndex(2)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (validateField(2)) {
                    setTimeout(() => {
                      setFocusedFieldIndex(3);
                      urlInputRef.current?.focus();
                    }, 0);
                  }
                }
              }}
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
              className={focusedFieldIndex === 3 ? 'ring-2 ring-red-600' : ''}
              onFocus={() => setFocusedFieldIndex(3)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (validateField(3)) {
                    setTimeout(() => {
                      setFocusedFieldIndex(4);
                      // Não precisa focar o botão aqui, o onFocus dele vai tratar
                    }, 0);
                  }
                }
              }}
            />

            {error && (
              <div className="p-3 border rounded-lg bg-red-500/10 border-red-500/50">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button
              ref={submitButtonRef}
              type="submit"
              disabled={isLoading || !formData.url || !formData.username || !formData.password}
              isLoading={isLoading}
              size="lg"
              className={`w-full mt-6 transition-all ${focusedFieldIndex === 4 ? 'ring-2 ring-red-600' : ''}`}
              onFocus={() => setFocusedFieldIndex(4)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (validateForm()) {
                    const form = document.getElementById('login-form') as HTMLFormElement;
                    if (form) {
                      form.dispatchEvent(new Event('submit', { bubbles: true }));
                    }
                  }
                }
              }}
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
  );
};
