import { RectangleHorizontalIcon } from 'lucide-react';

type ButtonColor = 'yellow' | 'red' | 'green' | 'blue';

const colorMap: Record<
  ButtonColor,
  { wrapper: string; border: string; text: string; icon: string }
> = {
  yellow: {
    wrapper: 'bg-yellow-600/20',
    border: 'border-yellow-600/50',
    text: 'text-yellow-400',
    icon: 'fill-amber-400 text-amber-400'
  },
  red: {
    wrapper: 'bg-red-600/20',
    border: 'border-red-600/50',
    text: 'text-red-400',
    icon: 'fill-red-400 text-red-400'
  },
  green: {
    wrapper: 'bg-green-600/20',
    border: 'border-green-600/50',
    text: 'text-green-400',
    icon: 'fill-green-400 text-green-400'
  },
  blue: {
    wrapper: 'bg-blue-600/20',
    border: 'border-blue-600/50',
    text: 'text-blue-400',
    icon: 'fill-blue-400 text-blue-400'
  }
};

const labelMap: Record<ButtonColor, string> = {
  yellow: 'Botão Amarelo',
  red: 'Botão Vermelho',
  green: 'Botão Verde',
  blue: 'Botão Azul'
};

type Props = {
  color: ButtonColor;
  label: string;
};

export default function RemoteHint({ color, label }: Props) {
  const c = colorMap[color];

  return (
    <div className={`mb-6 p-3 ${c.wrapper} border ${c.border} rounded-lg max-w-md hidden md:block`}>
      <p className={`${c.text} text-xl flex items-center gap-2`}>
        <RectangleHorizontalIcon className={`text-lg ${c.icon}`} />
        <span>
          <strong>{labelMap[color]}:</strong> {label}
        </span>
      </p>
    </div>
  );
}
