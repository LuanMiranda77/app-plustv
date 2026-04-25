import { useState } from 'react';
import { storage } from '../../utils/storage';
import { Button } from './Button';
import { Input } from './Input';

interface Props {
  open: boolean;
  onClose: () => void;
}
export function AdultContentUnlock({ open, onClose }: Props) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const adultUnlocked = storage.get('adult-unlocked') === true;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input === '0000') {
      setError('');
      storage.set('adult-unlocked', !adultUnlocked);
      onClose();
    } else {
      setError('Senha incorreta');
    }
  }

  return (
    open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 ">
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 relative">
          <button
            className="absolute top-0 right-2 text-gray-400 hover:text-white text-4xl max-md:text-2xl"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center 
            gap-2 p-4 bg-gray-900 rounded-lg b
            order border-gray-700 max-w-lg mx-auto mt-8"
          >
            <Input
              label={`Digite a senha para ${adultUnlocked ? 'bloquear' : 'liberar'} conteúdo adulto:`}
              type="password"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.keyCode == 13 && handleSubmit(e)}
              className="px-3 py-3 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none max-w-[250px]"
              maxLength={4}
              inputMode="numeric"
              pattern="[0-9]*"
              autoFocus
              placeholder="Senha de 4 dígitos"
            />
            {error && <span className="text-red-500 text-lg max-md:text-sm">{error}</span>}
            <Button type="submit">Liberar</Button>
          </form>
        </div>
      </div>
    )
  );
}
