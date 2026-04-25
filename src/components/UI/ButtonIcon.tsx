import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string | undefined | null;
  isFocused?: boolean;
  icon?: React.ReactNode;
}

export const ButtonIcon = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ label = 'Trailer ', className = '', isFocused, icon, ...props }, ref) => {
    return (
      <div className={`${className}`}>
        <button
          ref={ref}
          className={`
            flex items-center gap-2 px-4 py-3 rounded-xl text-4xl max-md:text-sm font-medium
            bg-white/10 border border-white/10 text-zinc-300
            hover:bg-white/20 hover:text-white transition-all duration-200
            disbled:cursor-not-allowed disabled:bg-white/5 disabled:border-white/10 disabled:text-gray-600
            ${isFocused && ' border-red-600 text-white scale-105 ring-1 ring-red-500'}
          `}
          {...props}
        >
          {icon}
          {label}
        </button>
      </div>
    );
  }
);
