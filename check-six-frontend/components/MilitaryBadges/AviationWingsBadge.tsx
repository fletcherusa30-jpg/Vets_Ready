import React from 'react'

interface AviationWingsBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
}

export const AviationWingsBadge: React.FC<AviationWingsBadgeProps> = ({
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
        <linearGradient id="aviationBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#4a90e2', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#2c5aa0', stopOpacity: 1 }} />
        </linearGradient>
        <pattern id="radarGrid" width="15" height="15" patternUnits="userSpaceOnUse">
          <circle cx="7.5" cy="7.5" r="1" fill="#666" opacity="0.5" />
          <line x1="0" y1="7.5" x2="15" y2="7.5" stroke="#666" strokeWidth="0.5" opacity="0.3" />
          <line x1="7.5" y1="0" x2="7.5" y2="15" stroke="#666" strokeWidth="0.5" opacity="0.3" />
        </pattern>
      </defs>

      {/* Radar grid background */}
      <rect x="0" y="0" width="200" height="200" fill="url(#radarGrid)" />

      {/* Circular radar ring */}
      <circle cx="100" cy="100" r="85" fill="url(#aviationBlue)" opacity="0.3" stroke="#2c5aa0" strokeWidth="2" />

      {/* Left Wing */}
      <path
        d="M 100 100 L 20 85 Q 10 100 20 115 Z"
        fill="#1a1a8b"
        stroke="#2c5aa0"
        strokeWidth="1.5"
      />

      {/* Right Wing */}
      <path
        d="M 100 100 L 180 85 Q 190 100 180 115 Z"
        fill="#1a1a8b"
        stroke="#2c5aa0"
        strokeWidth="1.5"
      />

      {/* Central Jet Silhouette */}
      <g transform="translate(100, 100)">
        {/* Fuselage */}
        <rect x="-4" y="-25" width="8" height="50" fill="#003366" stroke="#2c5aa0" strokeWidth="1" />

        {/* Cockpit */}
        <circle cx="0" cy="-20" r="3" fill="#FFD700" />

        {/* Tail fins */}
        <polygon points="0,25 -6,35 6,35" fill="#003366" stroke="#2c5aa0" strokeWidth="1" />

        {/* Wing details */}
        <rect x="-15" y="-5" width="30" height="6" fill="#1a1a8b" stroke="#2c5aa0" strokeWidth="1" />

        {/* Afterburner glow */}
        <circle cx="0" cy="30" r="4" fill="#FFD700" opacity="0.7" />
      </g>

      {/* Radar circles */}
      <circle cx="100" cy="100" r="40" fill="none" stroke="#2c5aa0" strokeWidth="0.5" opacity="0.6" />
      <circle cx="100" cy="100" r="60" fill="none" stroke="#2c5aa0" strokeWidth="0.5" opacity="0.6" />
      <circle cx="100" cy="100" r="80" fill="none" stroke="#2c5aa0" strokeWidth="1" />
    </svg>
  )
}
