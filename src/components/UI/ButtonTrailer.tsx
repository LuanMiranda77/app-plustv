import React from 'react';
import { FaYoutube } from 'react-icons/fa';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string | undefined | null;
}

export const ButtonTrailer = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ label = 'trailer ', className = '', ...props }, ref) => {
    return (
      <div className={`${className}`}>
        <button
          ref={ref}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium
                     bg-white/10 border border-white/10 text-zinc-300
                     hover:bg-white/20 hover:text-white transition-all duration-200"
          {...props}
        >
          <FaYoutube className="text-netflix-red" size={20} />
          {label}
        </button>
      </div>
    );
  }
);

ButtonTrailer.displayName = 'Button';
