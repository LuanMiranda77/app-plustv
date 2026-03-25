import React from 'react';

interface ExpiredTrialModalProps {
  isOpen: boolean;
  onRenew: () => void;
  onLogout?: () => void;
}

const ExpiredTrialModal: React.FC<ExpiredTrialModalProps> = ({ isOpen, onRenew, onLogout }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90">
      <div className="w-full max-w-md rounded-2xl bg-neutral-900 p-6 shadow-2xl border border-neutral-800">
        {/* Título */}
        <h1 className="text-2xl font-bold text-red-600 mb-2 text-center">
          Período de Teste Expirado!
        </h1>

        {/* Mensagem */}
        <p className="text-gray-300 text-center mb-6">
          Seu acesso ao PlusTV foi encerrado. Para continuar assistindo, renove sua assinatura.
        </p>

        {/* Botões */}
        <div className="flex flex-col gap-3">
          {/* Botão principal */}
          <button
            onClick={onRenew}
            className="w-full bg-red-600 hover:bg-red-700 transition-all py-3 rounded-lg font-semibold text-white"
          >
            Renovar Agora
          </button>

          {/* Botão secundário */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full bg-neutral-800 hover:bg-neutral-700 transition-all py-3 rounded-lg text-gray-300"
            >
              Sair da Conta
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpiredTrialModal;
