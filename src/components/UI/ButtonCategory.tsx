type Props = {
  id: string;
  name: string;
  icon?: React.ReactNode;
  isSelected: boolean;
  isFocused?: boolean;
  onClick: () => void;
};

export default function ButtonCategory({
  id,
  name,
  icon,
  isSelected,
  isFocused = false,
  onClick,
}: Props) {
  return (
    <button
      key={id}
      data-focused={isFocused ? 'true' : 'false'}
      onClick={onClick}
      className={`
        flex items-center gap-2 max-md:gap-1
        text-left px-4 py-2 rounded-tl-full rounded-bl-full
        text-2xl max-md:text-xs font-semibold whitespace-nowrap
        transition-all duration-200
        focus:bg-red-600 focus:text-white focus:scale-105
        ${
          isSelected
            ? `bg-red-600 text-white ${isFocused && 'scale-105'}`
            : isFocused
              ? 'bg-gray-500 text-white scale-105'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        }
      `}
    >
      {icon}
      {name}
    </button>
  );
}
