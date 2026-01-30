import React, { useState } from 'react'
import {
  HALOWingBadge,
  AirborneBadge,
  InfantryBadge,
  ArmorBadge,
  ArtilleryBadge,
  AviationWingsBadge,
  SpecialOpsBadge,
  TacticalShieldBadge,
  CamoBadge,
  WWIIBadge,
} from './index'

interface BadgeInfo {
  name: string
  description: string
  component: React.ComponentType<{ size: 'sm' | 'md' | 'lg'; className?: string }>
  unlockCondition: string
}

const BADGES: BadgeInfo[] = [
  {
    name: 'HALO-Inspired Wing Badge',
    description:
      'Wide, angular wing spread with stylized parachute canopy and spearhead symbol. Features brushed gunmetal texture with lightning-bolt accents.',
    component: HALOWingBadge,
    unlockCondition: 'Airborne Service',
  },
  {
    name: 'Airborne-Inspired Badge',
    description:
      'Shield-shaped emblem with upward-swept wings flanking a central star. Rugged metallic texture evoking strength and resilience.',
    component: AirborneBadge,
    unlockCondition: 'Airborne Ranked',
  },
  {
    name: 'Infantry-Inspired Badge',
    description:
      'Bold crossed-rifle motif over a tactical shield in matte black and steel tones. Emphasizes ground combat readiness.',
    component: InfantryBadge,
    unlockCondition: 'Infantry Service',
  },
  {
    name: 'Armor-Inspired Badge',
    description:
      'Tank silhouette dominates a heavy shield with riveted edges. Desert-worn texture symbolizing durability and armored strength.',
    component: ArmorBadge,
    unlockCondition: 'Armor Service',
  },
  {
    name: 'Artillery-Inspired Badge',
    description:
      'Two stylized cannons crossing over a circular emblem with radiating explosive energy lines. Reflects power and precision.',
    component: ArtilleryBadge,
    unlockCondition: 'Artillery Service',
  },
  {
    name: 'Aviation-Inspired Wings',
    description:
      'Sleek, aerodynamic wings extending from central jet silhouette against radar-grid background. Conveys speed and technological superiority.',
    component: AviationWingsBadge,
    unlockCondition: 'Aviation Service',
  },
  {
    name: 'Special-Operations-Inspired Emblem',
    description:
      'Minimalist dagger overlaying subdued wings in dark matte finish. Exudes stealth, precision, and elite capability.',
    component: SpecialOpsBadge,
    unlockCondition: 'Special Operations',
  },
  {
    name: 'Tactical Shield Emblem',
    description:
      'Modern shield with geometric lines and star accents. Reinforced plating textures give futuristic yet grounded military aesthetic.',
    component: TacticalShieldBadge,
    unlockCondition: 'Tactical Training',
  },
  {
    name: 'Camo-Themed Badge',
    description:
      'Circular emblem featuring original camouflage pattern with rugged, distressed border. Emphasizes adaptability and field readiness.',
    component: CamoBadge,
    unlockCondition: 'Field Operations',
  },
  {
    name: 'WWII-Style Vintage Badge',
    description:
      'Retro-style emblem with muted olive drab and khaki tones, distressed textures, and classic military geometry. Evokes heritage and valor.',
    component: WWIIBadge,
    unlockCondition: 'Heritage Service',
  },
]

interface BadgeLibraryProps {
  userBadges?: string[] // array of unlocked badge names
  size?: 'sm' | 'md' | 'lg'
  displayMode?: 'grid' | 'row' | 'showcase'
}

