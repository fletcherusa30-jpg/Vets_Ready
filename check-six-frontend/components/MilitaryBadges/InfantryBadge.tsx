import React from 'react'

interface InfantryBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
}

export const InfantryBadge: React.FC<InfantryBadgeProps> = ({ size = 'md', className = '' }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`${sizeMap[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="infantrySteel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#4a4a4a', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#1a1a1a', stopOpacity: 1 }} />
        </linearGradient>
        <filter id="infantryShadow">
          <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* Shield background */}
      <path
        d="M 100 20 L 160 50 L 160 120 Q 100 170 100 170 Q 100 170 40 120 L 40 50 Z"
        fill="url(#infantrySteel)"
        stroke="#0a0a0a"
        strokeWidth="3"
        filter="url(#infantryShadow)"
      />

      {/* Left Rifle */}
      <g transform="translate(70, 85) rotate(-25)">
        <rect x="-2" y="-25" width="4" height="50" fill="#1a1a1a" stroke="#333" strokeWidth="0.5" />
        <circle cx="0" cy="25" r="4" fill="#333" />
        <rect x="-5" y="-5" width="10" height="4" fill="#333" />
      </g>

      {/* Right Rifle */}
      <g transform="translate(130, 85) rotate(25)">
        <rect x="-2" y="-25" width="4" height="50" fill="#1a1a1a" stroke="#333" strokeWidth="0.5" />
        <circle cx="0" cy="25" r="4" fill="#333" />
        <rect x="-5" y="-5" width="10" height="4" fill="#333" />
      </g>

      {/* Tactical Sight */}
      <circle cx="100" cy="100" r="12" fill="none" stroke="#555" strokeWidth="1.5" />
      <line x1="100" y1="88" x2="100" y2="112" stroke="#555" strokeWidth="1" />
      <line x1="88" y1="100" x2="112" y2="100" stroke="#555" strokeWidth="1" />

      {/* Shield inner border */}
      <path
        d="M 100 25 L 155 50 L 155 115 Q 100 160 100 160 Q 100 160 45 115 L 45 50 Z"
        fill="none"
        stroke="#555"
        strokeWidth="1"
      />
    </svg>
  )
}
