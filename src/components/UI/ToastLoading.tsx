import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
interface LoaderProps {
  isLoading: boolean;
  message?: string;
}

const ToastLoading: React.FC<LoaderProps> = ({ isLoading, message }) => {
  return (
    isLoading && (
      <div className="absolute min-h-screen min-w-screen inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="relative z-10 flex flex-col items-center gap-6">
          <LoadingSpinner message={message} />
        </div>

        <style>{`
      @keyframes loadingBar {
        0%   { width: 0%;   margin-left: 0%; }
        50%  { width: 70%;  margin-left: 15%; }
        100% { width: 0%;   margin-left: 100%; }
      }
    `}</style>
      </div>
    )
  );
};

export default ToastLoading;
