/**
 * Branch Theming System
 *
 * Provides color palettes, typography, and visual identity for each military branch.
 * User-uploaded emblems only - no generated military insignia.
 */

export interface BranchTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
    cardBg: string;
    border: string;
    hover: string;
  };
  gradient: string;
  textShadow: string;
  buttonStyle: string;
  cardStyle: string;
}

export const branchThemes: Record<string, BranchTheme> = {
  'Army': {
    id: 'army',
    name: 'U.S. Army',
    colors: {
      primary: '#4B5320', // Olive drab
      secondary: '#1C1C1C', // Black
      accent: '#FFD700', // Gold
      text: '#FFFFFF',
      background: 'linear-gradient(135deg, #4B5320 0%, #2d3319 100%)',
      cardBg: 'rgba(75, 83, 32, 0.15)',
      border: '#FFD700',
      hover: '#5d6428'
    },
    gradient: 'linear-gradient(135deg, #4B5320 0%, #2d3319 50%, #1C1C1C 100%)',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    buttonStyle: 'bg-gradient-to-r from-[#4B5320] to-[#2d3319] border-2 border-[#FFD700]',
    cardStyle: 'bg-gradient-to-br from-[#4B5320]/20 to-[#1C1C1C]/20 border border-[#FFD700]/50'
  },

  'Navy': {
    id: 'navy',
    name: 'U.S. Navy',
    colors: {
      primary: '#000080', // Navy blue
      secondary: '#041E42', // Deep navy
      accent: '#FFD700', // Gold
      text: '#FFFFFF',
      background: 'linear-gradient(135deg, #000080 0%, #041E42 100%)',
      cardBg: 'rgba(0, 0, 128, 0.15)',
      border: '#FFD700',
      hover: '#0000a0'
    },
    gradient: 'linear-gradient(135deg, #000080 0%, #041E42 50%, #00008B 100%)',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    buttonStyle: 'bg-gradient-to-r from-[#000080] to-[#041E42] border-2 border-[#FFD700]',
    cardStyle: 'bg-gradient-to-br from-[#000080]/20 to-[#041E42]/20 border border-[#FFD700]/50'
  },

  'Air Force': {
    id: 'airforce',
    name: 'U.S. Air Force',
    colors: {
      primary: '#003F87', // Air Force blue
      secondary: '#5D8AA8', // Steel blue
      accent: '#C0C0C0', // Silver
      text: '#FFFFFF',
      background: 'linear-gradient(135deg, #003F87 0%, #5D8AA8 100%)',
      cardBg: 'rgba(0, 63, 135, 0.15)',
      border: '#C0C0C0',
      hover: '#004fa0'
    },
    gradient: 'linear-gradient(135deg, #003F87 0%, #5D8AA8 50%, #003F87 100%)',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    buttonStyle: 'bg-gradient-to-r from-[#003F87] to-[#5D8AA8] border-2 border-[#C0C0C0]',
    cardStyle: 'bg-gradient-to-br from-[#003F87]/20 to-[#5D8AA8]/20 border border-[#C0C0C0]/50'
  },

  'Marine Corps': {
    id: 'marines',
    name: 'U.S. Marine Corps',
    colors: {
      primary: '#C8102E', // Scarlet red
      secondary: '#8B0000', // Dark red
      accent: '#FFD700', // Gold
      text: '#FFFFFF',
      background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)',
      cardBg: 'rgba(200, 16, 46, 0.15)',
      border: '#FFD700',
      hover: '#d41535'
    },
    gradient: 'linear-gradient(135deg, #C8102E 0%, #8B0000 50%, #C8102E 100%)',
    textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
    buttonStyle: 'bg-gradient-to-r from-[#C8102E] to-[#8B0000] border-2 border-[#FFD700]',
    cardStyle: 'bg-gradient-to-br from-[#C8102E]/20 to-[#8B0000]/20 border border-[#FFD700]/50'
  },

  'Coast Guard': {
    id: 'coastguard',
    name: 'U.S. Coast Guard',
    colors: {
      primary: '#003F87', // Coast Guard blue
      secondary: '#FFFFFF', // White
      accent: '#FF6600', // Orange
      text: '#FFFFFF',
      background: 'linear-gradient(135deg, #003F87 0%, #002855 100%)',
      cardBg: 'rgba(0, 63, 135, 0.15)',
      border: '#FF6600',
      hover: '#004fa0'
    },
    gradient: 'linear-gradient(135deg, #003F87 0%, #FFFFFF 30%, #FF6600 60%, #003F87 100%)',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    buttonStyle: 'bg-gradient-to-r from-[#003F87] to-[#002855] border-2 border-[#FF6600]',
    cardStyle: 'bg-gradient-to-br from-[#003F87]/20 to-[#002855]/20 border border-[#FF6600]/50'
  },

  'Space Force': {
    id: 'spaceforce',
    name: 'U.S. Space Force',
    colors: {
      primary: '#000000', // Black
      secondary: '#1C1C1C', // Dark gray
      accent: '#C0C0C0', // Silver
      text: '#FFFFFF',
      background: 'linear-gradient(135deg, #000000 0%, #1C1C1C 100%)',
      cardBg: 'rgba(0, 0, 0, 0.3)',
      border: '#C0C0C0',
      hover: '#2a2a2a'
    },
    gradient: 'linear-gradient(135deg, #000000 0%, #1C1C1C 50%, #000000 100%)',
    textShadow: '2px 2px 4px rgba(192,192,192,0.5)',
    buttonStyle: 'bg-gradient-to-r from-[#000000] to-[#1C1C1C] border-2 border-[#C0C0C0]',
    cardStyle: 'bg-gradient-to-br from-[#000000]/30 to-[#1C1C1C]/30 border border-[#C0C0C0]/50'
  }
};

/**
 * Get theme for a specific branch
 */
export function getBranchTheme(branch: string): BranchTheme {
  return branchThemes[branch] || branchThemes['Army']; // Default to Army
}

/**
 * Emblem container styling (standardized across all branches)
 */
export const emblemContainerStyle = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  border: '3px solid currentColor',
  padding: '8px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255,255,255,0.1)'
};

/**
 * Apply theme to document root
 */
export function applyBranchTheme(branch: string): void {
  const theme = getBranchTheme(branch);
  const root = document.documentElement;

  root.style.setProperty('--theme-primary', theme.colors.primary);
  root.style.setProperty('--theme-secondary', theme.colors.secondary);
  root.style.setProperty('--theme-accent', theme.colors.accent);
  root.style.setProperty('--theme-text', theme.colors.text);
  root.style.setProperty('--theme-background', theme.colors.background);
  root.style.setProperty('--theme-card-bg', theme.colors.cardBg);
  root.style.setProperty('--theme-border', theme.colors.border);
  root.style.setProperty('--theme-hover', theme.colors.hover);
}

/**
 * Branch icons (emoji - no official emblems)
 */
export const branchIcons: Record<string, string> = {
  'Army': '🪖',
  'Navy': '⚓',
  'Air Force': '✈️',
  'Marine Corps': '🦅',
  'Coast Guard': '🛟',
  'Space Force': '🚀'
};

/**
 * Get branch icon
 */
export function getBranchIcon(branch: string): string {
  return branchIcons[branch] || '🎖️';
}
