/* eslint-disable react-hooks/set-state-in-effect */
import { Film, Home, RefreshCw, Server, Tv2, TvMinimalPlay } from 'lucide-react';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFocusZone } from '../../../Context/FocusContext';
import { useRemoteControl } from '../../../hooks/useRemotoControl';
import { useServerContent } from '../../../hooks/useServerContent';
import { useAuthStore } from '../../../store/authStore';
import LogoHeader from '../../Logos/LogoHeader';
import MenuButton from '../../UI/ButtonMenu';
import ConfirmDialog from '../../UI/ConfirmDialog';
import { Dropdown, type OptionType, type RefreshTarget } from '../../UI/Dropdown';
import { useContentStore } from '../../../store/contentStore';

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

  // ── Foco ──────────────────────────────────────────────────────────────────
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [focusedPerfil, setFocusedPerfil] = useState(false);
  const [focusedConfig, setFocuseConfig] = useState(false);
  const [focusedRefresh, setFocusedRefresh] = useState(false);
  const [selectMenu, setSelectMenu] = useState(-1);

  // ── Dropdown ──────────────────────────────────────────────────────────────
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pendingRefreshTarget, setPendingRefreshTarget] = useState<RefreshTarget>('all');

  // ── Confirm dialog ────────────────────────────────────────────────────────
  const [confirmRefresh, setConfirmRefresh] = useState(false);
  const [confirmFocusBtn, setConfirmFocusBtn] = useState(1); // 1 = confirmar por padrão

  const { activeProfile } = useAuthStore();
  const { lastUpdate, forceRefresh, isLoading, loadingTarget } = useServerContent();
  const { activeZone, setActiveZone } = useFocusZone();
  const isActive = activeZone === 'menu';

  const FOCUS_REFRESH = menus.length;
  const FOCUS_CONFIG = menus.length + 1;
  const FOCUS_PERFIL = menus.length + 2;
  const FOCUS_MAX = FOCUS_PERFIL;

  const OPTIONS: OptionType[] = [
    {
      id: 'live',
      label: 'Canais ao Vivo',
      description: 'Somente TV ao vivo',
      icon: <Tv2 className="w-4 h-4" />
    },
    {
      id: 'movies',
      label: 'Filmes',
      description: 'Somente filmes',
      icon: <Film className="w-4 h-4" />
    },
    {
      id: 'series',
      label: 'Séries',
      description: 'Somente séries',
      icon: <TvMinimalPlay className="w-4 h-4" />
    },
    {
      id: 'all',
      label: 'Atualizar Tudo',
      description: 'Canais, filmes e séries',
      icon: <RefreshCw className="w-4 h-4" />
    }
  ];

  const { serverConfig } = useAuthStore();
  const { movies, series, channels, fetchLiveContent, fetchMoviesContent, fetchSeriesContent } =
    useContentStore();

  // ── Carregar sob demanda por rota ──────────────────────────────────────────
  useEffect(() => {
    if (!serverConfig || isLoading) return;

    switch (location.pathname) {
      case '/live':
        if (channels.length === 0) fetchLiveContent(serverConfig);
        break;
      case '/movie':
        if (movies.length === 0) fetchMoviesContent(serverConfig);
        break;
      case '/series':
        if (series.length === 0) fetchSeriesContent(serverConfig);
        break;
    }
  }, [location.pathname, serverConfig]);

  // ── Helpers ───────────────────────────────────────────────────────────────

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
      if (next < menus.length) navigate(menus[next].path);
      else if (next === FOCUS_REFRESH) setFocusedRefresh(true);
      else if (next === FOCUS_CONFIG) setFocuseConfig(true);
      else if (next === FOCUS_PERFIL) setFocusedPerfil(true);
      return next;
    });
  };

  const backButton = () => {
    if (!isActive) return;
    clearExtras();
    setFocusedIndex(i => {
      const next = Math.max(i - 1, 0);
      if (next < menus.length) navigate(menus[next].path);
      else if (next === FOCUS_REFRESH) setFocusedRefresh(true);
      else if (next === FOCUS_CONFIG) setFocuseConfig(true);
      return next;
    });
  };

  const okButton = (i: number) => {
    if (!isActive) return;
    if (i < menus.length) {
      setFocusedIndex(i);
      navigate(menus[i].path);
    } else if (i === FOCUS_REFRESH) {
      // ✅ Abrir dropdown em vez do confirm direto
      if (!isLoading) setDropdownOpen(true);
    } else if (i === FOCUS_CONFIG) {
      navigate('/config-server');
    } else if (i === FOCUS_PERFIL) {
      navigate('/profiles');
    }
  };

  // ── Remote Control ────────────────────────────────────────────────────────

  useRemoteControl({
    onRight: () => {
      if (dropdownOpen) return; // dropdown intercepta
      if (confirmRefresh) {
        setConfirmFocusBtn(1);
        return;
      }
      nextButton();
    },
    onLeft: () => {
      if (dropdownOpen) return; // dropdown intercepta
      if (confirmRefresh) {
        setConfirmFocusBtn(0);
        return;
      }
      backButton();
    },
    onDown: () => {
      if (dropdownOpen) return; // dropdown intercepta
      if (confirmRefresh) return;
      if (!isActive) return;
      setActiveZone('content');
      setSelectMenu(focusedIndex);
    },
    onUp: () => {
      if (dropdownOpen) return; // dropdown intercepta
    },
    onOk: () => {
      // Confirm dialog aberto
      if (confirmRefresh) {
        if (confirmFocusBtn === 0) {
          // Cancelar
          setConfirmRefresh(false);
          setConfirmFocusBtn(1);
        } else {
          // Confirmar
          setConfirmRefresh(false);
          setConfirmFocusBtn(1);
          forceRefresh(pendingRefreshTarget);
        }
        return;
      }
      // Dropdown intercepta o OK internamente via capture
      if (dropdownOpen) return;
      okButton(focusedIndex);
    },
    onBack: () => {
      // Fechar dropdown com back
      if (dropdownOpen) {
        setDropdownOpen(false);
        return;
      }
      if (confirmRefresh) {
        setConfirmRefresh(false);
        setConfirmFocusBtn(1);
        return;
      }
    }
  });

  // ── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => {
    const idx = menus.findIndex(menu => menu.path === location.pathname);
    if (idx >= 0) {
      setFocusedIndex(idx);
      setFocusedPerfil(false);
      setFocuseConfig(false);
      setFocusedRefresh(false);
    }
  }, [location]);

  useEffect(() => {
    if (isActive) setSelectMenu(-1);
  }, [isActive]);

  // ─────────────────────────────────────────────────────────────────────────

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

              {/* ── Menus ───────────────────────────────────────────────── */}
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

              {/* ── Ações ───────────────────────────────────────────────── */}
              <section className="relative flex items-center gap-3">
                {/* Data de atualização */}
                {lastUpdate && (
                  <div className="text-right">
                    <b className="text-gray-300 text-lg max-md:text-xs">Atualizado em</b>{' '}
                    <p className="text-gray-400 text-sm max-md:text-[10px]">
                      {moment(lastUpdate).format('DD/MM/YY HH:mm')}
                    </p>
                  </div>
                )}

                {/* Dropdown de atualização */}
                <Dropdown
                  isLoading={isLoading}
                  loadingTarget={loadingTarget}
                  isFocused={focusedRefresh}
                  isOpen={dropdownOpen}
                  onOpenChange={setDropdownOpen}
                  options={OPTIONS}
                  onRefresh={target => {
                    setPendingRefreshTarget(target);
                    setDropdownOpen(false);
                    setConfirmRefresh(true);
                    setConfirmFocusBtn(1); // foco padrão em "Confirmar"
                  }}
                />

                {/* Config server */}
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

                {/* Perfil */}
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

        {/* ── Confirm Dialog ──────────────────────────────────────────────── */}
        <ConfirmDialog
          open={confirmRefresh}
          icon={<RefreshCw className="w-8 h-8 text-red-500" />}
          title="Atualizar Conteúdo"
          description={
            pendingRefreshTarget === 'all'
              ? 'Deseja atualizar todo o conteúdo? Isso pode levar alguns instantes.'
              : `Deseja atualizar apenas ${
                  pendingRefreshTarget === 'live'
                    ? 'os canais ao vivo'
                    : pendingRefreshTarget === 'movies'
                      ? 'os filmes'
                      : 'as séries'
                }?`
          }
          confirmLabel="Atualizar"
          cancelLabel="Cancelar"
          onConfirm={() => {
            setConfirmRefresh(false);
            setConfirmFocusBtn(1);
            forceRefresh(pendingRefreshTarget);
          }}
          onCancel={() => {
            setConfirmRefresh(false);
            setConfirmFocusBtn(1);
          }}
          isFocusedCancelar={confirmFocusBtn === 0}
          isFocusedConfirmar={confirmFocusBtn === 1}
        />
      </>
    )
  );
};

export default MainHeader;
