import { Maximize, Minimize } from "lucide-react";

interface ButtonFullscreenProps {
  isFullscreen: boolean;
  onFullscreen: () => void;
}

const ButtonFullscreen: React.FC<ButtonFullscreenProps> = ({ isFullscreen, onFullscreen }) => {
  return (
    <button
      onClick={onFullscreen}
      className="text-white hover:text-red-600 transition-colors p-2 rounded hover:bg-white/10"
      title="Tela cheia (F)"
    >
      {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
    </button>
  );
};

export default ButtonFullscreen;
