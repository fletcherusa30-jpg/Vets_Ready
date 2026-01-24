import React from 'react'

interface HALOWingBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
}

export const HALOWingBadge: React.FC<HALOWingBadgeProps> = ({ size = 'md', className = '' }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`${sizeMap[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="haloMetal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#c0c0c0', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#707070', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#3a3a3a', stopOpacity: 1 }} />
        </linearGradient>
        <filter id="haloShadow">
          <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Circular background */}
      <circle cx="100" cy="100" r="95" fill="url(#haloMetal)" filter="url(#haloShadow)" />

      {/* Left Wing */}
      <path
        d="M 100 100 L 30 60 L 20 70 L 40 95 L 35 110 L 55 105 Z"
        fill="#8B8B8B"
        stroke="#2a2a2a"
        strokeWidth="2"
      />

      {/* Right Wing */}
      <path
        d="M 100 100 L 170 60 L 180 70 L 160 95 L 165 110 L 145 105 Z"
        fill="#8B8B8B"
        stroke="#2a2a2a"
        strokeWidth="2"
      />

      {/* Central Parachute Canopy */}
      <path
        d="M 85 80 Q 100 50 115 80 L 115 100 Q 100 95 85 100 Z"
        fill="#A9A9A9"
        stroke="#2a2a2a"
        strokeWidth="1.5"
      />

      {/* Spearhead Symbol */}
      <path
        d="M 100 110 L 90 130 L 100 140 L 110 130 Z"
        fill="#FFD700"
        stroke="#2a2a2a"
        strokeWidth="1.5"
      />

      {/* Lightning Bolt Accents */}
      <path
        d="M 60 95 L 70 90 L 65 100 L 75 98"
        stroke="#FFD700"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 130 95 L 140 90 L 135 100 L 145 98"
        stroke="#FFD700"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Border Ring */}
      <circle cx="100" cy="100" r="95" fill="none" stroke="#1a1a1a" strokeWidth="2" />
      <circle cx="100" cy="100" r="90" fill="none" stroke="#FFD700" strokeWidth="1" />
    </svg>
  )
}
