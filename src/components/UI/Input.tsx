import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="text-left block mb-2 text-2xl max-md:text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-lg
            bg-gray-900 border border-gray-700
            text-white placeholder-gray-500
            focus:outline-none focus:border-red-600 focus:border-2 focus:ring-red-500/20
            transition-all duration-200
            ${error ? 'border-red-500' : ''}
            ${className}
            disabled:bg-gray-800 disabled:border-gray-700 disabled:cursor-not-allowed disabled:opacity-50
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
