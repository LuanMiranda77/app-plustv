import React from 'react';
interface PlayerTrailerProps {
  title: string;
  className?: string;
  youtubeId: string;
  width?: string | number;
  height?: string | number;
}

const PlayerTrailer: React.FC<PlayerTrailerProps> = ({
  youtubeId,
  className,
  width = '560',
  height = '315',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center flex-1 border-6 border-gray-950 rounded-lg mx-4 ${className}`}
    >
      <div className="w-full text-2xl max-md:text-sm font-semibold line-clamp-1 bg-netflix-red">
        Preview
      </div>
      <iframe
        width={width}
        height={height}
        src={`https://www.youtube.com/embed/${youtubeId}?si=W2aAi_KvrySLBSX1&controls=1&modestbranding=1&rel=1&showinfo=1&autoplay=0&mute=0`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
      ></iframe>
    </div>
  );
};

export default PlayerTrailer;
