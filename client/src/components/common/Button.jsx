import React from 'react'
import { motion } from 'framer-motion'

const variants = {
  primary:
    'bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-600 hover:to-accent-600 text-white shadow-brand',
  secondary:
    'bg-white/10 hover:bg-white/20 text-white border border-white/10',
  outline:
    'bg-transparent border border-brand-500/50 text-brand-400 hover:bg-brand-500/10',
  ghost:
    'bg-transparent hover:bg-white/5 text-gray-300 hover:text-white',
  danger:
    'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30',
  success:
    'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-base rounded-xl gap-2.5',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const isDisabled = disabled || loading

  return (
    <motion.button
      whileHover={isDisabled ? {} : { scale: 1.02 }}
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:ring-offset-2 focus:ring-offset-dark-900
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4"
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
      ) : Icon ? (
        React.isValidElement(Icon) ? (
          React.cloneElement(Icon, { className: `w-4 h-4 flex-shrink-0 ${Icon.props.className || ''}` })
        ) : (
          <Icon className="w-4 h-4 flex-shrink-0" />
        )
      ) : null}
      {children && <span>{children}</span>}
      {IconRight && !loading && (
        React.isValidElement(IconRight) ? (
          React.cloneElement(IconRight, { className: `w-4 h-4 flex-shrink-0 ${IconRight.props.className || ''}` })
        ) : (
          <IconRight className="w-4 h-4 flex-shrink-0" />
        )
      )}
    </motion.button>
  )
}
