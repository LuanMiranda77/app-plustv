import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useBackGuard } from '../../hooks/useBackGuard';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Classes extras aplicadas ao painel do modal (tamanho, padding, etc.) */
  className?: string;
}

/**
 * Modal genérico otimizado para TV.
 *
 * - Fecha com ESC / botão voltar (webOS 461, Tizen 10009)
 * - Fecha ao clicar no overlay
 * - Animação de entrada via transform + opacity (GPU-accelerated)
 * - Renderizado via portal sobre toda a árvore
 * - Memorizado para evitar re-renders desnecessários
 */
export const Modal = memo(({ open, onClose, children, className = '' }: ModalProps) => {
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Dispara animação de entrada/saída no próximo frame (evita setState síncrono no effect)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(open));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // ESC + botão voltar (webOS: 461, Tizen: 10009, padrão: Escape)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.keyCode === 461 || e.keyCode === 10009) {
        e.preventDefault();
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleKeyDown]);

  // Intercepta voltar nativo do navegador/TV (popstate)
  useBackGuard(open, onClose);

  // Clique fora do painel (apenas no overlay)
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose]
  );

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-999 bg-black/80 transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`will-change-transform w-full h-full transition-[transform,opacity] duration-200 ease-out ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        } ${className}`}
      >
        {children}
      </div>
    </div>,
    document.body
  );
});

Modal.displayName = 'Modal';
