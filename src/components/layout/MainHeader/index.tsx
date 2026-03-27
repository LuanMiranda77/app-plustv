/* eslint-disable react-hooks/set-state-in-effect */
import { Film, Home, RefreshCw, Server, Tv2, TvMinimalPlay } from 'lucide-react';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFocusZone } from '../../../Context/FocusContext';
import { useRemoteControl } from '../../../hooks/useRemotoControl';
import { useServerContent } from '../../../hooks/useServerContent';
import { useAuthStore } from '../../../store/authStore';
import { storage } from '../../../utils/storage';
import LogoHeader from '../../Logos/LogoHeader';
import MenuButton from '../../UI/ButtonMenu';
import ConfirmDialog from '../../UI/ConfirmDialog';
import { Dropdown, type OptionType, type RefreshTarget } from '../../UI/Dropdown';
import { DropdownBase, type OptionTypeConfig, type TargetConfig } from '../../UI/DropdownBase';
import { AdultContentUnlock } from '../../UI/FromAdultContent';

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
  // ── Adult Content ─────────────────────────────────────────────────────────
  const [showAdultUnlock, setShowAdultUnlock] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownOpenConfig, setDropdownOpenConfig] = useState(false);
  const [pendingRefreshTarget, setPendingRefreshTarget] = useState<RefreshTarget>('all');
  const [pendingTargetConfig, setPendingTargetConfig] = useState<TargetConfig>('server');

  // ── Confirm dialog ────────────────────────────────────────────────────────
  const [confirmRefresh, setConfirmRefresh] = useState(false);
  const [confirmFocusBtn, setConfirmFocusBtn] = useState(1); // 1 = confirmar por padrão

  const { activeProfile } = useAuthStore();
  const { lastUpdate, forceRefresh, isLoading, loadingTarget } = useServerContent();
  const { activeZone, setActiveZone } = useFocusZone();
  const { serverConfig } = useAuthStore();

  const isAdultUnlocked = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return storage.get('adult-unlocked') === true;
  }, [pendingTargetConfig]);
  const isActive = activeZone === 'menu';
  const isContent = activeZone === 'content';

  const FOCUS_REFRESH = menus.length;
  const FOCUS_CONFIG = menus.length + 1;
  const FOCUS_PERFIL = menus.length + 2;
  const FOCUS_MAX = FOCUS_PERFIL;

  const OPTIONS_CONFIG: OptionTypeConfig[] = [
    {
      id: 'server',
      label: 'Servidores',
      description: 'Configurar servidores',
      icon: <Server className="w-4 h-4" />
    },
    {
      id: 'adult',
      label: 'Conteudo adulto',
      description: `${!isAdultUnlocked ? 'Liberar' : 'Bloquear'} conteúdo`,
      icon: <div className="w-4 h-4 flex items-center justify-center">🔞</div>
    }
  ];

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
      setDropdownOpenConfig(true);
      // navigate('/config-server');
    } else if (i === FOCUS_PERFIL) {
      navigate('/profiles');
    }
  };

  const okConfig = (target: TargetConfig) => {
    clearExtras();
    // setPendingTargetConfig(target);
    setDropdownOpenConfig(false);

    if (target === 'server') {
      navigate('/config-server');
    } else if (target === 'adult') {
      setShowAdultUnlock(true);
    }
  };

  // ── Remote Control ────────────────────────────────────────────────────────

  useRemoteControl({
    onRight: () => {
      if (dropdownOpen || dropdownOpenConfig) return; // dropdown intercepta
      if (confirmRefresh) {
        setConfirmFocusBtn(1);
        return;
      }
      nextButton();
    },
    onLeft: () => {
      if (dropdownOpen || dropdownOpenConfig) return; // dropdown intercepta
      if (confirmRefresh) {
        setConfirmFocusBtn(0);
        return;
      }
      backButton();
    },
    onDown: () => {
      if (dropdownOpen || dropdownOpenConfig) return; // dropdown intercepta
      if (confirmRefresh) return;
      if (!isActive) return;
      setActiveZone('content');
      setSelectMenu(focusedIndex);
      // clearExtras();
    },
    onUp: () => {
      if (dropdownOpen || dropdownOpenConfig) return; // dropdown intercepta
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
      if (dropdownOpen || dropdownOpenConfig) return;
      okButton(focusedIndex);
    },
    onBack: () => {
      // Fechar dropdown com back
      if (dropdownOpen) {
        setDropdownOpen(false);
        return;
      }
      if (dropdownOpenConfig) {
        setDropdownOpenConfig(false);
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
          className={`fixed z-40 w-full border-b border-gray-800 top-0 transition-all duration-300 ${
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
                      {serverConfig?.url?.replace(/^https?:\/\//, '')} -
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
                    setConfirmFocusBtn(1);
                    clearExtras(); // foco padrão em "Confirmar"
                  }}
                />

                {/* Dropdown de atualização */}
                <DropdownBase
                  isLoading={isLoading}
                  isFocused={focusedConfig}
                  isOpen={dropdownOpenConfig}
                  onOpenChange={setDropdownOpenConfig}
                  options={OPTIONS_CONFIG}
                  onClick={okConfig}
                />

                {/* Perfil */}
                <button
                  className={`p-0.5 rounded-lg text-[24px] max-md:text-xl transition-all ${
                    focusedPerfil && isContent
                      ? 'bg-red-600/20 scale-110'
                      : focusedPerfil
                        ? ' bg-red-600 text-white scale-110 shadow-lg shadow-red-600/50'
                        : 'bg-gray-600 hover:bg-gray-600 text-gray-300 hover:text-white'
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
              ? 'Deseja atualizar todo o conteúdo? Isso pode levar alguns minutos.'
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

        <AdultContentUnlock open={showAdultUnlock} onClose={() => setShowAdultUnlock(false)} />
      </>
    )
  );
};

export default MainHeader;
