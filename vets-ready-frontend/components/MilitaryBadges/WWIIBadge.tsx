import React from 'react'

interface WWIIBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
}

export const WWIIBadge: React.FC<WWIIBadgeProps> = ({ size = 'md', className = '' }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`${sizeMap[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="wwiiOliveDrab" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#6b8e23', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#556b2f', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#3d5a1a', stopOpacity: 1 }} />
        </linearGradient>
        <pattern id="distressPattern" patternUnits="userSpaceOnUse" width="8" height="8">
          <rect width="8" height="8" fill="#6b8e23" />
          <circle cx="2" cy="2" r="0.5" fill="#000" opacity="0.1" />
          <circle cx="6" cy="6" r="0.5" fill="#fff" opacity="0.05" />
        </pattern>
        <filter id="distressed">
          <feTurbulence type="fractalNoise" baseFrequency="2" numOctaves="3" />
          <feDisplacementMap in="SourceGraphic" scale="1.5" />
        </filter>
      </defs>

      {/* Main circular shield */}
      <circle
        cx="100"
        cy="100"
        r="90"
        fill="url(#wwiiOliveDrab)"
        stroke="#2a2a1a"
        strokeWidth="3"
        filter="url(#distressed)"
      />

      {/* Distressed texture overlay */}
      <circle cx="100" cy="100" r="90" fill="url(#distressPattern)" opacity="0.3" />

      {/* Classic WWII star (similar to insignia) */}
      <path
        d="M 100 40 L 110 65 L 135 65 L 115 78 L 125 103 L 100 90 L 75 103 L 85 78 L 65 65 L 90 65 Z"
        fill="#C4A000"
        stroke="#2a2a1a"
        strokeWidth="2"
      />

      {/* Banner ribbon effect */}
      <path
        d="M 50 130 Q 70 135 100 135 Q 130 135 150 130"
        fill="none"
        stroke="#2a2a1a"
        strokeWidth="2"
      />
      <path d="M 52 132 Q 72 136 100 136 Q 128 136 148 132" fill="#D2B48C" stroke="#2a2a1a" strokeWidth="1" />

      {/* Vintage text area (decorative lines suggesting text) */}
      <line x1="65" y1="140" x2="135" y2="140" stroke="#2a2a1a" strokeWidth="1" opacity="0.5" />
      <line x1="70" y1="148" x2="130" y2="148" stroke="#2a2a1a" strokeWidth="0.8" opacity="0.4" />

      {/* Corner decorative elements */}
      <circle cx="60" cy="60" r="3" fill="#C4A000" opacity="0.6" />
      <circle cx="140" cy="60" r="3" fill="#C4A000" opacity="0.6" />
      <circle cx="70" cy="145" r="2.5" fill="#D2B48C" opacity="0.5" />
      <circle cx="130" cy="145" r="2.5" fill="#D2B48C" opacity="0.5" />

      {/* Outer worn edge ring */}
      <circle cx="100" cy="100" r="90" fill="none" stroke="#2a2a1a" strokeWidth="1" opacity="0.4" />
      <circle cx="100" cy="100" r="85" fill="none" stroke="#C4A000" strokeWidth="0.5" opacity="0.3" />
    </svg>
  )
}
