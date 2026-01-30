import React from 'react'

interface ArtilleryBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
}

export const ArtilleryBadge: React.FC<ArtilleryBadgeProps> = ({ size = 'md', className = '' }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`${sizeMap[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="artilleryExplosion" cx="50%" cy="50%">
          <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#FFA500', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#FF6347', stopOpacity: 0.5 }} />
        </radialGradient>
      </defs>

      {/* Circular emblem background */}
      <circle cx="100" cy="100" r="90" fill="#2a2a2a" stroke="#1a1a1a" strokeWidth="2" />

      {/* Left Cannon */}
      <g transform="translate(70, 100) rotate(-30)">
        <rect x="-3" y="-20" width="6" height="30" fill="#1a1a1a" stroke="#0a0a0a" strokeWidth="1" />
        <circle cx="0" cy="15" r="5" fill="#2a2a2a" stroke="#0a0a0a" strokeWidth="1" />
        <rect x="-8" y="8" width="16" height="4" fill="#2a2a2a" stroke="#0a0a0a" strokeWidth="0.5" />
      </g>

      {/* Right Cannon */}
      <g transform="translate(130, 100) rotate(30)">
        <rect x="-3" y="-20" width="6" height="30" fill="#1a1a1a" stroke="#0a0a0a" strokeWidth="1" />
        <circle cx="0" cy="15" r="5" fill="#2a2a2a" stroke="#0a0a0a" strokeWidth="1" />
        <rect x="-8" y="8" width="16" height="4" fill="#2a2a2a" stroke="#0a0a0a" strokeWidth="0.5" />
      </g>

      {/* Central circle */}
      <circle cx="100" cy="100" r="30" fill="none" stroke="#FFD700" strokeWidth="2" />

      {/* Explosive energy radiating lines */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180
        const x1 = 100 + 30 * Math.cos(rad)
        const y1 = 100 + 30 * Math.sin(rad)
        const x2 = 100 + 55 * Math.cos(rad)
        const y2 = 100 + 55 * Math.sin(rad)
        return (
          <line
            key={angle}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="url(#artilleryExplosion)"
            strokeWidth="2"
            opacity="0.8"
          />
        )
      })}

      {/* Inner explosion effect */}
      <circle cx="100" cy="100" r="20" fill="url(#artilleryExplosion)" opacity="0.6" />

      {/* Outer circle border */}
      <circle cx="100" cy="100" r="90" fill="none" stroke="#FFD700" strokeWidth="1.5" />
    </svg>
  )
}