export const BadgeLibrary: React.FC<BadgeLibraryProps> = ({
  userBadges = [],
  size = 'md',
  displayMode = 'grid',
}) => {
  const [selectedBadge, setSelectedBadge] = useState<BadgeInfo | null>(null)

  const isBadgeUnlocked = (badgeName: string) => userBadges.includes(badgeName)

  if (displayMode === 'showcase') {
    return (
      <div className="w-full">
        <div className="bg-gradient-to-r from-blue-900 to-gray-900 rounded-lg shadow-lg overflow-hidden">
          {/* Featured Badge Showcase */}
          <div className="p-12 text-center bg-slate-800">
            <h2 className="text-3xl font-bold text-white mb-4">Military Insignia Badges</h2>
            <p className="text-gray-300 mb-8">
              Unlock achievement badges representing your military service and accomplishments
            </p>

            {selectedBadge && (
              <div className="mb-8">
                <selectedBadge.component size="lg" />
              </div>
            )}

            {selectedBadge && (
              <div className="text-left max-w-2xl mx-auto bg-slate-700 p-6 rounded">
                <h3 className="text-2xl font-bold text-white mb-2">{selectedBadge.name}</h3>
                <p className="text-gray-200 mb-4">{selectedBadge.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 font-semibold">Unlock Condition:</span>
                  <span className="text-gray-300">{selectedBadge.unlockCondition}</span>
                </div>
                {isBadgeUnlocked(selectedBadge.name) && (
                  <div className="mt-4 bg-green-600 text-white px-4 py-2 rounded inline-block">
                    ✓ Badge Unlocked
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Badge Grid */}
          <div className="p-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {BADGES.map((badge) => {
              const isUnlocked = isBadgeUnlocked(badge.name)
              return (
                <div
                  key={badge.name}
                  onClick={() => setSelectedBadge(badge)}
                  className={`cursor-pointer transition-transform hover:scale-110 relative ${
                    selectedBadge?.name === badge.name ? 'ring-4 ring-yellow-400' : ''
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      isUnlocked ? 'bg-slate-600' : 'bg-slate-800 opacity-50'
                    }`}
                  >
                    <badge.component size={size} />
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-lg">
                        <span className="text-white text-2xl">🔒</span>
                      </div>
                    )}
                  </div>
                  <p
                    className={`text-xs text-center mt-2 font-semibold ${
                      isUnlocked ? 'text-white' : 'text-gray-500'
                    }`}
                  >
                    {badge.name.split('-')[0]}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (displayMode === 'row') {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {BADGES.map((badge) => {
          const isUnlocked = isBadgeUnlocked(badge.name)
          return (
            <div
              key={badge.name}
              className="flex-shrink-0 relative group"
              title={badge.name}
            >
              <div
                className={`p-2 rounded-lg ${isUnlocked ? 'bg-slate-600' : 'bg-slate-800 opacity-50'}`}
              >
                <badge.component size={size} />
                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-lg">
                    <span className="text-white text-lg">🔒</span>
                  </div>
                )}
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
                {badge.name}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Grid mode (default)
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
      {BADGES.map((badge) => {
        const isUnlocked = isBadgeUnlocked(badge.name)
        return (
          <div
            key={badge.name}
            onClick={() => setSelectedBadge(badge)}
            className="cursor-pointer transition-transform hover:scale-110 relative group"
          >
            <div
              className={`p-4 rounded-lg text-center ${
                isUnlocked ? 'bg-gradient-to-b from-blue-600 to-blue-800' : 'bg-gray-700 opacity-60'
              }`}
            >
              <badge.component size={size} />
              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-lg">
                  <span className="text-white text-2xl">🔒</span>
                </div>
              )}
            </div>
            <p className={`text-xs text-center mt-2 font-semibold ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
              {badge.name.split('-')[0]}
            </p>

            {/* Hover tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none max-w-xs whitespace-normal">
              {badge.description}
            </div>
          </div>
        )
      })}

      {selectedBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full text-center">
            <selectedBadge.component size="lg" className="mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-3">{selectedBadge.name}</h3>
            <p className="text-gray-300 mb-4">{selectedBadge.description}</p>
            <div className="mb-6">
              <span className="text-yellow-400 font-semibold">Unlock: </span>
              <span className="text-gray-300">{selectedBadge.unlockCondition}</span>
            </div>
            {isBadgeUnlocked(selectedBadge.name) && (
              <div className="bg-green-600 text-white px-4 py-2 rounded mb-4 inline-block">
                ✓ Badge Unlocked
              </div>
            )}
            <button
              onClick={() => setSelectedBadge(null)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default BadgeLibrary
