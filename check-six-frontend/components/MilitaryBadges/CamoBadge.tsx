import React from 'react'

interface CamoBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
}

export const CamoBadge: React.FC<CamoBadgeProps> = ({ size = 'md', className = '' }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`${sizeMap[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="camoPattern" patternUnits="userSpaceOnUse" width="40" height="40">
          <rect width="40" height="40" fill="#3a4f2a" />
          <path d="M 0 0 Q 10 5 15 0 T 40 0" fill="#5a7f4a" />
          <path d="M 5 10 Q 15 15 25 10" fill="#4a6f3a" />
          <ellipse cx="8" cy="20" rx="8" ry="12" fill="#2a3f1a" opacity="0.6" />
          <ellipse cx="30" cy="25" rx="10" ry="8" fill="#4a6f3a" opacity="0.7" />
          <path d="M 20 35 L 30 40 L 25 40 Z" fill="#2a3f1a" />
        </pattern>
        <filter id="camoTexture">
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" />
          <feDisplacementMap in="SourceGraphic" scale="2" />
        </filter>
      </defs>

      {/* Main circular emblem */}
      <circle cx="100" cy="100" r="90" fill="url(#camoPattern)" filter="url(#camoTexture)" />

      {/* Distressed border */}
      <circle cx="100" cy="100" r="90" fill="none" stroke="#2a3f1a" strokeWidth="3" />

      {/* Rough edge effect with dashes */}
      <circle
        cx="100"
        cy="100"
        r="90"
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="1"
        strokeDasharray="5,3"
        opacity="0.5"
      />

      {/* Inner circle detail */}
      <circle cx="100" cy="100" r="75" fill="none" stroke="#2a3f1a" strokeWidth="2" opacity="0.4" />

      {/* Center emblem - compass rose */}
      <g transform="translate(100, 100)">
        {/* Cardinal points */}
        {[0, 90, 180, 270].map((angle) => {
          const rad = (angle * Math.PI) / 180
          const x = 20 * Math.cos(rad)
          const y = 20 * Math.sin(rad)
          return (
            <line
              key={`cardinal-${angle}`}
              x1="0"
              y1="0"
              x2={x}
              y2={y}
              stroke="#3a4f2a"
              strokeWidth="2"
              opacity="0.7"
            />
          )
        })}

        {/* Intercardinal points */}
        {[45, 135, 225, 315].map((angle) => {
          const rad = (angle * Math.PI) / 180
          const x = 15 * Math.cos(rad)
          const y = 15 * Math.sin(rad)
          return (
            <line
              key={`intercardinal-${angle}`}
              x1="0"
              y1="0"
              x2={x}
              y2={y}
              stroke="#2a3f1a"
              strokeWidth="1.5"
              opacity="0.5"
            />
          )
        })}

        {/* Center circle */}
        <circle cx="0" cy="0" r="8" fill="#4a6f3a" stroke="#2a3f1a" strokeWidth="1" />
      </g>

      {/* Distressed corner marks */}
      <line x1="25" y1="25" x2="35" y2="35" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.4" />
      <line x1="175" y1="25" x2="165" y2="35" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.4" />
      <line x1="25" y1="175" x2="35" y2="165" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.4" />
      <line x1="175" y1="175" x2="165" y2="165" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.4" />
    </svg>
  )
}
