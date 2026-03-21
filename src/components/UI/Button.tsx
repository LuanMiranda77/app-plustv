import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      isLoading = false,
      variant = 'primary',
      size = 'md',
      disabled,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center
      font-semibold rounded-lg
      transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
    `

    const variants = {
      primary: `
        bg-red-600 hover:bg-red-700 active:bg-red-800
        text-white shadow-lg shadow-red-600/20
      `,
      secondary: `
        bg-gray-800 hover:bg-gray-700 active:bg-gray-600
        text-white border border-gray-700
      `,
      danger: `
        bg-red-500/20 hover:bg-red-500/30
        text-red-400 border border-red-500/50
      `,
    }

    const sizes = {
      sm: 'px-3 py-1.5',
      md: 'px-6 py-2.5',
      lg: 'px-8 py-3',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`text-2xl max-md:text-sm ${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
)

Button.displayName = 'Button'
