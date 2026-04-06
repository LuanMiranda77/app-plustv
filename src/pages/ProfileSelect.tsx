/* eslint-disable react-hooks/set-state-in-render */
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoHeader from '../components/Logos/LogoHeader';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import RemoteHint from '../components/UI/RemoteHint';
import { useRemoteControl } from '../hooks/useRemotoControl';
import useWindowSize from '../hooks/useWindowSize';
import { useAuthStore } from '../store/authStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { useHomeStore } from '../store/homeStore';
import { useWatchHistoryStore } from '../store/watchHistoryStore';
import type { Profile } from '../types';

// Lazy load do AutoCarousel para reduzir o bundle inicial
const AutoCarousel = lazy(() => import('../components/UI/AutoCarousel'));

// Componente de loading simplificado para o carousel
const CarouselLoader = () => (
  <div className="absolute inset-0 z-10 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
);

export const ProfileSelect = () => {
  const navigate = useNavigate();
  const { serverConfig } = useAuthStore();
  const { profiles, addProfile, updateProfile, setActiveProfile } = useAuthStore();
  const { setCurrentProfile: setFavoritesProfile } = useFavoritesStore();
  const { setCurrentProfile: setHistoryProfile } = useWatchHistoryStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProfile, setNewProfile] = useState({ name: '', avatar: '🎬' });
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [btnfocusIndex, setBtnFocusIndex] = useState(0);
  const [editingProfile, setEditingProfile] = useState<{
    id: string;
    name: string;
    avatar: string;
  } | null>(null);
  const { trendingMovies, trendingSeries } = useHomeStore();
  const { isMobile } = useWindowSize();

  // Estado para controlar quando o carousel deve ser renderizado
  const [showCarousel, setShowCarousel] = useState(false);
  const [carouselItems, setCarouselItems] = useState<any[]>([]);

  const avatars = ['🐵​', '🐯', '🦁​', '🦄', '🐼', '🦈', '😈​', '😇', '🤖', '👽​'];
  const AVATAR_COLS = 5;
  const AVATAR_COUNT = avatars.length;

  // Memoizar os itens do carousel para evitar recálculos desnecessários
  useMemo(() => {
    if (trendingMovies.length > 0 || trendingSeries.length > 0) {
      const items = [
        ...trendingMovies.slice(0, 5).map(m => ({ ...m })),
        ...trendingSeries.slice(0, 5).map(s => ({ ...s }))
      ];

      setCarouselItems(items);
      // Delay para mostrar o carousel apenas após os dados estarem prontos
      setTimeout(() => setShowCarousel(true), 100);
    }
  }, [trendingMovies, trendingSeries, setCarouselItems]);

  // Total de itens: perfis + botão de adicionar (se disponível)
  const totalItems = profiles.length + (profiles.length < 5 ? 1 : 0);

  // Handlers para navegação por controle remoto/teclado
  useRemoteControl({
    onRight: () => {
      if (showAddForm) {
        // Avatares
        if (btnfocusIndex >= 0 && btnfocusIndex < AVATAR_COUNT) {
          if (btnfocusIndex % AVATAR_COLS < AVATAR_COLS - 1) {
            setBtnFocusIndex(btnfocusIndex + 1);
          }
        }
        // Input
        else if (btnfocusIndex === AVATAR_COUNT) {
          setBtnFocusIndex(AVATAR_COUNT + 1);
        }
        // Cancelar
        else if (btnfocusIndex === AVATAR_COUNT + 1) {
          setBtnFocusIndex(AVATAR_COUNT + 2);
        }
      } else {
        setFocusedIndex(prev => (prev + 1) % totalItems);
      }
    },
    onLeft: () => {
      if (showAddForm) {
        if (btnfocusIndex >= 0 && btnfocusIndex < AVATAR_COUNT) {
          if (btnfocusIndex % AVATAR_COLS > 0) {
            setBtnFocusIndex(btnfocusIndex - 1);
          }
        } else if (btnfocusIndex === AVATAR_COUNT) {
          setBtnFocusIndex(AVATAR_COUNT - 1);
        } else if (btnfocusIndex === AVATAR_COUNT + 2) {
          setBtnFocusIndex(AVATAR_COUNT + 1);
        }
      } else {
        setFocusedIndex(prev => (prev - 1 + totalItems) % totalItems);
      }
    },
    onDown: () => {
      if (showAddForm) {
        if (btnfocusIndex >= 0 && btnfocusIndex < AVATAR_COUNT) {
          if (btnfocusIndex + AVATAR_COLS < AVATAR_COUNT) {
            setBtnFocusIndex(btnfocusIndex + AVATAR_COLS);
          } else {
            setBtnFocusIndex(AVATAR_COUNT);
          }
        } else if (btnfocusIndex === AVATAR_COUNT) {
          setBtnFocusIndex(AVATAR_COUNT + 1);
        }
      } else {
        setFocusedIndex(prev => (prev + 1) % totalItems);
      }
    },
    onUp: () => {
      if (showAddForm) {
        if (btnfocusIndex >= 0 && btnfocusIndex < AVATAR_COUNT) {
          if (btnfocusIndex - AVATAR_COLS >= 0) {
            setBtnFocusIndex(btnfocusIndex - AVATAR_COLS);
          }
        } else if (btnfocusIndex === AVATAR_COUNT) {
          const lastAvatarRow = Math.floor((AVATAR_COUNT - 1) / AVATAR_COLS);
          setBtnFocusIndex(lastAvatarRow * AVATAR_COLS);
        } else if (btnfocusIndex === AVATAR_COUNT + 1 || btnfocusIndex === AVATAR_COUNT + 2) {
          setBtnFocusIndex(AVATAR_COUNT);
        }
      } else {
        setFocusedIndex(prev => (prev - 1 + totalItems) % totalItems);
      }
    },
    onOk: () => {
      if (showAddForm) {
        if (btnfocusIndex >= 0 && btnfocusIndex < AVATAR_COUNT) {
          setNewProfile({ ...newProfile, avatar: avatars[btnfocusIndex] });
          setBtnFocusIndex(AVATAR_COUNT);
          setTimeout(() => {
            const inputElement = document.getElementById('profile-name-input');
            inputElement?.focus();
          }, 0);
        } else if (btnfocusIndex === AVATAR_COUNT) {
          if (newProfile.name.trim() && (editingProfile || profiles.length < 5)) {
            const event = new Event('submit', { bubbles: true });
            const formElement = document.getElementById('profile-form');
            formElement?.dispatchEvent(event);
          }
        } else if (btnfocusIndex === AVATAR_COUNT + 1) {
          setShowAddForm(false);
          setEditingProfile(null);
          setNewProfile({ name: '', avatar: '🎬' });
        } else if (btnfocusIndex === AVATAR_COUNT + 2) {
          if (newProfile.name.trim() && (editingProfile || profiles.length < 5)) {
            const event = new Event('submit', { bubbles: true });
            const formElement = document.getElementById('profile-form');
            formElement?.dispatchEvent(event);
          }
        }
        return;
      }
      if (focusedIndex < profiles.length) {
        handleSelectProfile(profiles[focusedIndex]);
      } else {
        if (profiles.length >= 5) return;
        setShowAddForm(true);
        setBtnFocusIndex(0);
      }
    },
    onYellow: () => {
      if (!showAddForm && focusedIndex < profiles.length) {
        const profile = profiles[focusedIndex];
        setEditingProfile({ id: profile.id, name: profile.name, avatar: profile.avatar });
        setNewProfile({ name: profile.name, avatar: profile.avatar });
        setShowAddForm(true);
        setBtnFocusIndex(0);
      }
    },
    onBack: () => {
      if (showAddForm) {
        setNewProfile({ name: '', avatar: '🎬' });
        setEditingProfile(null);
        setShowAddForm(false);
      }
    }
  });

  const handleSelectProfile = (profile: Profile) => {
    setActiveProfile(profile);
    setFavoritesProfile(profile.id, serverConfig!);
    setHistoryProfile(profile.id, serverConfig!);
    navigate('/home');
  };

  const handleAddProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfile.name.trim()) return;

    if (editingProfile) {
      updateProfile(editingProfile.id, {
        name: newProfile.name,
        avatar: newProfile.avatar
      });
      setNewProfile({ name: '', avatar: '🎬' });
      setEditingProfile(null);
      setShowAddForm(false);
    } else {
      if (profiles.length >= 5) return;

      const profile: Profile = {
        id: Date.now().toString(),
        name: newProfile.name,
        avatar: newProfile.avatar,
        createdAt: new Date()
      };

      addProfile(profile);
      setNewProfile({ name: '', avatar: '🎬' });
      setShowAddForm(false);
    }
  };

  // Limpar carousel quando o componente desmontar
  useEffect(() => {
    return () => {
      setShowCarousel(false);
      setCarouselItems([]);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-y-auto bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-8">
      {/* Carousel otimizado - apenas renderiza quando os dados estão prontos */}
      {carouselItems.length > 0 && !isMobile && (
        <div className="absolute inset-0 z-10 right-0 w-full">
          <Suspense fallback={<CarouselLoader />}>
            {showCarousel && (
              <AutoCarousel
                items={carouselItems}
                autoPlayInterval={5000}
                className="absolute"
                infoRight
              />
            )}
          </Suspense>
        </div>
      )}

      <div className="mx-auto z-30 absolute inset-0 left-10 top-10">
        <div className="flex items-center justify-between mb-10">
          <div className="">
            <LogoHeader />
            <p className="text-gray-400 mt-2">Selecione um perfil para continuar</p>
          </div>
        </div>

        <RemoteHint color="yellow" label="Editar perfil" />

        {/* Profiles Grid - Otimizado para TV */}
        <div className="grid grid-cols-1 max-md:grid-cols-4 gap-4">
          {profiles.map((profile, index) => (
            <div
              key={profile.id}
              className={`w-40 h-32 group flex flex-col items-center p-4 rounded-xl bg-gray-800/50 hover:bg-gray-700/70 border-2 transition-all duration-200 relative cursor-pointer ${
                focusedIndex === index
                  ? 'border-red-600 bg-gray-700/70 ring-2 ring-red-600'
                  : 'border-gray-700 hover:border-red-600/50'
              }`}
              onClick={() => handleSelectProfile(profile)}
            >
              <button
                onClick={e => {
                  e.stopPropagation();
                  setEditingProfile({ id: profile.id, name: profile.name, avatar: profile.avatar });
                  setNewProfile({ name: profile.name, avatar: profile.avatar });
                  setShowAddForm(true);
                  setBtnFocusIndex(0);
                }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 md:opacity-100 p-1.5 rounded-lg bg-red-600 hover:bg-red-500 transition-all"
                title="Editar perfil"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>

              <div className="text-6xl mb-3 group-hover:scale-110 transition-transform">
                {profile.avatar}
              </div>
              <p className="text-white font-semibold text-center line-clamp-2">{profile.name}</p>
            </div>
          ))}

          {profiles.length < 5 && (
            <button
              onClick={() => setShowAddForm(true)}
              className={`w-40 h-32 flex flex-col items-center justify-center p-4 rounded-xl bg-gray-800/30 hover:bg-gray-700/50 border-2 transition-all duration-200 ${
                focusedIndex === profiles.length
                  ? 'border-red-600 bg-gray-700/50 ring-2 ring-red-600'
                  : 'border-dashed border-gray-700 hover:border-red-600'
              }`}
            >
              <div className="text-4xl mb-3">+</div>
              <p className="text-gray-400 text-sm">Adicionar</p>
            </button>
          )}
        </div>

        {/* Add/Edit Profile Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm z-50">
            <div className="bg-gray-900 rounded-xl p-6 w-full max-w-sm border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-4">
                {editingProfile ? 'Editar Perfil' : 'Novo Perfil'}
              </h2>
              <form id="profile-form" onSubmit={handleAddProfile} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Escolha um avatar</label>
                  <div className="flex gap-2 flex-wrap">
                    {avatars.map((emoji, index) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setNewProfile({ ...newProfile, avatar: emoji });
                          setBtnFocusIndex(index);
                        }}
                        className={`text-3xl p-2 rounded-lg transition-all ${
                          btnfocusIndex === index
                            ? 'bg-red-600 scale-110 ring-2 ring-red-500'
                            : newProfile.avatar === emoji
                              ? 'bg-red-600 scale-105'
                              : 'bg-gray-800 hover:bg-gray-700'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  id="profile-name-input"
                  type="text"
                  placeholder="Nome do perfil"
                  value={newProfile.name}
                  onChange={e => setNewProfile({ ...newProfile, name: e.target.value })}
                  className={`transition-all ${
                    btnfocusIndex === AVATAR_COUNT ? 'ring-2 ring-red-600 border-red-600' : ''
                  }`}
                  onKeyDown={e => {
                    if (
                      e.key === 'Enter' &&
                      e.currentTarget.value.trim().length > 0 &&
                      (editingProfile || profiles.length < 5)
                    ) {
                      const event = new Event('submit', { bubbles: true });
                      const formElement = document.getElementById('profile-form');
                      formElement?.dispatchEvent(event);
                    }
                  }}
                />

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    className={`flex-1 transition-all ${
                      btnfocusIndex === AVATAR_COUNT + 1 ? 'ring-2 ring-red-600 bg-gray-700' : ''
                    }`}
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingProfile(null);
                      setNewProfile({ name: '', avatar: '🎬' });
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={!newProfile.name.trim()}
                    className={`flex-1 transition-all ${
                      btnfocusIndex === AVATAR_COUNT + 2 ? 'ring-2 ring-red-600' : ''
                    }`}
                  >
                    {editingProfile ? 'Salvar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
