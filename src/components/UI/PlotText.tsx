import { useState } from 'react';

type Props = {
  plot: string;
  maxLength?: number;
};

export default function PlotText({ plot, maxLength = 300 }: Props) {
  const [showFull, setShowFull] = useState(false);

  if (!plot) return null;

  return (
    <div className="mb-5 max-w-4xl flex flex-col gap-3 justify-center">
      <p
        className={`text-zinc-300 text-2xl max-md:text-sm leading-relaxed text-justify ${showFull ? '' : 'line-clamp-5 max-md:line-clamp-3'}`}
      >
        {plot}
      </p>
      {plot.length > maxLength && (
        <button
          className="text-zinc-500 hover:text-zinc-300 text-center text-xl max-md:text-xs mt-1 transition-colors"
          onClick={() => setShowFull(!showFull)}
        >
          {showFull ? 'Ver menos ↑' : 'Ver mais ↓'}
        </button>
      )}
    </div>
  );
}
