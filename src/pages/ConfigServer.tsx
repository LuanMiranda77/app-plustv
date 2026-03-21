import { Check, Edit2, Plus, Server, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RemoteHint from '../components/UI/RemoteHint';
import { useRemoteControl } from '../hooks/useRemotoControl';
import { useAuthStore } from '../store/authStore';
import { useServerListStore, type ServerEntry } from '../store/serverListStore';
import type { ServerConfig } from '../types';
import { Button } from '../components/UI/Button';
import { useFocusZone } from '../Context/FocusContext';
import { ButtonBack } from '../components/UI/ButtonBack';

const emptyForm: ServerConfig = { name: '', url: '', username: '', password: '' };

export const ConfigServer = () => {
  const navigate = useNavigate();
  const {
    servers,
    activeServerId,
    loadFromStorage,
    addServer,
    updateServer,
    removeServer,
    setActiveServer
  } = useServerListStore();
  const { setServerConfig, setAuthenticated } = useAuthStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ServerConfig>(emptyForm);
  const [errors, setErrors] = useState<Partial<ServerConfig>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [focusedBack, setFocusedBack] = useState(false);
  const [focusedNew, setFocusedNew] = useState(false);
  const { activeZone, setActiveZone } = useFocusZone();
  const serverRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isZoneCat = activeZone === 'content';

  const handleBack = () => {
    navigate(-1);
    setActiveZone('menu');
  };

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    serverRefs.current[focusedIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [focusedIndex]);

  const inHeader = focusedBack || focusedNew;

  const clearHeader = () => {
    setFocusedBack(false);
    setFocusedNew(false);
  };

  useRemoteControl({
    onUp: () => {
      if (showForm) return;
      if (inHeader) return;
      if (focusedIndex === 0) {
        setFocusedBack(true);
        setFocusedNew(false);
      } else {
        setFocusedIndex(prev => prev - 1);
      }
    },
    onDown: () => {
      if (showForm) return;
      if (inHeader) {
        clearHeader();
        setFocusedIndex(0);
        return;
      }
      if (servers.length > 0) {
        setFocusedIndex(prev => Math.min(servers.length - 1, prev + 1));
      }
    },
    onLeft: () => {
      if (inHeader && focusedNew && !showForm) {
        setFocusedNew(false);
        setFocusedBack(true);
      }
    },
    onRight: () => {
      if (inHeader && focusedBack && !showForm) {
        setFocusedBack(false);
        setFocusedNew(true);
      }
    },
    onOk: () => {
      if (showForm) return;
      if (focusedBack) {
        handleBack();
        return;
      }
      if (focusedNew && servers.length < 5) {
        setFormData(emptyForm);
        setEditingId(null);
        setShowForm(true);
        clearHeader();
        return;
      }
      if (servers.length > 0) {
        handleSelect(servers[focusedIndex]);
      }
    },
    onGreen: () => {
      if (!showForm && !inHeader && servers.length > 0) {
        handleSelect(servers[focusedIndex]);
      }
    },
    onYellow: () => {
      if (!showForm && !inHeader && servers.length > 0) {
        handleEdit(servers[focusedIndex]);
      }
    },
    onRed: () => {
      if (!showForm && !inHeader && servers.length > 0) {
        const server = servers[focusedIndex];
        if (confirmDeleteId === server.id) {
          handleDelete(server.id);
        } else {
          setConfirmDeleteId(server.id);
        }
      }
    },
    onBack: () => {
      if (showForm) {
        handleCancel();
      } else if (confirmDeleteId) {
        setConfirmDeleteId(null);
      } else {
        handleBack();
      }
    }
  });

  const validate = (): boolean => {
    const e: Partial<ServerConfig> = {};
    if (!formData.name.trim()) e.name = 'Nome é obrigatório';
    if (!formData.url.trim()) {
      e.url = 'URL é obrigatória';
    } else if (!formData.url.startsWith('http')) {
      e.url = 'URL deve começar com http:// ou https://';
    }
    if (!formData.username.trim()) e.username = 'Usuário é obrigatório';
    if (!formData.password.trim()) e.password = 'Senha é obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    if (editingId) {
      updateServer(editingId, formData);
    } else {
      addServer(formData);
    }

    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setErrors({});
  };

  const handleEdit = (server: ServerEntry) => {
    setFormData({
      name: server.name,
      url: server.url,
      username: server.username,
      password: server.password
    });
    setEditingId(server.id);
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = (id: string) => {
    removeServer(id);
    setConfirmDeleteId(null);
  };

  const handleSelect = (server: ServerEntry) => {
    setActiveServer(server.id);
    setServerConfig({
      name: server.name,
      url: server.url,
      username: server.username,
      password: server.password
    });
    setAuthenticated(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
      <div className="max-w-6xl mx-auto mt-[70px] h-[calc(100vh-60px)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Server className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-white">Servidores</h1>
          </div>
          <div className="flex gap-3">
            <ButtonBack
              onClick={handleBack}
            //   className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              isFocused={focusedBack}
            >
              Voltar
            </ButtonBack>
            {!showForm && (
              <Button
                onClick={() => {
                  setFormData(emptyForm);
                  setEditingId(null);
                  setShowForm(true);
                  clearHeader();
                }}
                className={`flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors ${
                  focusedNew ? 'ring-2 ring-red-400 scale-red-400 scale-105' : ''
                }`}
                disabled={servers.length >= 5}
              >
                <Plus className="w-5 h-5" />
                Novo Servidor
              </Button>
            )}
          </div>
        </div>
        {/* Form */}
        {showForm && (
          <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              {editingId ? 'Editar Servidor' : 'Adicionar Servidor'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Meu Servidor"
                  className="w-full bg-gray-900 border border-gray-600 text-white px-4 py-2.5 rounded-lg focus:border-red-600 focus:outline-none transition-colors"
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">URL do Servidor</label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  placeholder="http://servidor.com:8080"
                  className="w-full bg-gray-900 border border-gray-600 text-white px-4 py-2.5 rounded-lg focus:border-red-600 focus:outline-none transition-colors"
                />
                {errors.url && <p className="text-red-400 text-xs mt-1">{errors.url}</p>}
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Usuário</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Usuário"
                  className="w-full bg-gray-900 border border-gray-600 text-white px-4 py-2.5 rounded-lg focus:border-red-600 focus:outline-none transition-colors"
                />
                {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Senha</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Senha"
                  className="w-full bg-gray-900 border border-gray-600 text-white px-4 py-2.5 rounded-lg focus:border-red-600 focus:outline-none transition-colors"
                />
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-5 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <Check className="w-4 h-4" />
                {editingId ? 'Salvar Alterações' : 'Adicionar'}
              </button>
            </div>
          </div>
        )}

        {/* Remote Hints */}
        {!showForm && servers.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            <RemoteHint color="green" label="Ativar servidor" />
            <RemoteHint color="yellow" label="Editar servidor" />
            <RemoteHint color="red" label="Deletar servidor" />
          </div>
        )}

        {/* Server List */}
        {servers.length === 0 ? (
          <div className="text-center py-20">
            <Server className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400 text-lg">Nenhum servidor cadastrado</p>
            <p className="text-gray-500 text-sm mt-2">Adicione um servidor IPTV para começar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {servers.map((server, idx) => (
              <div
                key={server.id}
                ref={el => {
                  serverRefs.current[idx] = el;
                }}
                className={`bg-gray-800/80 border rounded-xl p-5 transition-all ${
                  idx === focusedIndex && !inHeader
                    ? 'ring-2 ring-red-500 scale-[1.01] border-red-600 shadow-lg shadow-red-600/20'
                    : ''
                } 
                 `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        server.id === activeServerId ? 'bg-red-600' : 'bg-gray-700'
                      }`}
                    >
                      <Server className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-semibold text-4xl max-sm:text-lg">
                          {server.name || 'Sem nome'}
                        </h3>
                        {server.id === activeServerId && (
                          <span className="px-2 py-0.5 bg-green-600/20 border border-green-600/50 text-green-400 text-sm rounded-full">
                            Ativo
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-2xl max-sm:text-sm">{server.url}</p>
                      <p className="text-gray-500 text-2xl max-sm:text-sm mt-1">
                        Usuário: {server.username} · Criado em{' '}
                        {new Date(server.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {server.id !== activeServerId && (
                      <button
                        onClick={() => handleSelect(server)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Usar
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(server)}
                      className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {confirmDeleteId === server.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDelete(server.id)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded-lg transition-colors"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(server.id)}
                        className="p-2 bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
