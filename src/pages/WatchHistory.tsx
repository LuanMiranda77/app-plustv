import { ArrowLeft, Clock, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContinueWatchingCard } from '../components/Cards/ContinueWatchingCard';
import { useFocusZone } from '../Context/FocusContext';
import { useRemoteControl } from '../hooks/useRemotoControl';
import { useWatchHistoryStore } from '../store/watchHistoryStore';
import { useAuthStore } from '../store/authStore';

export const WatchHistory = () => {
  const navigate = useNavigate();
  const { serverConfig } = useAuthStore();
  const { getHistory, clearHistory } = useWatchHistoryStore();
  const { activeZone } = useFocusZone();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const history = getHistory(serverConfig!);

  // Group by date
  const getTimeLabel = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return 'Há alguns minutos';
    if (hours < 24) return `Há ${hours}h`;
    if (days < 7) return `Há ${days}d`;
    return 'Há mais de uma semana';
  };

  const sortedHistory = [...history].sort((a, b) => {
    const dateA = typeof a.lastWatched === 'string' ? new Date(a.lastWatched) : a.lastWatched;
    const dateB = typeof b.lastWatched === 'string' ? new Date(b.lastWatched) : b.lastWatched;
    return dateB.getTime() - dateA.getTime();
  });

  const groupedHistory = sortedHistory.reduce(
    (acc, item) => {
      const label = getTimeLabel(item.lastWatched);
      const existing = acc.find(g => g.label === label);

      if (existing) {
        existing.items.push(item);
      } else {
        acc.push({ label, items: [item] });
      }

      return acc;
    },
    [] as Array<{ label: string; items: typeof history }>
  );

  useRemoteControl({
    onRight: () => {
      if (activeZone === 'content' && focusedIndex < history.length - 1) {
        setFocusedIndex(focusedIndex + 1);
      }
    },
    onLeft: () => {
      if (activeZone === 'content' && focusedIndex > 0) {
        setFocusedIndex(focusedIndex - 1);
      }
    },
    onDown: () => {
      if (activeZone === 'content' && focusedIndex < history.length - 1) {
        setFocusedIndex(Math.min(focusedIndex + 3, history.length - 1));
      }
    },
    onUp: () => {
      if (activeZone === 'content' && focusedIndex > 0) {
        setFocusedIndex(Math.max(focusedIndex - 3, 0));
      }
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 sticky top-0 z-40 bg-gray-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Voltar
              </button>
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-red-600" />
                <h1 className="text-3xl font-bold text-white">Histórico de Visualização</h1>
              </div>
            </div>

            {history.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
                    clearHistory(serverConfig!);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-500 transition-colors font-semibold"
              >
                <Trash2 className="w-5 h-5" />
                Limpar História
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {history.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400 text-lg">Seu histórico de visualização está vazio</p>
            <p className="text-gray-500 text-sm mt-2">
              Comece a assistir para ver seu histórico aqui
            </p>
            <button
              onClick={() => navigate('/home')}
              className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              Voltar à Home
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {groupedHistory.map(group => (
              <section key={group.label}>
                <h2 className="text-xl font-bold text-white mb-6 pb-4 border-b border-gray-800">
                  {group.label}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.items.map((item: any) => (
                    <ContinueWatchingCard
                      key={item.id}
                      item={item}
                      onPlay={() => {
                        if (item.type === 'movie') {
                          navigate('/player', {
                            state: { movieId: item.id, streamUrl: item.content.streamUrl }
                          });
                        } else if (item.type === 'series') {
                          navigate('/player', {
                            state: { seriesId: item.id, streamUrl: item.content.streamUrl }
                          });
                        } else {
                          navigate('/player', {
                            state: { channelId: item.id, streamUrl: item.content.streamUrl }
                          });
                        }
                      }}
                    />
                  ))}
                </div>
              </section>
            ))}

            {/* Stats */}
            <div className="border-t border-gray-800 pt-10">
              <h3 className="text-xl font-bold text-white mb-6">Estatísticas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Total de Itens Assistidos</p>
                  <p className="text-3xl font-bold text-white">{history.length}</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Em Progresso</p>
                  <p className="text-3xl font-bold text-white">
                    {history.filter(h => h.progress < 100).length}
                  </p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Concluídos</p>
                  <p className="text-3xl font-bold text-white">
                    {history.filter(h => h.progress === 100).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
