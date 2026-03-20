
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/UI/Button'
import { Input } from '../components/UI/Input'
import { useAuthStore } from '../store/authStore'
import type { Profile } from '../types'
import LogoHeader from '../components/Logos/LogoHeader'

export const ProfileSelect = () => {
  const navigate = useNavigate()
  const { profiles, addProfile, setActiveProfile } = useAuthStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProfile, setNewProfile] = useState({ name: '', avatar: '🎬' })

  const handleSelectProfile = (profile: Profile) => {
    setActiveProfile(profile)
    navigate('/home')
  }

  const handleAddProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProfile.name.trim()) return

    const profile: Profile = {
      id: Date.now().toString(),
      name: newProfile.name,
      avatar: newProfile.avatar,
      createdAt: new Date(),
    }

    addProfile(profile)
    setNewProfile({ name: '', avatar: '🎬' })
    setShowAddForm(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-8">
      <div className="mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div className="">
            <LogoHeader />
            <p className="text-gray-400 mt-2">Seleione um perfil para continuar</p>
          </div>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 max-md:grid-cols-4 gap-4">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => handleSelectProfile(profile)}
              className="w-40 h-32 group flex flex-col items-center p-4 rounded-xl bg-gray-800/50 hover:bg-gray-700/70 border border-gray-700 hover:border-red-600/50 transition-all duration-200"
            >
              <div className="text-6xl mb-3 group-hover:scale-110 transition-transform">
                {profile.avatar}
              </div>
              <p className="text-white font-semibold text-center line-clamp-2">{profile.name}</p>
            </button>
          ))}

          {/* Add Profile Button */}
          {profiles.length < 5 && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-40 h-32 flex flex-col items-center justify-center p-4 rounded-xl bg-gray-800/30 hover:bg-gray-700/50 border-2 border-dashed border-gray-700 hover:border-red-600 transition-all duration-200"
            >
              <div className="text-4xl mb-3">+</div>
              <p className="text-gray-400 text-sm">Adicionar</p>
            </button>
          )}
        </div>

        {/* Add Profile Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-gray-900 rounded-xl p-6 w-full max-w-sm border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-4">Novo Perfil</h2>
              <form onSubmit={handleAddProfile} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Escolha um avatar</label>
                  <div className="flex gap-2 flex-wrap">
                    {['🐵​', '🐯', '🦁​', '🦄', '🐼', '🦈', '😈​', '😇', '🤖', '👽​'].map(
                      (emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setNewProfile({ ...newProfile, avatar: emoji })}
                          className={`text-3xl p-2 rounded-lg transition-all ${
                            newProfile.avatar === emoji
                              ? 'bg-red-600 scale-110'
                              : 'bg-gray-800 hover:bg-gray-700'
                          }`}
                        >
                          {emoji}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <Input
                  type="text"
                  placeholder="Nome do perfil"
                  value={newProfile.name}
                  onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                />

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={!newProfile.name.trim()} className="flex-1">
                    Criar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
