type Props = {
  id: string;
  name: string;
  isSelected: boolean;
  isFocused?: boolean;
  onClick: () => void;
};

export default function ButtonCategory({
  id,
  name,
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
        text-left px-4 py-2 rounded-tl-full rounded-bl-full
        text-2xl max-md:text-xs font-semibold whitespace-nowrap
        transition-all duration-200
        ${
          isSelected
            ? 'bg-red-600 text-white'
            : isFocused
              ? 'bg-gray-500 text-white scale-105'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        }
      `}
    >
      {name.replace('FILMES |', '')}
    </button>
  );
}
