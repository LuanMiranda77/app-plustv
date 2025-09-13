import React, { useEffect } from 'react';
import { Platform } from 'react-native';

interface TVRemoteHandlerProps {
  onSelect?: () => void;
  onBack?: () => void;
  onPlayPause?: () => void;
  onUp?: () => void;
  onDown?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
}

export default function TVRemoteHandler({
  onSelect,
  onBack,
  onPlayPause,
  onUp,
  onDown,
  onLeft,
  onRight,
}: TVRemoteHandlerProps) {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter':
        case ' ': // Espaço
          event.preventDefault();
          if (event.key === 'Enter' && onSelect) onSelect();
          if (event.key === ' ' && onPlayPause) onPlayPause();
          break;
        case 'Escape':
        case 'Backspace':
          event.preventDefault();
          if (onBack) onBack();
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (onUp) onUp();
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (onDown) onDown();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (onLeft) onLeft();
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (onRight) onRight();
          break;
        // Teclas específicas de TV LG webOS
        case 'MediaPlayPause':
          event.preventDefault();
          if (onPlayPause) onPlayPause();
          break;
        case 'MediaStop':
        case 'Back':
          event.preventDefault();
          if (onBack) onBack();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onSelect, onBack, onPlayPause, onUp, onDown, onLeft, onRight]);

  return null; // Este componente não renderiza nada
}