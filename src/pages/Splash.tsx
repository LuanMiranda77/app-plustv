import { useEffect, useRef, useState } from 'react';
const introapp = './introapp.mp4';
import poster from '/icons.png';

interface SplashProps {
  onFinish: () => void;
}

export const Splash = ({ onFinish }: SplashProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      setFadeOut(true);
      setTimeout(onFinish, 600);
    };

    // Fallback caso o vídeo não carregue ou trave
    const timeout = setTimeout(onFinish, 15000);

    video.addEventListener('ended', handleEnded);
    video.play().catch(() => {
      // Autoplay bloqueado → pular splash
      onFinish();
    });

    return () => {
      video.removeEventListener('ended', handleEnded);
      clearTimeout(timeout);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[200] bg-black flex items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <video
        ref={videoRef}
        src={introapp}
        poster={poster}
        muted
        playsInline
        className="w-full h-full object-contain"
      />
    </div>
  );
};
