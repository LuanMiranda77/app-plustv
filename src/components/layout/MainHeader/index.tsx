/* eslint-disable react-hooks/set-state-in-effect */
import { Film, Home, RefreshCw, Server, Tv2, TvMinimalPlay } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFocusZone } from '../../../Context/FocusContext';
import { useRemoteControl } from '../../../hooks/useRemotoControl';
import { useServerContent } from '../../../hooks/useServerContent';
import { useAuthStore } from '../../../store/authStore';
import LogoHeader from '../../Logos/LogoHeader';
import MenuButton from '../../UI/ButtonMenu';
import ConfirmDialog from '../../UI/ConfirmDialog';
import moment from 'moment';
interface Props {
  scrolling: boolean;
}

const MainHeader: React.FC<Props> = ({ scrolling }) => {
  const menus = [
    { title: 'Início', icon: Home, path: '/home' },
    { title: 'TV ao Vivo', icon: Tv2, path: '/live' },
    { title: 'Filmes', icon: Film, path: '/movie' },
    { title: 'Séries', icon: TvMinimalPlay, path: '/series' }
  ];
  const navigate = useNavigate();
  const location = useLocation();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [focusedPerfil, setFocusedPerfil] = useState(false);
  const [focusedConfig, setFocuseConfig] = useState(false);
  const [focusedRefresh, setFocusedRefresh] = useState(false);
  const [confirmRefresh, setConfirmRefresh] = useState(false);
  const [confirmFocusBtn, setConfirmFocusBtn] = useState(0);
  const [selectMenu, setSelectMenu] = useState(-1);
  const { activeProfile } = useAuthStore();
  const { lastUpdate, forceRefresh, isLoading } = useServerContent();
  const { activeZone, setActiveZone } = useFocusZone();
  const isActive = activeZone === 'menu';
  // const { servers, loadFromStorage, addServer, setActiveServer } = useServerListStore();
  // const { serverConfig } = useAuthStore();
  // useEffect(() => {
  //   if (serverConfig==null) return;
  //   loadFromStorage();
  //   if (servers.length <5) {
  //     addServer(serverConfig);
  //     const updated = useServerListStore.getState().servers;
  //     const newServer = updated.find(
  //       s => s.url === serverConfig.url && s.username === serverConfig.username
  //     );
  //     if (newServer) {
  //       setActiveServer(newServer.id);
  //     }
  //   }
  // }, [servers, serverConfig]);

  // focusedIndex: 0..4 = menus, 5 = refresh, 6 = config server, 7 = perfil
  const FOCUS_REFRESH = menus.length;
  const FOCUS_CONFIG = menus.length + 1;
  const FOCUS_PERFIL = menus.length + 2;
  const FOCUS_MAX = FOCUS_PERFIL;

  const clearExtras = () => {
    setFocusedPerfil(false);
    setFocuseConfig(false);
    setFocusedRefresh(false);
  };

  const nextButton = () => {
    if (!isActive) return;
    clearExtras();
    setFocusedIndex(i => {
      const next = Math.min(i + 1, FOCUS_MAX);
      if (next < menus.length) {
        navigate(menus[next].path);
      } else if (next === FOCUS_REFRESH) {
        setFocusedRefresh(true);
      } else if (next === FOCUS_CONFIG) {
        setFocuseConfig(true);
      } else if (next === FOCUS_PERFIL) {
        setFocusedPerfil(true);
      }
      return next;
    });
  };
  const backButton = () => {
    if (!isActive) return;
    clearExtras();
    setFocusedIndex(i => {
      const next = Math.max(i - 1, 0);
      if (next < menus.length) {
        navigate(menus[next].path);
      } else if (next === FOCUS_REFRESH) {
        setFocusedRefresh(true);
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
    } else if (i === FOCUS_REFRESH) {
      setConfirmRefresh(true);
    } else if (i === FOCUS_CONFIG) {
      navigate('/config-server');
    } else if (i === FOCUS_PERFIL) {
      navigate('/profiles');
    }
  };

  useRemoteControl({
    onRight: () => {
      if (confirmRefresh) {
        setConfirmFocusBtn(1);
        return;
      }
      nextButton();
    },
    onLeft: () => {
      if (confirmRefresh) {
        setConfirmFocusBtn(0);
        return;
      }
      backButton();
    },
    onDown: () => {
      if (confirmRefresh) return;
      if (!isActive) return;
      setActiveZone('content');
      setSelectMenu(focusedIndex);
    },
    onOk: () => {
      if (confirmRefresh) {
        if (confirmFocusBtn === 0) {
          setConfirmRefresh(false);
          setConfirmFocusBtn(0);
        } else {
          setConfirmRefresh(false);
          setConfirmFocusBtn(0);
          forceRefresh();
        }
        return;
      }
      okButton(focusedIndex);
    },
    onBack: () => {
      if (confirmRefresh) {
        setConfirmRefresh(false);
        setConfirmFocusBtn(0);
        return;
      }
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

  useEffect(() => {
   if (isActive) setSelectMenu(-1);
  }, [isActive]);

  return (
    activeProfile && (
      <>
        <div
          className={`fixed z-50 w-full border-b border-gray-800 top-0 transition-all duration-300 ${
            scrolling ? 'bg-gray-950/95 backdrop-blur' : 'bg-gray-950/80 backdrop-blur'
          }`}
        >
          <div className="w-full px-6 max-md:px-3 py-2">
            <div className="relative flex items-center justify-between">
              <LogoHeader />

              <section className="flex items-center gap-2">
                {menus.map((menu, i) => (
                  <MenuButton
                    key={menu.title}
                    title={menu.title}
                    icon={menu.icon}
                    isFocused={
                      focusedIndex === i && !focusedPerfil && !focusedConfig && !focusedRefresh
                    }
                    selectMenu={
                      selectMenu === i && !focusedPerfil && !focusedConfig && !focusedRefresh
                    }
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
                  <div className="text-right">
                    <b className="text-gray-300 text-lg max-md:text-xs">Atualizado em</b>{' '}
                    <p className="text-gray-400 text-sm max-md:text-[10px]">
                      {moment(lastUpdate).format('DD/MM/YY HH:mm')}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => {
                    if (!isLoading) setConfirmRefresh(true);
                  }}
                  disabled={isLoading}
                  className={`p-2 transition-colors 
                rounded-lg 
                ${
                  focusedRefresh
                    ? 'bg-red-600 scale-110 shadow-lg shadow-red-600/50'
                    : 'bg-gray-800 hover:bg-gray-700'
                }
                disabled:opacity-50 disabled:cursor-not-allowed`}
                  title="Atualizar agora"
                >
                  <RefreshCw
                    className={`w-6 h-6 max-md:w-4 max-md:h-4 text-red-600 ${isLoading ? 'animate-spin' : ''} ${focusedRefresh ? 'text-white' : ''}`}
                  />
                </button>
                <button
                  className={`p-2 rounded-lg transition-all ${
                    focusedConfig
                      ? 'bg-red-600 text-white scale-110 shadow-lg shadow-red-600/50'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
                  }`}
                  title="Servidores"
                  onClick={() => navigate('/config-server')}
                >
                  <Server className="w-6 h-6 max-md:w-4 max-md:h-4" />
                </button>
                <button
                  className={`p-0.5 rounded-lg text-[24px] max-md:text-xl transition-all ${
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

        <ConfirmDialog
          open={confirmRefresh}
          icon={<RefreshCw className="w-8 h-8 text-red-500" />}
          title="Atualizar Conteúdo"
          description="Deseja realmente atualizar todo o conteúdo do servidor? Isso pode levar alguns instantes."
          confirmLabel="Atualizar"
          onConfirm={() => {
            setConfirmRefresh(false);
            forceRefresh();
          }}
          onCancel={() => {
            setConfirmRefresh(false);
            setConfirmFocusBtn(0);
          }}
          isFocusedCancelar={confirmFocusBtn === 0}
          isFocusedConfirmar={confirmFocusBtn === 1}
        />
      </>
    )
  );
};

export default MainHeader;
