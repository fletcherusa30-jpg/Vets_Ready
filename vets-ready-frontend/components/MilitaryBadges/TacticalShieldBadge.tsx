import React from 'react'

interface TacticalShieldBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
}

export const TacticalShieldBadge: React.FC<TacticalShieldBadgeProps> = ({
  size = 'md',
  className = '',
}) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`${sizeMap[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="tacticalMetal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#4a5568', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#1a202c', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Main shield */}
      <path
        d="M 100 20 L 160 55 L 160 120 Q 100 165 100 165 Q 100 165 40 120 L 40 55 Z"
        fill="url(#tacticalMetal)"
        stroke="#0a0a0a"
        strokeWidth="2"
      />

      {/* Geometric lines */}
      <line x1="100" y1="30" x2="100" y2="155" stroke="#2a3f5f" strokeWidth="2" opacity="0.7" />
      <line x1="65" y1="70" x2="135" y2="70" stroke="#2a3f5f" strokeWidth="1.5" opacity="0.5" />
      <line x1="65" y1="110" x2="135" y2="110" stroke="#2a3f5f" strokeWidth="1.5" opacity="0.5" />

      {/* Center star */}
      <path
        d="M 100 55 L 105 70 L 120 70 L 108 78 L 113 93 L 100 85 L 87 93 L 92 78 L 80 70 L 95 70 Z"
        fill="#FFD700"
        stroke="#1a1a1a"
        strokeWidth="1"
      />

      {/* Top corners - tactical points */}
      <polygon points="100,20 110,35 100,40 90,35" fill="#2a3f5f" stroke="#1a1a1a" strokeWidth="1" />

      {/* Side reinforcements */}
      <rect x="50" y="70" width="8" height="30" fill="#1a1a1a" stroke="#0a0a0a" strokeWidth="0.5" />
      <rect x="142" y="70" width="8" height="30" fill="#1a1a1a" stroke="#0a0a0a" strokeWidth="0.5" />

      {/* Border rings */}
      <path
        d="M 100 25 L 155 55 L 155 115 Q 100 160 100 160 Q 100 160 45 115 L 45 55 Z"
        fill="none"
        stroke="#FFD700"
        strokeWidth="1"
        opacity="0.8"
      />

      {/* Futuristic corner accents */}
      <circle cx="55" cy="65" r="2" fill="#FFD700" opacity="0.6" />
      <circle cx="145" cy="65" r="2" fill="#FFD700" opacity="0.6" />
      <circle cx="70" cy="145" r="2" fill="#FFD700" opacity="0.6" />
      <circle cx="130" cy="145" r="2" fill="#FFD700" opacity="0.6" />
    </svg>
  )
}
