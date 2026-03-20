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
          className={`flex items-center gap-2 p-2 text-white transition-colors rounded 
            ${isFocused ? 'scale-105 text-red-600 bg-white/10' : ''}
          hover:text-red-600 hover:bg-white/10`}
          {...props}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-2xl max-md:text-sm">Voltar</span>
        </button>
        <h6>{title}</h6>
      </div>
    );
  }
);

ButtonBack.displayName = 'Button';
