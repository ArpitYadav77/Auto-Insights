import React, { useState } from 'react'
import { HiEye, HiEyeOff } from 'react-icons/hi'

export default function Input({
  label,
  error,
  icon: Icon,
  type = 'text',
  placeholder,
  className = '',
  containerClassName = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            {React.isValidElement(Icon) ? (
              React.cloneElement(Icon, { className: `w-4.5 h-4.5 text-gray-500 ${Icon.props.className || ''}` })
            ) : (
              <Icon className="w-4.5 h-4.5 text-gray-500" />
            )}
          </div>
        )}
        <input
          type={inputType}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3 bg-white/5 border rounded-xl text-white
            placeholder-gray-500 text-sm
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/40
            hover:bg-white/[0.07] hover:border-white/20
            ${Icon ? 'pl-10' : ''}
            ${isPassword ? 'pr-10' : ''}
            ${error ? 'border-rose-500/50 focus:ring-rose-500/40' : 'border-white/10'}
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
          >
            {showPassword ? (
              <HiEyeOff className="w-4.5 h-4.5" />
            ) : (
              <HiEye className="w-4.5 h-4.5" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
