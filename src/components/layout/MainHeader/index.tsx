import { Film, Heart, Home, Tv2, TvMinimalPlay } from 'lucide-react';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServerContent } from '../../../hooks/useServerContent';
import { useAuthStore } from '../../../store/authStore';
import LogoHeader from '../../Logos/LogoHeader';
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
  const { activeProfile } = useAuthStore();
  const { lastUpdate } = useServerContent();
  const navigate = useNavigate();
  const rounteInvisible = ['/profiles', '/player', '/'];
  useEffect(() => {
    if (window.location.pathname === '/') {
      navigate('/home');
    }
  },[window.location.pathname])

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
            {lastUpdate && (
              <div className="absolute w-[150px] bottom-[-10px] left-[2.3rem]">
                <p className="text-gray-400 text-[10.5px]">
                  <b className="text-gray-300">Atualizado</b>{' '}
                  {moment(lastUpdate).format('DD/MM/YY')}
                </p>
                {/* <button
                                onClick={() => forceRefresh()}
                                disabled={isLoading}
                                className="p-2 transition-colors rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Atualizar agora"
                            >
                                <RefreshCw className={`w-5 h-5 text-red-600 ${isLoading ? 'animate-spin' : ''}`} />
                            </button> */}
              </div>
            )}
            <section className="flex items-center gap-2">
              {menus.map((menu) => (
                <button
                  key={menu.title}
                  onClick={() => navigate(menu.path)}
                  autoFocus={window.location.pathname === menu.path}
                  className="flex items-center gap-1 px-3 py-2 transition-colors rounded-lg focus:bg-gray-800 focus:outline-1 focus:outline-indigo-950 hover:bg-gray-800"
                >
                  <menu.icon className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-gray-300">{menu.title}</span>
                </button>
              ))}
            </section>
            <section className=" relative items-center gap-4">
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
