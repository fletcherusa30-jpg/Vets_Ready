import React from 'react'

interface AirborneBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
}

export const AirborneBadge: React.FC<AirborneBadgeProps> = ({ size = 'md', className = '' }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`${sizeMap[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="airborneMetal" cx="40%" cy="40%">
          <stop offset="0%" style={{ stopColor: '#e0e0e0', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#b0b0b0', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#505050', stopOpacity: 1 }} />
        </radialGradient>
        <filter id="airborneGlow">
          <feDropShadow dx="1" dy="1" stdDeviation="2" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Shield base */}
      <path
        d="M 100 20 L 160 50 L 160 110 Q 100 160 100 160 Q 100 160 40 110 L 40 50 Z"
        fill="url(#airborneMetal)"
        stroke="#1a1a1a"
        strokeWidth="2"
        filter="url(#airborneGlow)"
      />

      {/* Left Wing */}
      <path
        d="M 70 90 Q 50 80 40 95 Q 50 90 70 100 Z"
        fill="#8B7355"
        stroke="#1a1a1a"
        strokeWidth="1"
      />

      {/* Right Wing */}
      <path
        d="M 130 90 Q 150 80 160 95 Q 150 90 130 100 Z"
        fill="#8B7355"
        stroke="#1a1a1a"
        strokeWidth="1"
      />

      {/* Central Star */}
      <path
        d="M 100 50 L 105 65 L 120 65 L 108 73 L 113 88 L 100 80 L 87 88 L 92 73 L 80 65 L 95 65 Z"
        fill="#FFD700"
        stroke="#1a1a1a"
        strokeWidth="1"
      />

      {/* Inner shield accent */}
      <path
        d="M 100 30 L 150 55 L 150 105 Q 100 150 100 150 Q 100 150 50 105 L 50 55 Z"
        fill="none"
        stroke="#FFD700"
        strokeWidth="1.5"
      />
    </svg>
  )
}
