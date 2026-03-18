import { Film, Heart, Home, RefreshCw, Tv2, TvMinimalPlay } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useServerContent } from '../../../hooks/useServerContent';
import { useAuthStore } from '../../../store/authStore';
import { useContentStore } from '../../../store/contentStore';
import LogoHeader from '../../Logos/LogoHeader';
import moment from 'moment';
interface Props {
    scrolling: boolean;
}

const MainHeader: React.FC<Props> = ({ scrolling }) => {
    const menus = [
        { title: 'Início', icon: Home, path: '/home' },
        { title: 'TV ao Vivo', icon: Tv2, path: '/live' },
        { title: 'Filmes', icon: Film, path: '/movies' },
        { title: 'Séries', icon: TvMinimalPlay, path: '/series' },
        { title: 'Favoritos', icon: Heart, path: '/favorites' },
    ]
    const { activeProfile, serverConfig } = useAuthStore()
    const { forceRefresh, lastUpdate } = useServerContent()
    const { isLoading, } = useContentStore()


    const navigate = useNavigate()
    const rounteInvisible = ["/profiles", "/player", "/"]

    return !rounteInvisible.includes(window.location.pathname) && <div className={`fixed z-50 w-full border-b border-gray-800 top-0 transition-all duration-300 ${scrolling ? 'bg-gray-950/95 backdrop-blur' : 'bg-gray-950/80 backdrop-blur'
        }`}>


        <div className="w-full px-6 py-2">
            <div className="flex items-center justify-between">
                <LogoHeader />
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
                <section className="flex items-center gap-4">
                    {lastUpdate && (
                        <div className="flex items-center gap-2">
                            <div className="text-sm text-right">
                                <p className="text-gray-400 text-[10px]">Atualizado</p>
                                <p className="text-gray-500 text-[11px]">{moment(lastUpdate).format('DD/MM/YY, HH:mm')}</p>
                            </div>
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
                    <button className='bg-gray-600 p-0.5 rounded-lg text-[28px]' title={activeProfile?.name} onClick={() => navigate("/profiles")}>
                        {activeProfile?.avatar}
                    </button>
                </section>
            </div>
        </div>
    </div>
}

export default MainHeader;