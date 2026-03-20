/* eslint-disable react-hooks/set-state-in-effect */
import { Film, Heart, Home, RefreshCw, Tv2, TvMinimalPlay } from 'lucide-react';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useServerContent } from '../../../hooks/useServerContent';
import { useAuthStore } from '../../../store/authStore';
import LogoHeader from '../../Logos/LogoHeader';
import { useRemoteControl } from '../../../hooks/useRemotoControl';
import { useFocusZone } from '../../../Context/FocusContext';
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
    { title: 'Favoritos', icon: Heart, path: '/favorites' },
  ];
  const rounteInvisible = ['/profiles', '/player', '/'];
  const navigate = useNavigate();
  const location = useLocation();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const { activeProfile } = useAuthStore();
  const { lastUpdate, forceRefresh, isLoading } = useServerContent();
  const { activeZone, setActiveZone } = useFocusZone();
  const isActive = activeZone === 'menu';

  const nextButton = () => {
    if (!isActive) return;
    setFocusedIndex((i) => {
      const index = Math.min(i + 1, menus.length - 1);
      navigate(menus[index].path);
      return index;
    });
  };
  const backButton = () => {
    if (!isActive) return;
    setFocusedIndex((i) => {
      const index = Math.max(i - 1, 0);
      navigate(menus[index].path);
      return index;
    });
  };
  const okButton = (i: number) => {
    if (!isActive) return;
    setFocusedIndex(i);
    navigate(menus[i].path);
  };

  useRemoteControl({
    onRight: () => nextButton(),
    onLeft: () => backButton(),
    onOk: () => okButton(focusedIndex),
    onDown: () => {
      if (!isActive) return;
      setActiveZone('content'); // ← passa o foco para o conteúdo
    },
  });

  useEffect(() => {
    setFocusedIndex(menus.findIndex((menu) => menu.path === location.pathname));
  }, [location]);

  return (
    !rounteInvisible.includes(window.location.pathname) && (
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
                  isFocused={focusedIndex === i}
                  onClick={() => {
                    setActiveZone('menu');
                    setFocusedIndex(i);
                    navigate(menu.path);
                  }}
                  iconOffset={i !== 4}
                />
              ))}
            </section>
            <section className=" relative items-center gap-4">
              {lastUpdate && (
                <div className="absolute text-right w-[150px] top-[-15px] max-md:top-[-18px] right-0">
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
                className="bg-gray-600 p-0.5 rounded-lg text-[25px] max-md:text-xl"
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
