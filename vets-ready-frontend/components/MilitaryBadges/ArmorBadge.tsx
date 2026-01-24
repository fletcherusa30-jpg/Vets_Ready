import React from 'react'

interface ArmorBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
}

export const ArmorBadge: React.FC<ArmorBadgeProps> = ({ size = 'md', className = '' }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`${sizeMap[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="armorTan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#d4a574', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#b8926a', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#8b6f47', stopOpacity: 1 }} />
        </linearGradient>
        <filter id="armorWear">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" />
          <feDisplacementMap in="SourceGraphic" scale="3" />
        </filter>
      </defs>

      {/* Shield with riveted edges */}
      <path
        d="M 100 25 L 155 55 L 155 115 Q 100 160 100 160 Q 100 160 45 115 L 45 55 Z"
        fill="url(#armorTan)"
        stroke="#4a3a2a"
        strokeWidth="3"
        filter="url(#armorWear)"
      />

      {/* Tank Silhouette */}
      <g transform="translate(100, 85)">
        {/* Hull */}
        <rect x="-30" y="-8" width="60" height="20" rx="3" fill="#3a2a1a" stroke="#2a1a0a" strokeWidth="1" />

        {/* Turret */}
        <circle cx="0" cy="-15" r="15" fill="#3a2a1a" stroke="#2a1a0a" strokeWidth="1" />

        {/* Gun Barrel */}
        <rect x="-4" y="-30" width="8" height="20" fill="#2a1a0a" stroke="#1a0a0a" strokeWidth="1" />

        {/* Tracks */}
        <ellipse cx="-25" cy="12" rx="8" ry="10" fill="#2a1a0a" />
        <ellipse cx="25" cy="12" rx="8" ry="10" fill="#2a1a0a" />
      </g>

      {/* Rivets around border */}
      <circle cx="60" cy="50" r="2" fill="#555" />
      <circle cx="140" cy="50" r="2" fill="#555" />
      <circle cx="50" cy="90" r="2" fill="#555" />
      <circle cx="150" cy="90" r="2" fill="#555" />
      <circle cx="70" cy="135" r="2" fill="#555" />
      <circle cx="130" cy="135" r="2" fill="#555" />
    </svg>
  )
}
