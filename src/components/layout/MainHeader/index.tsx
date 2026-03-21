/* eslint-disable react-hooks/set-state-in-effect */
import { Film, Heart, Home, RefreshCw, Server, Tv2, TvMinimalPlay } from 'lucide-react';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFocusZone } from '../../../Context/FocusContext';
import { useRemoteControl } from '../../../hooks/useRemotoControl';
import { useServerContent } from '../../../hooks/useServerContent';
import { useAuthStore } from '../../../store/authStore';
import LogoHeader from '../../Logos/LogoHeader';
import MenuButton from '../../UI/ButtonMenu';
interface Props {
  scrolling: boolean;
}

const MainHeader: React.FC<Props> = ({ scrolling }) => {
  const menus = [
    { title: 'Início', icon: Home, path: '/home' },
    { title: 'TV ao Vivo', icon: Tv2, path: '/live' },
    { title: 'Filmes', icon: Film, path: '/movie' },
    { title: 'Séries', icon: TvMinimalPlay, path: '/series' },
    { title: 'Favoritos', icon: Heart, path: '/favorites' }
  ];
  const navigate = useNavigate();
  const location = useLocation();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [focusedPerfil, setFocusedPerfil] = useState(false);
  const [focusedConfig, setFocuseConfig] = useState(false);
  const { activeProfile } = useAuthStore();
  const { lastUpdate, forceRefresh, isLoading } = useServerContent();
  const { activeZone, setActiveZone } = useFocusZone();
  const isActive = activeZone === 'menu';

  // focusedIndex: 0..4 = menus, 5 = config server, 6 = perfil
  const FOCUS_CONFIG = menus.length;
  const FOCUS_PERFIL = menus.length + 1;
  const FOCUS_MAX = FOCUS_PERFIL;

  const nextButton = () => {
    if (!isActive) return;
    setFocusedPerfil(false);
    setFocuseConfig(false);
    setFocusedIndex(i => {
      const next = Math.min(i + 1, FOCUS_MAX);
      if (next < menus.length) {
        navigate(menus[next].path);
      } else if (next === FOCUS_CONFIG) {
        setFocuseConfig(true);
      } else if (next === FOCUS_PERFIL) {
        setFocuseConfig(false);
        setFocusedPerfil(true);
      }
      return next;
    });
  };
  const backButton = () => {
    if (!isActive) return;
    setFocusedPerfil(false);
    setFocuseConfig(false);
    setFocusedIndex(i => {
      const next = Math.max(i - 1, 0);
      if (next < menus.length) {
        navigate(menus[next].path);
      } else if (next === FOCUS_CONFIG) {
        setFocuseConfig(true);
      }
      return next;
    });
  };
  const okButton = (i: number) => {
    if (!isActive) return;
    if (i < menus.length) {
      setFocusedIndex(i);
      navigate(menus[i].path);
    } else if (i === FOCUS_CONFIG) {
      navigate('/config-server');
    } else if (i === FOCUS_PERFIL) {
      navigate('/profiles');
    }
  };

  useRemoteControl({
    onRight: () => nextButton(),
    onLeft: () => backButton(),
    onOk: () => okButton(focusedIndex),
    onDown: () => {
      if (!isActive) return;
      setActiveZone('content'); // ← passa o foco para o conteúdo
    }
  });

  useEffect(() => {
    const idx = menus.findIndex(menu => menu.path === location.pathname);
    if (idx >= 0) {
      setFocusedIndex(idx);
      setFocusedPerfil(false);
      setFocuseConfig(false);
    }
  }, [location]);

  return (
    activeProfile && (
      <div
        className={`fixed z-50 w-full border-b border-gray-800 top-0 transition-all duration-300 ${
          scrolling ? 'bg-gray-950/95 backdrop-blur' : 'bg-gray-950/80 backdrop-blur'
        }`}
      >
        <div className="w-full px-6 py-2">
          <div className="relative flex items-center justify-between">
            <LogoHeader />

            <section className="flex items-center gap-2">
              {menus.map((menu, i) => (
                <MenuButton
                  key={menu.title}
                  title={menu.title}
                  icon={menu.icon}
                  isFocused={focusedIndex === i && !focusedPerfil && !focusedConfig}
                  onClick={() => {
                    setActiveZone('menu');
                    setFocusedIndex(i);
                    navigate(menu.path);
                  }}
                  iconOffset={i !== 4}
                />
              ))}
            </section>
            <section className=" relative flex items-center gap-3">
              {lastUpdate && (
                <div className="absolute text-right w-[150px] top-[-15px] max-md:top-[-18px] right-[90px]">
                  <p className="text-gray-400 text-[11px]">
                    <b className="text-gray-300">Atualizado</b>{' '}
                    {moment(lastUpdate).format('DD/MM/YY')}
                  </p>
                  <button
                    onClick={() => forceRefresh()}
                    disabled={isLoading}
                    className="hidden p-2 transition-colors rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Atualizar agora"
                  >
                    <RefreshCw
                      className={`w-5 h-5 text-red-600 ${isLoading ? 'animate-spin' : ''}`}
                    />
                  </button>
                </div>
              )}
              <button
                className={`p-2 rounded-lg transition-all ${
                  focusedConfig
                    ? 'bg-red-600 text-white scale-110 shadow-lg shadow-red-600/50'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
                }`}
                title="Servidores"
                onClick={() => navigate('/config-server')}
              >
                <Server className="w-5 h-5" />
              </button>
              <button
                className={`p-0.5 rounded-lg text-[25px] max-md:text-xl transition-all ${
                  focusedPerfil
                    ? 'ring-2 ring-red-600 scale-110 shadow-lg shadow-red-600/50 bg-red-600'
                    : 'bg-gray-600'
                }`}
                title={activeProfile?.name}
                onClick={() => navigate('/profiles')}
              >
                {activeProfile?.avatar}
              </button>
            </section>
          </div>
        </div>
      </div>
    )
  );
};

export default MainHeader;
