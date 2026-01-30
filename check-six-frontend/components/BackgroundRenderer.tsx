import React from 'react'

interface BackgroundTheme {
  theme_type: string
  preset?: string
  branch?: string | null
  branch_name?: string
  colors: string[]
  opacity: number
  pattern: string
  custom_insignia_url?: string | null
  insignia_position?: string
}

interface BackgroundProps {
  theme: BackgroundTheme | null
}

export const BackgroundRenderer: React.FC<BackgroundProps> = ({ theme }) => {
  if (!theme) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 -z-10" />
    )
  }

  const primaryColor = theme.colors[0]
  const secondaryColor = theme.colors[1]
  const accentColor = theme.colors[2] || '#FFD700'

  // Default military theme
  if (theme.theme_type === 'default') {
    return (
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 50%, ${primaryColor} 100%)`,
          opacity: theme.opacity
        }}
      >
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>
    )
  }

  // Branch-specific theme
  if (theme.theme_type === 'branch') {
    return (
      <div className="fixed inset-0 -z-10">
        <div
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 50%, ${primaryColor} 100%)`,
            opacity: theme.opacity,
            position: 'absolute',
            inset: 0
          }}
        />

        {/* Branch stripes */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '100%',
                height: '20%',
                top: `${i * 20}%`,
                backgroundColor: i % 2 === 0 ? primaryColor : secondaryColor,
                opacity: 0.1
              }}
            />
          ))}
        </div>

        {/* Branch emblem placeholder */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10">
          <div
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              border: `3px solid ${accentColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              color: accentColor
            }}
          >
            ⭐
          </div>
        </div>
      </div>
    )
  }

  // Camouflage pattern theme
  if (theme.pattern === 'camo') {
    return (
      <div className="fixed inset-0 -z-10">
        <svg
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
          style={{ opacity: theme.opacity }}
        >
          <defs>
            <filter id="camo">
              <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="6" />
              <feDisplacementMap in="SourceGraphic" scale="100" />
            </filter>
          </defs>
          <rect width="100%" height="100%" fill={primaryColor} />
          <rect
            width="100%"
            height="100%"
            fill={secondaryColor}
            opacity="0.6"
            filter="url(#camo)"
          />
          <rect
            width="100%"
            height="100%"
            fill={accentColor}
            opacity="0.3"
            filter="url(#camo)"
          />
        </svg>
      </div>
    )
  }

  // Grid pattern theme
  if (theme.pattern === 'grid') {
    return (
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: primaryColor,
          backgroundImage: `
            linear-gradient(${secondaryColor} 1px, transparent 1px),
            linear-gradient(90deg, ${secondaryColor} 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          opacity: theme.opacity
        }}
      />
    )
  }

  // Stripe pattern (patriotic)
  if (theme.pattern === 'stripes') {
    return (
      <div className="fixed inset-0 -z-10">
        {theme.colors.map((color, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              width: '100%',
              height: `${100 / theme.colors.length}%`,
              top: `${index * (100 / theme.colors.length)}%`,
              backgroundColor: color,
              opacity: theme.opacity
            }}
          />
        ))}
      </div>
    )
  }

  // Custom with insignia
  if (theme.custom_insignia_url) {
    const positionMap: { [key: string]: string } = {
      'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
      'top-left': 'top-8 left-8',
      'top-right': 'top-8 right-8',
      'bottom-left': 'bottom-8 left-8',
      'bottom-right': 'bottom-8 right-8'
    }

    return (
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 50%, ${primaryColor} 100%)`,
          opacity: theme.opacity
        }}
      >
        {/* Custom insignia */}
        <div className={`absolute ${positionMap[theme.insignia_position || 'center']} opacity-20 pointer-events-none`}>
          <img
            src={theme.custom_insignia_url}
            alt="Unit insignia"
            className="w-48 h-48 object-contain filter drop-shadow-lg"
          />
        </div>
      </div>
    )
  }

  // Fallback default
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 -z-10" />
  )
}

export default BackgroundRenderer
