import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const bannerBg = './icons.png';

type Props = {
  title?: string;
  description?: string;
  buttonLabel?: string;
  navigateTo?: string;
  isFocused?: boolean;
};

export default function MainBanner({
  title = 'Comece a Assistir',
  description = 'Acesse seus filmes, séries e canais favoritos em qualquer lugar',
  buttonLabel = 'Explorar Conteúdo',
  navigateTo = '/movie',
  isFocused = false
}: Props) {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-no-repeat bg-right" style={{ backgroundImage: `url(${bannerBg})` }}>
      <div className="relative h-96 bg-gradient-to-r from-red-600/40 via-transparent to-transparent overflow-hidden flex items-center p-8 mb-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent opacity-50" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <h2 className="text-5xl font-bold text-white mb-4">{title}</h2>
          <p className="text-gray-300 text-lg mb-6 max-w-3xl">{description}</p>
          <button
            onClick={() => navigate(navigateTo)}
            className={`
              flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all shadow-lg
              ${
                isFocused
                  ? 'bg-white text-black scale-105 shadow-white/30'
                  : 'bg-red-600 hover:bg-red-700 text-white hover:shadow-red-600/50'
              }
            `}
          >
            <Play className="w-5 h-5 fill-current" />
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
