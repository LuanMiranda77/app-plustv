type Props = {
  title: string;
  icon: React.ElementType;
  isFocused: boolean;
  onClick: () => void;
  iconOffset?: boolean;
};

export default function MenuButton({
  title,
  icon: Icon,
  isFocused,
  onClick,
  iconOffset = true,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={`
        relative overflow-hidden
        text-2xl max-md:text-sm
        flex items-center gap-1 px-3 py-2 
        rounded-lg transition-all duration-300 ease-in-out
        menu-btn-fill
        ${isFocused ? 'focused' : 'unfocused'}
        ${isFocused ? 'scale-105 shadow-lg shadow-red-600/20' : 'border-transparent scale-100'}
        hover:bg-gray-800
      `}
    >
      <Icon
        className={`
          relative z-10
          transition-all duration-300
          w-6 h-6 max-md:w-3.5 max-md:h-3.5
          text-netflix-red
          ${iconOffset ? 'mt-1 max-md:mt-0' : ''}
        `}
      />
      <span
        className={`
          relative z-10
          transition-all duration-300
          ${isFocused ? 'text-white font-semibold' : 'text-gray-300'}
        `}
      >
        {title}
      </span>
    </button>
  );
}
