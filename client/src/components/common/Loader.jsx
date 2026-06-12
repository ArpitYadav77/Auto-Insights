import React from 'react'

/* ===== Spinner Loader ===== */
export function Spinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        className="animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-20"
          cx="12"
          cy="12"
          r="10"
          stroke="url(#spinGrad)"
          strokeWidth="4"
        />
        <path
          className="opacity-90"
          fill="url(#spinGrad)"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
        <defs>
          <linearGradient id="spinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

/* ===== Skeleton Loader ===== */
export function Skeleton({ className = '', rounded = 'rounded-lg' }) {
  return (
    <div
      className={`skeleton animate-pulse bg-white/5 ${rounded} ${className}`}
    />
  )
}

/* ===== Skeleton Card ===== */
export function SkeletonCard() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10" rounded="rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" rounded="rounded-lg" />
        <Skeleton className="h-8 w-20" rounded="rounded-lg" />
      </div>
    </div>
  )
}

/* ===== Full Page Loader ===== */
export function FullPageLoader({ text = 'Loading...' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-dark-900/95 backdrop-blur-sm">
      <div className="relative">
        {/* Outer glow */}
        <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 blur-xl opacity-30 animate-pulse" />

        {/* Spinner */}
        <Spinner size="xl" />
      </div>

      {/* Brand text */}
      <div className="mt-8 text-center">
        <h2 className="text-xl font-bold gradient-text mb-2">Auto Insights</h2>
        <p className="text-sm text-gray-400 animate-pulse">{text}</p>
      </div>

      {/* Floating dots */}
      <div className="flex gap-1.5 mt-6">
        <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-accent-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

/* ===== Bouncing Dots Loader ===== */
export function DotsLoader({ className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-1.5 ${className}`}>
      <div
        className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-bounce"
        style={{ animationDelay: '0ms' }}
      />
      <div
        className="w-2.5 h-2.5 rounded-full bg-accent-500 animate-bounce"
        style={{ animationDelay: '150ms' }}
      />
      <div
        className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-bounce"
        style={{ animationDelay: '300ms' }}
      />
    </div>
  )
}

/* ===== Inline Loader (for buttons/small areas) ===== */
export function InlineLoader({ text = 'Processing' }) {
  return (
    <div className="flex items-center gap-3 text-gray-400">
      <Spinner size="sm" />
      <span className="text-sm">{text}</span>
    </div>
  )
}
