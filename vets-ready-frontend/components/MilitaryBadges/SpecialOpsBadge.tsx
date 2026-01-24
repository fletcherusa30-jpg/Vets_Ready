import React from 'react'

interface SpecialOpsBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
}

export const SpecialOpsBadge: React.FC<SpecialOpsBadgeProps> = ({ size = 'md', className = '' }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`${sizeMap[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="specialOpsGlow">
          <feGaussianBlur stdDeviation="2" />
          <feDropShadow dx="1" dy="1" stdDeviation="2" floodOpacity="0.8" />
        </filter>
      </defs>

      {/* Dark matte background */}
      <circle cx="100" cy="100" r="95" fill="#1a1a1a" stroke="#0a0a0a" strokeWidth="2" />

      {/* Left Wing (Subdued) */}
      <path
        d="M 100 100 L 50 70 Q 40 85 50 100 Z"
        fill="#2a2a2a"
        stroke="#1a1a1a"
        strokeWidth="1"
        filter="url(#specialOpsGlow)"
      />

      {/* Right Wing (Subdued) */}
      <path
        d="M 100 100 L 150 70 Q 160 85 150 100 Z"
        fill="#2a2a2a"
        stroke="#1a1a1a"
        strokeWidth="1"
        filter="url(#specialOpsGlow)"
      />

      {/* Central Dagger */}
      <g transform="translate(100, 100)">
        {/* Blade */}
        <path d="M 0 -30 L 6 5 L 0 25 L -6 5 Z" fill="#3a3a3a" stroke="#1a1a1a" strokeWidth="1" />

        {/* Guard */}
        <rect x="-12" y="3" width="24" height="4" fill="#4a4a4a" stroke="#1a1a1a" strokeWidth="1" />

        {/* Handle */}
        <rect x="-4" y="7" width="8" height="12" fill="#2a2a2a" stroke="#1a1a1a" strokeWidth="1" />

        {/* Pommel */}
        <circle cx="0" cy="22" r="3" fill="#4a4a4a" stroke="#1a1a1a" strokeWidth="1" />
      </g>

      {/* Subtle inner circle */}
      <circle cx="100" cy="100" r="80" fill="none" stroke="#3a3a3a" strokeWidth="0.5" opacity="0.6" />

      {/* Outer edge highlight (very subtle) */}
      <circle cx="100" cy="100" r="95" fill="none" stroke="#2a2a2a" strokeWidth="1" />
    </svg>
  )
}
