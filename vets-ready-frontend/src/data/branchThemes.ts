// Branch Background Themes
// Modern, realistic military branch themed backgrounds

export interface BranchTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
  gradient: string;
  pattern?: string;
  icon: string;
  emblemPath: string; // Path to JPG emblem file
}

export const BRANCH_THEMES: Record<string, BranchTheme> = {
  army: {
    id: 'army',
    name: 'U.S. Army',
    colors: {
      primary: '#4B5320', // Army Green
      secondary: '#000000', // Black
      accent: '#FFD700', // Gold
      text: '#FFFFFF'
    },
    gradient: 'linear-gradient(135deg, #1a1a1a 0%, #2d4a1e 20%, #4B5320 40%, #2d4a1e 60%, #1a1a1a 100%)',
    pattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9InN0YXJzIiB4PSIwIiB5PSIwIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjEwIiBjeT0iMTAiIHI9IjEiIGZpbGw9IiNGRkQ3MDAiIG9wYWNpdHk9IjAuMyIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSJ1cmwoI3N0YXJzKSIvPjwvc3ZnPg==',
    icon: '🪖',
    emblemPath: '/assets/branch-logos/Army.jpg'
  },
  navy: {
    id: 'navy',
    name: 'U.S. Navy',
    colors: {
      primary: '#000080', // Navy Blue
      secondary: '#FFD700', // Gold
      accent: '#FFFFFF', // White
      text: '#FFFFFF'
    },
    gradient: 'linear-gradient(135deg, #000428 0%, #004e92 25%, #000080 50%, #004e92 75%, #000428 100%)',
    pattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9IndhdmVzIiB4PSIwIiB5PSIwIiB3aWR0aD0iODAiIGhlaWdodD0iODAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0wIDQwIFEgMjAgMzAgNDAgNDAgVCA4MCA0MCIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIG9wYWNpdHk9IjAuMiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSJ1cmwoI3dhdmVzKSIvPjwvc3ZnPg==',
    icon: '⚓',
    emblemPath: '/assets/branch-logos/Navy.jpg'
  },
  airforce: {
    id: 'airforce',
    name: 'U.S. Air Force',
    colors: {
      primary: '#00308F', // Air Force Blue
      secondary: '#FFD700', // Gold
      accent: '#B0C4DE', // Light Steel Blue
      text: '#FFFFFF'
    },
    gradient: 'linear-gradient(135deg, #001f3f 0%, #00308F 25%, #0047AB 50%, #00308F 75%, #001f3f 100%)',
    pattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iY2xvdWRzIiB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGVsbGlwc2UgY3g9IjUwIiBjeT0iMzAiIHJ4PSIyNSIgcnk9IjE1IiBmaWxsPSIjRkZENzAwIiBvcGFjaXR5PSIwLjE1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNjbG91ZHMpIi8+PC9zdmc+',
    icon: '✈️',
    emblemPath: '/assets/branch-logos/Air Force.jpg'
  },
  marines: {
    id: 'marines',
    name: 'U.S. Marine Corps',
    colors: {
      primary: '#CC0000', // Scarlet Red
      secondary: '#FFD700', // Gold
      accent: '#FFFFFF', // White
      text: '#FFFFFF'
    },
    gradient: 'linear-gradient(135deg, #8B0000 0%, #CC0000 25%, #B22222 50%, #CC0000 75%, #8B0000 100%)',
    pattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImVhZ2xlIiB4PSIwIiB5PSIwIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjIiIGZpbGw9IiNGRkQ3MDAiIG9wYWNpdHk9IjAuNCIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSJ1cmwoI2VhZ2xlKSIvPjwvc3ZnPg==',
    icon: '🦅',
    emblemPath: '/assets/branch-logos/Marine.jpg'
  },
  coastguard: {
    id: 'coastguard',
    name: 'U.S. Coast Guard',
    colors: {
      primary: '#034F8B', // Coast Guard Blue
      secondary: '#FF6B00', // Racing Orange
      accent: '#FFFFFF', // White
      text: '#FFFFFF'
    },
    gradient: 'linear-gradient(135deg, #023859 0%, #034F8B 25%, #0066A1 50%, #034F8B 75%, #023859 100%)',
    pattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImxpZmVyaW5nIiB4PSIwIiB5PSIwIiB3aWR0aD0iODAiIGhlaWdodD0iODAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjQwIiBjeT0iNDAiIHI9IjE1IiBzdHJva2U9IiNGRjZCMDAiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC4yIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIGZpbGw9InVybCgjbGlmZXJpbmcpIi8+PC9zdmc+',
    icon: '🛟',
    emblemPath: '/assets/branch-logos/Coast Guard.jpg'
  },
  spaceforce: {
    id: 'spaceforce',
    name: 'U.S. Space Force',
    colors: {
      primary: '#000000', // Black
      secondary: '#1E90FF', // Dodger Blue
      accent: '#FFFFFF', // White
      text: '#FFFFFF'
    },
    gradient: 'linear-gradient(135deg, #000000 0%, #0a1929 25%, #1E3A8A 50%, #0a1929 75%, #000000 100%)',
    pattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ic3RhcnMiIHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjgiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjcwIiByPSIxLjUiIGZpbGw9IiNGRkZGRkYiIG9wYWNpdHk9IjAuNiIvPjxjaXJjbGUgY3g9IjgwIiBjeT0iNDAiIHI9IjAuOCIgZmlsbD0iI0ZGRkZGRiIgb3BhY2l0eT0iMC43Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNzdGFycykiLz48L3N2Zz4=',
    icon: '🚀',
    emblemPath: '/assets/branch-logos/Space Force.jpg'
  }
};

export const DEFAULT_THEME = 'army';

// Settings context and hook will be added to save user preference
export function getTheme(branchOrThemeId?: string): BranchTheme {
  if (!branchOrThemeId) return BRANCH_THEMES[DEFAULT_THEME];

  // Normalize branch names
  const normalized = branchOrThemeId.toLowerCase().replace(/\s+/g, '');

  // Map common variations
  const branchMap: Record<string, string> = {
    'army': 'army',
    'usarmy': 'army',
    'navy': 'navy',
    'usnavy': 'navy',
    'airforce': 'airforce',
    'usaf': 'airforce',
    'usairforce': 'airforce',
    'marines': 'marines',
    'marinecorps': 'marines',
    'usmc': 'marines',
    'usmarinecorps': 'marines',
    'coastguard': 'coastguard',
    'uscg': 'coastguard',
    'uscoastguard': 'coastguard',
    'spaceforce': 'spaceforce',
    'ussf': 'spaceforce',
    'usspaceforce': 'spaceforce'
  };

  const themeId = branchMap[normalized] || normalized;
  return BRANCH_THEMES[themeId] || BRANCH_THEMES[DEFAULT_THEME];
}
