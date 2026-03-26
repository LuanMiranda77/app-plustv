/* eslint-disable react-hooks/immutability */
import { Cog, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useFocusZone } from '../../Context/FocusContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TargetConfig = 'server' | 'adult';

export interface OptionTypeConfig {
  id: TargetConfig;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface RefreshDropdownProps {
  isLoading?: boolean;
  loadingTarget?: TargetConfig | null;
  isFocused?: boolean;
  onClick: (target: TargetConfig) => void;
  options: OptionTypeConfig[];
  mainElement?: React.ReactNode;
  // ── Controlled open state (para useRemoteControl) ─────────────────────────
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const DropdownBase = ({
  isLoading = false,
  loadingTarget = null,
  isFocused = false,
  onClick,
  options,
  mainElement,
  isOpen: isOpenProp,
  onOpenChange,
}: RefreshDropdownProps) => {
  // Se vier isOpen/onOpenChange de fora, usa controlled. Senão, uncontrolled.
  const isControlled = isOpenProp !== undefined
  const [isOpenInternal, setIsOpenInternal] = useState(false)
  const isOpen = isControlled ? isOpenProp! : isOpenInternal
    const { activeZone } = useFocusZone();
    const isContent = activeZone === 'content';

  const setIsOpen = (val: boolean) => {
    if (isControlled) {
      onOpenChange?.(val)
    } else {
      setIsOpenInternal(val)
    }
  }

  const [focusedOption, setFocusedOption] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Reset focusedOption ao abrir
  useEffect(() => {
    if (isOpen) setFocusedOption(0)
  }, [isOpen])

  // Navegação por teclado quando aberto
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.keyCode === 40) {
        e.stopPropagation();
        e.preventDefault();
        setFocusedOption(i => Math.min(i + 1, options.length - 1));
      }
      if (e.keyCode === 38) {
        e.stopPropagation();
        e.preventDefault();
        setFocusedOption(i => Math.max(i - 1, 0));
      }
      if (e.keyCode === 13 || e.keyCode === 44) {
        e.stopPropagation();
        e.preventDefault();
        handleSelect(options[focusedOption].id);
      }
      if (e.keyCode === 27 || e.keyCode === 461) {
        e.stopPropagation();
        e.preventDefault();
        setIsOpen(false);
      }
    };
    // capture=true para interceptar antes do useRemoteControl
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [isOpen, focusedOption, options]);

  const handleSelect = (target: TargetConfig) => {
    setIsOpen(false);
    onClick(target);
  };

  const handleButtonClick = () => {
    if (isLoading) return;
    setIsOpen(!isOpen);
  };

  const isItemLoading = (id: TargetConfig) =>
    isLoading && (loadingTarget === id);

  return (
    <div ref={dropdownRef} className="relative">
      {/* ── Botão principal ─────────────────────────────────────────────── */}
      <button
        onClick={handleButtonClick}
        disabled={isLoading}
        title="Atualizar conteúdo"
        className={`
          relative p-2 rounded-lg transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${
            isFocused && isContent
              ? 'bg-red-600/20 scale-110': isFocused || isOpen
              ? 'bg-red-600 scale-110 shadow-lg shadow-red-600/50'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }
        `}
      >
        {mainElement ?? (
          <Cog
            className={`
              w-6 h-6 max-md:w-4 max-md:h-4
              ${isFocused || isOpen ? 'text-white' : 'text-red-600'}
              ${isLoading ? 'animate-spin' : ''}
            `}
          />
        )}

        {/* Indicador de loading por tipo */}
        {isLoading && loadingTarget && (
          <span
            className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full
                           animate-pulse border border-gray-900"
          />
        )}
      </button>

      {/* ── Dropdown ────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-60 z-[200]
                     bg-gray-900 border border-gray-700 rounded-xl
                     shadow-2xl shadow-black/60 overflow-hidden
                     animate-[dropdownIn_0.15s_ease_both]"
        >
          <style>{`
            @keyframes dropdownIn {
              from { opacity: 0; transform: translateY(-6px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>

          {/* Header */}
          <div className="px-4 py-2.5 border-b border-gray-800">
            <p className="text-zinc-400 text-xs uppercase tracking-widest">Configuração</p>
          </div>

          {/* Opções */}
          {options.map((option, i) => {
            const loading = isItemLoading(option.id);
            const focused = focusedOption === i;

            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                onMouseEnter={() => setFocusedOption(i)}
                disabled={isLoading}
                className={`
                  w-full flex items-center gap-3 px-4 py-3
                  text-left transition-colors duration-150
                  disabled:cursor-not-allowed
                  ${i !== 0 ? 'border-t border-gray-800/60' : ''}
                  ${
                    focused
                      ? 'bg-red-600/20 text-white'
                      : 'text-zinc-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                {/* Ícone */}
                <div
                  className={`
                  flex-shrink-0 w-8 h-8 rounded-lg
                  flex items-center justify-center
                  ${focused ? 'bg-red-600 text-white' : 'bg-gray-800 text-zinc-400'}
                  ${!focused ? 'bg-red-600/20 text-red-400' : ''}
                `}
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : option.icon}
                </div>

                {/* Texto */}
                <div className="flex-1 min-w-0">
                  <p className="text-lg max-sm:text-sm font-medium leading-none mb-0.5">
                    {option.label}
                  </p>
                  <p className="text-zinc-500 text-sm max-sm:text-xs">
                    {loading ? 'Atualizando...' : option.description}
                  </p>
                </div>

                {/* Indicador focused */}
                {focused && <div className="w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DropdownBase;
