import { ArrowLeft } from 'lucide-react';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title?: string;
  className?: string;
  isFocused?: boolean;
}

export const ButtonBack = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ disabled, className = '', title, isFocused, ...props }, ref) => {
    return (
      <div className={`flex items-center left-4 gap-2 ${className}`}>
        <button
          ref={ref}
          disabled={disabled}
          className={`flex items-center gap-2 px-4 py-2 transition-colors rounded 
            ${isFocused ? 'scale-105 bg-white/10 text-netflix-red' : 'text-white'}
          hover:text-red-600 hover:bg-white/10`}
          {...props}
        >
          <ArrowLeft className="w-8 h-8" />
          <span className="text-4xl max-md:text-sm">Voltar</span>
        </button>
        <h6>{title}</h6>
      </div>
    );
  }
);

ButtonBack.displayName = 'Button';
