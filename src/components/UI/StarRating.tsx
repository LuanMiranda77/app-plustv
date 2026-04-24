import React from 'react';

interface StarRatingProps {
  rating: string | number | undefined;
  color?: "white"|"yellow";
}

const StartRating: React.FC<StarRatingProps> = ({ rating, color="yellow" }) => {
  const colorText = {
    white: 'text-white',
    yellow: 'text-yellow-400',
  };
  const colorBg = {
    white: 'fill-white',
    yellow: 'fill-yellow-400',
  };

  return (
    <span
      className={`flex items-center gap-1 ${colorText[color]} text-2xl max-sm:text-sm font-medium`}
    >
      <svg className={`w-6 h-6 max-sm:w-5 max-sm:h-5 ${colorBg[color]}`} viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      {rating}
    </span>
  );
};

export default StartRating;
