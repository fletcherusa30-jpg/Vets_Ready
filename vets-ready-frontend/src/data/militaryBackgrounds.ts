// Realistic Military Background System
// Stylized, non-photographic backgrounds that enhance immersion and branch identity
// Compliant with requirements: No real personnel, equipment, or restricted imagery

export interface MilitaryBackground {
  id: string;
  name: string;
  branch: string;
  category: string;
  gradient: string;
  overlayPattern?: string;
  cssClass: string;
  description: string;
  isDefault?: boolean;
}

export const MILITARY_BACKGROUNDS: MilitaryBackground[] = [
  // DEFAULT - American Flag Theme
  {
    id: 'default-patriotic',
    name: 'American Patriotic',
    branch: 'All',
    category: 'Default',
    gradient: 'linear-gradient(135deg, #B22234 0%, #B22234 15%, #FFFFFF 15%, #FFFFFF 20%, #3C3B6E 20%, #3C3B6E 35%, #FFFFFF 35%, #FFFFFF 40%, #B22234 40%, #B22234 55%, #FFFFFF 55%, #FFFFFF 60%, #3C3B6E 60%, #3C3B6E 75%, #FFFFFF 75%, #FFFFFF 80%, #B22234 80%, #B22234 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9InN0YXJzIiB4PSIwIiB5PSIwIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwb2x5Z29uIHBvaW50cz0iMzAsMTAgMzUsMjUgNTAsMjUgMzcuNSwzNSA0Miw1MCAzMCw0MiAxOCw1MCAyMi41LDM1IDEwLDI1IDI1LDI1IiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0idXJsKCNzdGFycykiLz48L3N2Zz4=',
    cssClass: 'bg-patriotic',
    description: 'Classic American flag colors',
    isDefault: true
  },

  // ARMY BACKGROUNDS
  {
    id: 'army-desert-patrol',
    name: 'Desert Patrol',
    branch: 'Army',
    category: 'Combat Environment',
    gradient: 'linear-gradient(180deg, #8B7355 0%, #C4A77D 15%, #D2B48C 30%, #8B7355 50%, #5C4033 70%, #3E2723 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ic2FuZCIgeD0iMCIgeT0iMCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjIiIGZpbGw9IiM4QjczNTUiIG9wYWNpdHk9IjAuMiIvPjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEwMCIgcj0iMS41IiBmaWxsPSIjQzRBNzdEIiBvcGFjaXR5PSIwLjE1Ii8+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTUwIiByPSIxIiBmaWxsPSIjRDJCNDhDIiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ1cmwoI3NhbmQpIi8+PC9zdmc+',
    cssClass: 'bg-army-desert',
    description: 'Stylized desert landscape with sand dunes silhouettes'
  },
  {
    id: 'army-forest-ops',
    name: 'Forest Operations',
    branch: 'Army',
    category: 'Combat Environment',
    gradient: 'linear-gradient(180deg, #1a3a1a 0%, #2d5a2d 20%, #1e4d1e 40%, #0f2f0f 60%, #1a1a1a 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0idHJlZXMiIHg9IjAiIHk9IjAiIHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cG9seWdvbiBwb2ludHM9IjMwLDEyMCAzNSwxMDAgMjUsMTAwIiBmaWxsPSIjMmQ1YTJkIiBvcGFjaXR5PSIwLjMiLz48cG9seWdvbiBwb2ludHM9IjEwMCw5MCAxMDUsNzAgOTUsNzAiIGZpbGw9IiMyZDVhMmQiIG9wYWNpdHk9IjAuMiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjE1MCIgaGVpZ2h0PSIxNTAiIGZpbGw9InVybCgjdHJlZXMpIi8+PC9zdmc+',
    cssClass: 'bg-army-forest',
    description: 'Dark forest with tree silhouettes'
  },
  {
    id: 'army-urban-overwatch',
    name: 'Urban Overwatch',
    branch: 'Army',
    category: 'Tactical',
    gradient: 'linear-gradient(180deg, #2C3E50 0%, #34495E 20%, #1C2833 40%, #17202A 70%, #0B0C0D 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iY2l0eSIgeD0iMCIgeT0iMCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxyZWN0IHg9IjQwIiB5PSIxMjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSI4MCIgZmlsbD0iIzM0NDk1RSIgb3BhY2l0eT0iMC40Ii8+PHJlY3QgeD0iMTIwIiB5PSIxMDAiIHdpZHRoPSIzMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMzNDQ5NUUiIG9wYWNpdHk9IjAuMyIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjY2l0eSkiLz48L3N2Zz4=',
    cssClass: 'bg-army-urban',
    description: 'City skyline silhouettes at dusk'
  },
  {
    id: 'army-night-ops',
    name: 'Night Operations',
    branch: 'Army',
    category: 'Tactical',
    gradient: 'linear-gradient(180deg, #0a0e27 0%, #141852 20%, #0a0e27 40%, #050714 70%, #000000 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ic3RhcnMiIHg9IjAiIHk9IjAiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjMwIiByPSIxIiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjgiLz48Y2lyY2xlIGN4PSIxNTAiIGN5PSI4MCIgcj0iMS41IiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjYiLz48Y2lyY2xlIGN4PSI5MCIgY3k9IjE1MCIgcj0iMC44IiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjciLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ1cmwoI3N0YXJzKSIvPjwvc3ZnPg==',
    cssClass: 'bg-army-night',
    description: 'Night sky with stars, NVG green tint overlay'
  },

  // NAVY BACKGROUNDS
  {
    id: 'navy-carrier-deck',
    name: 'Carrier Deck',
    branch: 'Navy',
    category: 'Maritime',
    gradient: 'linear-gradient(180deg, #001f3f 0%, #003d7a 20%, #002855 40%, #001a3d 70%, #000814 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZGVjayIgeD0iMCIgeT0iMCIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxsaW5lIHgxPSIwIiB5MT0iMTUwIiB4Mj0iMzAwIiB5Mj0iMTUwIiBzdHJva2U9IiNGRkQ3MDAiIHN0cm9rZS13aWR0aD0iMiIgb3BhY2l0eT0iMC4yIi8+PHJlY3QgeD0iMjAwIiB5PSIyMDAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzAwM2Q3YSIgb3BhY2l0eT0iMC4zIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0idXJsKCNkZWNrKSIvPjwvc3ZnPg==',
    cssClass: 'bg-navy-carrier',
    description: 'Aircraft carrier deck with aircraft silhouettes'
  },
  {
    id: 'navy-destroyer-sea',
    name: 'Destroyer at Sea',
    branch: 'Navy',
    category: 'Maritime',
    gradient: 'linear-gradient(180deg, #4A5568 0%, #2C5F7F 25%, #1a4d6f 50%, #0f3854 75%, #001a2e 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0id2F2ZXMiIHg9IjAiIHk9IjAiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNMCAxMDAgUSA1MCA5MCAxMDAgMTAwIFQgMjAwIDEwMCIgc3Ryb2tlPSIjMkM1RjdGIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiIG9wYWNpdHk9IjAuMyIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjd2F2ZXMpIi8+PC9zdmc+',
    cssClass: 'bg-navy-destroyer',
    description: 'Ocean waves with ship silhouette on horizon'
  },
  {
    id: 'navy-submarine',
    name: 'Submarine Shadow',
    branch: 'Navy',
    category: 'Undersea',
    gradient: 'linear-gradient(180deg, #0a4d68 0%, #053b50 30%, #05161a 60%, #000000 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0idW5kZXJ3YXRlciIgeD0iMCIgeT0iMCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjMiIGZpbGw9IiMwYTRkNjgiIG9wYWNpdHk9IjAuMiIvPjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEyMCIgcj0iMiIgZmlsbD0iIzBhNGQ2OCIgb3BhY2l0eT0iMC4xNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjdW5kZXJ3YXRlcikiLz48L3N2Zz4=',
    cssClass: 'bg-navy-sub',
    description: 'Deep water gradient with bubble effects'
  },

  // MARINE CORPS BACKGROUNDS
  {
    id: 'marines-amphibious',
    name: 'Amphibious Landing',
    branch: 'Marine Corps',
    category: 'Combat',
    gradient: 'linear-gradient(180deg, #8B0000 0%, #A52A2A 10%, #2C5F7F 30%, #B8860B 60%, #8B7355 90%, #654321 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYW1waGliIiB4PSIwIiB5PSIwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMTAwIFEgNTAgOTAgMTAwIDEwMCBUICAyMDAgMTAwIiBzdHJva2U9IiNGRkQ3MDAiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC4yIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNhbXBoaWIpIi8+PC9zdmc+',
    cssClass: 'bg-marines-amphibious',
    description: 'Beach landing scene - sea to sand gradient'
  },
  {
    id: 'marines-jungle',
    name: 'Jungle Operations',
    branch: 'Marine Corps',
    category: 'Environment',
    gradient: 'linear-gradient(180deg, #1a3d1a 0%, #2d5a2d 20%, #0f2f0f 50%, #1a1a1a 80%, #000000 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ianVuZ2xlIiB4PSIwIiB5PSIwIiB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGVsbGlwc2UgY3g9IjQwIiBjeT0iNDAiIHJ4PSIyMCIgcnk9IjMwIiBmaWxsPSIjMmQ1YTJkIiBvcGFjaXR5PSIwLjMiLz48ZWxsaXBzZSBjeD0iMTEwIiBjeT0iOTAiIHJ4PSIxNSIgcnk9IjI1IiBmaWxsPSIjMmQ1YTJkIiBvcGFjaXR5PSIwLjI1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0idXJsKCNqdW5nbGUpIi8+PC9zdmc+',
    cssClass: 'bg-marines-jungle',
    description: 'Dense jungle foliage silhouettes'
  },
  {
    id: 'marines-fireteam',
    name: 'Fireteam Silhouette',
    branch: 'Marine Corps',
    category: 'Tactical',
    gradient: 'linear-gradient(180deg, #CC0000 0%, #8B0000 15%, #2C3E50 30%, #1C2833 60%, #0B0C0D 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZmlyZXRlYW0iIHg9IjAiIHk9IjAiIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjI1MCIgcj0iMiIgZmlsbD0iI0ZGRDcwMCIgb3BhY2l0eT0iMC40Ii8+PGNpcmNsZSBjeD0iMTUwIiBjeT0iMjQwIiByPSIyLjUiIGZpbGw9IiNGRkQ3MDAiIG9wYWNpdHk9IjAuMzUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI2ZpcmV0ZWFtKSIvPjwvc3ZnPg==',
    cssClass: 'bg-marines-fireteam',
    description: 'Stylized Marine silhouettes on patrol'
  },

  // AIR FORCE BACKGROUNDS
  {
    id: 'airforce-flyover',
    name: 'Fighter Flyover',
    branch: 'Air Force',
    category: 'Aviation',
    gradient: 'linear-gradient(180deg, #87CEEB 0%, #4682B4 20%, #00308F 40%, #001f3f 70%, #000814 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iamV0cyIgeD0iMCIgeT0iMCIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwb2x5Z29uIHBvaW50cz0iMTUwLDUwIDE1NSw3MCAxNDUsNzAiIGZpbGw9IiMwMDMwOEYiIG9wYWNpdHk9IjAuNSIvPjxsaW5lIHgxPSIxNTAiIHkxPSI3MCIgeDI9IjE1MCIgeTI9IjE1MCIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMyIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjamlldHMpIi8+PC9zdmc+',
    cssClass: 'bg-airforce-flyover',
    description: 'Sky gradient with jet silhouettes and contrails'
  },
  {
    id: 'airforce-airbase',
    name: 'Airbase Silhouettes',
    branch: 'Air Force',
    category: 'Installation',
    gradient: 'linear-gradient(180deg, #FF6B35 0%, #FF8C42 10%, #00308F 30%, #001f3f 60%, #0B0C0D 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYWlyYmFzZSIgeD0iMCIgeT0iMCIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxyZWN0IHg9IjUwIiB5PSIyMDAiIHdpZHRoPSI0MCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMwMDMwOEYiIG9wYWNpdHk9IjAuNCIvPjxyZWN0IHg9IjIwMCIgeT0iMjIwIiB3aWR0aD0iNTAiIGhlaWdodD0iODAiIGZpbGw9IiMwMDMwOEYiIG9wYWNpdHk9IjAuMzUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI2FpcmJhc2UpIi8+PC9zdmc+',
    cssClass: 'bg-airforce-airbase',
    description: 'Sunset with airbase hangar silhouettes'
  },
  {
    id: 'airforce-cargo-drop',
    name: 'Cargo Drop',
    branch: 'Air Force',
    category: 'Operations',
    gradient: 'linear-gradient(180deg, #4A90E2 0%, #357ABD 25%, #2C5AA0 50%, #1E3A5F 75%, #0F1D2F 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0icGFyYWNodXRlIiB4PSIwIiB5PSIwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iNTAiIHI9IjE1IiBmaWxsPSJub25lIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4zIi8+PGxpbmUgeDE9IjEwMCIgeTE9IjY1IiB4Mj0iMTAwIiB5Mj0iMTAwIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4yIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNwYXJhY2h1dGUpIi8+PC9zdmc+',
    cssClass: 'bg-airforce-cargo',
    description: 'Parachute drop silhouettes'
  },

  // SPACE FORCE BACKGROUNDS
  {
    id: 'spaceforce-satellite',
    name: 'Satellite Operations',
    branch: 'Space Force',
    category: 'Space',
    gradient: 'linear-gradient(180deg, #000000 0%, #0a1929 20%, #1E3A8A 40%, #4A5568 60%, #000000 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ic2F0ZWxsaXRlcyIgeD0iMCIgeT0iMCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMzAiIHI9IjEiIGZpbGw9IiNGRkZGRkYiIG9wYWNpdHk9IjAuOSIvPjxjaXJjbGUgY3g9IjE1MCIgY3k9IjgwIiByPSIxLjUiIGZpbGw9IiNGRkZGRkYiIG9wYWNpdHk9IjAuNyIvPjxjaXJjbGUgY3g9IjkwIiBjeT0iMTUwIiByPSIwLjgiIGZpbGw9IiNGRkZGRkYiIG9wYWNpdHk9IjAuOCIvPjxyZWN0IHg9IjEwMCIgeT0iNTAiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMxRTkwRkYiIG9wYWNpdHk9IjAuNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjc2F0ZWxsaXRlcykiLz48L3N2Zz4=',
    cssClass: 'bg-spaceforce-satellite',
    description: 'Stars with stylized satellite icons'
  },
  {
    id: 'spaceforce-launch',
    name: 'Launch Silhouette',
    branch: 'Space Force',
    category: 'Operations',
    gradient: 'linear-gradient(180deg, #FF6B35 0%, #FF8C42 5%, #1a1a2e 20%, #16213e 40%, #0f3460 60%, #000000 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ibGF1bmNoIiB4PSIwIiB5PSIwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHJlY3QgeD0iMTQ1IiB5PSIyMDAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMxRTkwRkYiIG9wYWNpdHk9IjAuNiIvPjxwb2x5Z29uIHBvaW50cz0iMTUwLDIwMCAxNDAsMjIwIDE2MCwyMjAiIGZpbGw9IiNGRjZCMzUiIG9wYWNpdHk9IjAuNyIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjbGF1bmNoKSIvPjwvc3ZnPg==',
    cssClass: 'bg-spaceforce-launch',
    description: 'Rocket launch with flame trail silhouette'
  },
  {
    id: 'spaceforce-cyber',
    name: 'Cyber Operations',
    branch: 'Space Force',
    category: 'Technology',
    gradient: 'linear-gradient(180deg, #000000 0%, #1a1a2e 20%, #16213e 40%, #0f3460 60%, #1a1a2e 80%, #000000 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iY3liZXIiIHg9IjAiIHk9IjAiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48bGluZSB4MT0iNTAiIHkxPSI1MCIgeDI9IjE1MCIgeTI9IjUwIiBzdHJva2U9IiMxRTkwRkYiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4zIi8+PGxpbmUgeDE9IjUwIiB5MT0iMTAwIiB4Mj0iMTUwIiB5Mj0iMTAwIiBzdHJva2U9IiMxRTkwRkYiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4yIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMyIgZmlsbD0iIzFFOTBGRiIgb3BhY2l0eT0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNjeWJlcikiLz48L3N2Zz4=',
    cssClass: 'bg-spaceforce-cyber',
    description: 'Digital network grid pattern'
  },

  // COAST GUARD BACKGROUNDS
  {
    id: 'coastguard-rescue',
    name: 'Rescue Operations',
    branch: 'Coast Guard',
    category: 'Maritime',
    gradient: 'linear-gradient(180deg, #4A90E2 0%, #2C5F7F 25%, #034F8B 50%, #023859 75%, #001a2e 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0icmVzY3VlIiB4PSIwIiB5PSIwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIyMCIgc3Ryb2tlPSIjRkY2QjAwIiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiIG9wYWNpdHk9IjAuMyIvPjxwYXRoIGQ9Ik0wIDEyMCBRIDUwIDExMCAxMDAgMTIwIFQgMjAwIDEyMCIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiIG9wYWNpdHk9IjAuMiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjcmVzY3VlKSIvPjwvc3ZnPg==',
    cssClass: 'bg-coastguard-rescue',
    description: 'Ocean waves with life ring silhouettes'
  },
  {
    id: 'coastguard-cutter',
    name: 'Cutter Patrol',
    branch: 'Coast Guard',
    category: 'Maritime',
    gradient: 'linear-gradient(180deg, #4682B4 0%, #2C5F7F 30%, #034F8B 60%, #001a2e 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iY3V0dGVyIiB4PSIwIiB5PSIwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHJlY3QgeD0iMTAwIiB5PSIyMDAiIHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIGZpbGw9IiMwMzRGOEIiIG9wYWNpdHk9IjAuNCIvPjxwb2x5Z29uIHBvaW50cz0iMTAwLDIwMCAxNTAsMTgwIDIwMCwyMDAiIGZpbGw9IiMwMzRGOEIiIG9wYWNpdHk9IjAuMzUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI2N1dHRlcikiLz48L3N2Zz4=',
    cssClass: 'bg-coastguard-cutter',
    description: 'Coast Guard cutter silhouette at sea'
  },
  {
    id: 'coastguard-port',
    name: 'Port Security',
    branch: 'Coast Guard',
    category: 'Security',
    gradient: 'linear-gradient(180deg, #2C3E50 0%, #34495E 20%, #1a4d6f 40%, #034F8B 70%, #001a2e 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0icG9ydCIgeD0iMCIgeT0iMCIgd2lkdGg9IjI1MCIgaGVpZ2h0PSIyNTAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxyZWN0IHg9IjUwIiB5PSIxNTAiIHdpZHRoPSIzMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMzNDQ5NUUiIG9wYWNpdHk9IjAuNCIvPjxyZWN0IHg9IjE1MCIgeT0iMTIwIiB3aWR0aD0iNDAiIGhlaWdodD0iMTMwIiBmaWxsPSIjMzQ0OTVFIiBvcGFjaXR5PSIwLjM1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgZmlsbD0idXJsKCNwb3J0KSIvPjwvc3ZnPg==',
    cssClass: 'bg-coastguard-port',
    description: 'Port infrastructure silhouettes'
  },

  // TACTICAL/UTILITY BACKGROUNDS
  {
    id: 'tactical-grayscale',
    name: 'Tactical Grayscale',
    branch: 'All',
    category: 'Utility',
    gradient: 'linear-gradient(135deg, #2C3E50 0%, #34495E 25%, #4A5568 50%, #2C3E50 75%, #1C2833 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JheSIgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0iIzRBNTU2OCIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNncmF5KSIvPjwvc3ZnPg==',
    cssClass: 'bg-tactical-grayscale',
    description: 'Professional grayscale for accessibility'
  },
  {
    id: 'low-texture',
    name: 'Low Texture Mode',
    branch: 'All',
    category: 'Accessibility',
    gradient: 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
    cssClass: 'bg-low-texture',
    description: 'Minimal texture for accessibility needs'
  },

  // ==========================================
  // TRIBUTE COLLECTION - Dramatic, Symbolic Backgrounds
  // Stylized representations honoring military service
  // No real photos, identifiable equipment, or personnel
  // ==========================================

  // TRIBUTE: Sunset Salute - Silhouetted Soldiers
  {
    id: 'tribute-sunset-salute',
    name: 'Tribute – Sunset Salute',
    branch: 'All',
    category: 'Tribute',
    gradient: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 15%, #0f3460 30%, #533483 50%, #e94560 70%, #ff6b6b 85%, #feca57 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ic3Vuc2V0U2FsdXRlIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PCEtLSBTb2xkaWVyIFNpbGhvdWV0dGVzIC0tPjxyZWN0IHg9IjEwMCIgeT0iMjgwIiB3aWR0aD0iMyIgaGVpZ2h0PSI2MCIgZmlsbD0iIzAwMDAwMCIgb3BhY2l0eT0iMC43Ii8+PHBvbHlnb24gcG9pbnRzPSIxMDEuNSwyODAgMTA1LDI3NSA5OCwyNzUiIGZpbGw9IiMwMDAwMDAiIG9wYWNpdHk9IjAuNyIvPjxyZWN0IHg9IjIwMCIgeT0iMjkwIiB3aWR0aD0iMyIgaGVpZ2h0PSI1MCIgZmlsbD0iIzAwMDAwMCIgb3BhY2l0eT0iMC43Ii8+PHBvbHlnb24gcG9pbnRzPSIyMDEuNSwyOTAgMjA1LDI4NSAxOTgsMjg1IiBmaWxsPSIjMDAwMDAwIiBvcGFjaXR5PSIwLjciLz48cmVjdCB4PSIzMDAiIHk9IjI4NSIgd2lkdGg9IjMiIGhlaWdodD0iNTUiIGZpbGw9IiMwMDAwMDAiIG9wYWNpdHk9IjAuNyIvPjxwb2x5Z29uIHBvaW50cz0iMzAxLjUsMjg1IDMwNSwyODAgMjk4LDI4MCIgZmlsbD0iIzAwMDAwMCIgb3BhY2l0eT0iMC43Ii8+PCEtLSBBbWVyaWNhbiBGbGFnIFN0cmlwZXMgKFNlbWktVHJhbnNwYXJlbnQpIC0tPjxyZWN0IHg9IjAiIHk9IjUwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjQjIyMjM0IiBvcGFjaXR5PSIwLjE1Ii8+PHJlY3QgeD0iMCIgeT0iMTEwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjQjIyMjM0IiBvcGFjaXR5PSIwLjE1Ii8+PHJlY3QgeD0iMCIgeT0iMTcwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjQjIyMjM0IiBvcGFjaXR5PSIwLjE1Ii8+PCEtLSBTdGFycyAtLT48cG9seWdvbiBwb2ludHM9IjUwLDgwIDUyLDg2IDU4LDg2IDUzLDkwIDU1LDk2IDUwLDkyIDQ1LDk2IDQ3LDkwIDQyLDg2IDQ4LDg2IiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjIiLz48cG9seWdvbiBwb2ludHM9IjEwMCwxMDAgMTAyLDEwNiAxMDgsMTA2IDEwMywxMTAgMTA1LDExNiAxMDAsMTEyIDk1LDExNiA5NywxMTAgOTIsMTA2IDk4LDEwNiIgZmlsbD0iI0ZGRkZGRiIgb3BhY2l0eT0iMC4yIi8+PHBvbHlnb24gcG9pbnRzPSIxNTAsNjAgMTUyLDY2IDE1OCw2NiAxNTMsNzAgMTU1LDc2IDE1MCw3MiAxNDUsNzYgMTQ3LDcwIDE0Miw2NiAxNDgsNjYiIGZpbGw9IiNGRkZGRkYiIG9wYWNpdHk9IjAuMiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9InVybCgjc3Vuc2V0U2FsdXRlKSIvPjwvc3ZnPg==',
    cssClass: 'bg-tribute-sunset',
    description: 'Three silhouetted soldiers saluting under a dramatic sunset sky with semi-transparent American flag overlay',
    isDefault: false
  },

  // TRIBUTE: Fighter Flyby - Silhouetted Aircraft
  {
    id: 'tribute-fighter-flyby',
    name: 'Tribute – Fighter Flyby',
    branch: 'Air Force',
    category: 'Tribute',
    gradient: 'linear-gradient(180deg, #0a0e27 0%, #1a237e 20%, #2962ff 40%, #82b1ff 60%, #b3e5fc 80%, #e1f5fe 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZmlnaHRlckZseWJ5IiB4PSIwIiB5PSIwIiB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PCEtLSBGaWdodGVyIEpldCBTaWxob3VldHRlIC0tPjxwb2x5Z29uIHBvaW50cz0iMTUwLDEwMCAxNjAsMTA1IDE1NSw5NSAxNjAsMTAwIDE3MCwxMDUgMTY1LDk1IDE2MCw4NSIgZmlsbD0iIzAwMDAwMCIgb3BhY2l0eT0iMC40Ii8+PHBvbHlnb24gcG9pbnRzPSIzMDAsMTUwIDMxMCwxNTUgMzA1LDE0NSAzMTAsMTUwIDMyMCwxNTUgMzE1LDE0NSAzMTAsMTM1IiBmaWxsPSIjMDAwMDAwIiBvcGFjaXR5PSIwLjM1Ii8+PCEtLSBDb250cmFpbHMgLS0+PGxpbmUgeDE9IjE3MCIgeTE9IjEwNSIgeDI9IjIyMCIgeTI9IjEzMCIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjEuNSIgb3BhY2l0eT0iMC4yIi8+PGxpbmUgeDE9IjMyMCIgeTE9IjE1NSIgeDI9IjM3MCIgeTI9IjE4MCIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjEuNSIgb3BhY2l0eT0iMC4xNSIvPjxsaW5lIHgxPSIxNjUiIHkxPSI5NSIgeDI9IjIxNSIgeTI9IjEyMCIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjEuNSIgb3BhY2l0eT0iMC4yIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0idXJsKCNmaWdodGVyRmx5YnkpIi8+PC9zdmc+',
    cssClass: 'bg-tribute-flyby',
    description: 'Silhouetted fighter jets in formation with contrails across a sky blue gradient',
    isDefault: false
  },

  // TRIBUTE: Carrier at Dawn - Naval Silhouette
  {
    id: 'tribute-carrier-dawn',
    name: 'Tribute – Carrier at Dawn',
    branch: 'Navy',
    category: 'Tribute',
    gradient: 'linear-gradient(180deg, #0d1b2a 0%, #1b263b 20%, #415a77 40%, #778da9 60%, #e0e1dd 80%, #ffd6ba 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iY2FycmllckRhd24iIHg9IjAiIHk9IjAiIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48IS0tIEFpcmNyYWZ0IENhcnJpZXIgU2lsaG91ZXR0ZSAtLT48cmVjdCB4PSIxMDAiIHk9IjQwMCIgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMCIgZmlsbD0iIzAwMDAwMCIgb3BhY2l0eT0iMC42Ii8+PHJlY3QgeD0iMTUwIiB5PSIzODAiIHdpZHRoPSIzMDAiIGhlaWdodD0iMjAiIGZpbGw9IiMwMDAwMDAiIG9wYWNpdHk9IjAuNSIvPjxyZWN0IHg9IjI1MCIgeT0iMzUwIiB3aWR0aD0iMjAiIGhlaWdodD0iNTAiIGZpbGw9IiMwMDAwMDAiIG9wYWNpdHk9IjAuNiIvPjxyZWN0IHg9IjM1MCIgeT0iMzUwIiB3aWR0aD0iMjAiIGhlaWdodD0iNTAiIGZpbGw9IiMwMDAwMDAiIG9wYWNpdHk9IjAuNiIvPjwhLS0gT2NlYW4gV2F2ZXMgLS0+PHBhdGggZD0iTTAgNDUwIFEgNTAgNDQwIDEwMCA0NTAgVCAxNTAgNDYwIFQgMjAwIDQ1MCBUICAyNTAgNDYwIFQgMzAwIDQ1MCBUIDM1MCA0NjAgVCA0MDAgNDUwIFQgNDUwIDQ2MCBUIDQ1MCA0NjAgTCAwIDQ2MCBaIiBmaWxsPSIjMDAwMDAwIiBvcGFjaXR5PSIwLjE1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNjYXJyaWVyRGF3bikiLz48L3N2Zz4=',
    cssClass: 'bg-tribute-carrier',
    description: 'Aircraft carrier silhouette at dawn with ocean waves',
    isDefault: false
  },

  // TRIBUTE: Memorial Wall - Remembrance
  {
    id: 'tribute-memorial-wall',
    name: 'Tribute – Memorial Wall',
    branch: 'All',
    category: 'Tribute',
    gradient: 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 20%, #404040 40%, #525252 60%, #707070 80%, #8c8c8c 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ibWVtb3JpYWxXYWxsIiB4PSIwIiB5PSIwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PCEtLSBFdGNoZWQgU3RhcnMgLS0+PHBvbHlnb24gcG9pbnRzPSI1MCwxMDAgNTIsMTA2IDU4LDEwNiA1MywxMTAgNTUsMTE2IDUwLDExMiA0NSwxMTYgNDcsMTEwIDQyLDEwNiA0OCwxMDYiIGZpbGw9IiNGRkZGRkYiIG9wYWNpdHk9IjAuMSIvPjxwb2x5Z29uIHBvaW50cz0iMTUwLDE1MCAxNTIsMTU2IDE1OCwxNTYgMTUzLDE2MCAxNTUsMTY2IDE1MCwxNjIgMTQ1LDE2NiAxNDcsMTYwIDE0MiwxNTYgMTQ4LDE1NiIgZmlsbD0iI0ZGRkZGRiIgb3BhY2l0eT0iMC4wOCIvPjxwb2x5Z29uIHBvaW50cz0iMjUwLDgwIDI1Miw4NiAyNTgsODYgMjUzLDkwIDI1NSw5NiAyNTAsOTIgMjQ1LDk2IDI0Nyw5MCAyNDIsODYgMjQ4LDg2IiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjEyIi8+PCEtLSBFbmdyYXZlZCBMaW5lcyAtLT48bGluZSB4MT0iMzAiIHkxPSIyMDAiIHgyPSIyNzAiIHkyPSIyMDAiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMDUiLz48bGluZSB4MT0iMzAiIHkxPSIyMjAiIHgyPSIyNzAiIHkyPSIyMjAiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI21lbW9yaWFsV2FsbCkiLz48L3N2Zz4=',
    cssClass: 'bg-tribute-memorial',
    description: 'Solemn memorial wall with etched stars and engraved tribute lines',
    isDefault: false
  },

  // TRIBUTE: Helicopter Rescue - Air Support
  {
    id: 'tribute-helo-rescue',
    name: 'Tribute – Helicopter Rescue',
    branch: 'Army',
    category: 'Tribute',
    gradient: 'linear-gradient(180deg, #1a1a2e 0%, #2c3e50 25%, #34495e 50%, #95a5a6 75%, #ecf0f1 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iaGVsb1Jlc2N1ZSIgeD0iMCIgeT0iMCIgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjwhLS0gSGVsaWNvcHRlciBTaWxob3VldHRlIC0tPjxlbGxpcHNlIGN4PSIyMDAiIGN5PSIxNTAiIHJ4PSI2MCIgcnk9IjgiIGZpbGw9IiMwMDAwMDAiIG9wYWNpdHk9IjAuMyIvPjxyZWN0IHg9IjE4NSIgeT0iMTU1IiB3aWR0aD0iMzAiIGhlaWdodD0iMjAiIGZpbGw9IiMwMDAwMDAiIG9wYWNpdHk9IjAuNCIvPjxyZWN0IHg9IjE5NSIgeT0iMTQwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTUiIGZpbGw9IiMwMDAwMDAiIG9wYWNpdHk9IjAuNCIvPjwhLS0gUm90b3IgQmxhZGVzIChCbHVycmVkKSAtLT48bGluZSB4MT0iMTQwIiB5MT0iMTUwIiB4Mj0iMjYwIiB5Mj0iMTUwIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMyIgb3BhY2l0eT0iMC4xNSIvPjwhLS0gQ2xvdWRzIC0tPjxlbGxpcHNlIGN4PSI4MCIgY3k9IjEwMCIgcng9IjQwIiByeT0iMTUiIGZpbGw9IiNGRkZGRkYiIG9wYWNpdHk9IjAuMSIvPjxlbGxpcHNlIGN4PSIzMjAiIGN5PSI4MCIgcng9IjUwIiByeT0iMjAiIGZpbGw9IiNGRkZGRkYiIG9wYWNpdHk9IjAuMDgiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI2hlbG9SZXN',
    cssClass: 'bg-tribute-helo',
    description: 'Helicopter silhouette in flight with rotor blur and cloud formations',
    isDefault: false
  },

  // TRIBUTE: Tank Column - Armor Division
  {
    id: 'tribute-armor-column',
    name: 'Tribute – Armor Division',
    branch: 'Army',
    category: 'Tribute',
    gradient: 'linear-gradient(180deg, #2c2416 0%, #3e3125 20%, #5c4a31 40%, #7a623f 60%, #a88f5d 80%, #d4b896 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYXJtb3JDb2x1bW4iIHg9IjAiIHk9IjAiIHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48IS0tIFRhbmsgU2lsaG91ZXR0ZXMgLS0+PHJlY3QgeD0iMTAwIiB5PSIzMDAiIHdpZHRoPSI4MCIgaGVpZ2h0PSIzMCIgZmlsbD0iIzAwMDAwMCIgb3BhY2l0eT0iMC41Ii8+PHJlY3QgeD0iMTEwIiB5PSIyODAiIHdpZHRoPSI2MCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzAwMDAwMCIgb3BhY2l0eT0iMC41Ii8+PGxpbmUgeDE9IjE4MCIgeTE9IjI5MCIgeDI9IjIyMCIgeTI9IjI3MCIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjMiIG9wYWNpdHk9IjAuNSIvPjxyZWN0IHg9IjI1MCIgeT0iMzIwIiB3aWR0aD0iODAiIGhlaWdodD0iMzAiIGZpbGw9IiMwMDAwMDAiIG9wYWNpdHk9IjAuNCIvPjxyZWN0IHg9IjI2MCIgeT0iMzAwIiB3aWR0aD0iNjAiIGhlaWdodD0iMjAiIGZpbGw9IiMwMDAwMDAiIG9wYWNpdHk9IjAuNCIvPjwhLS0gRHVzdCBDbG91ZHMgLS0+PGVsbGlwc2UgY3g9IjE0MCIgY3k9IjM0MCIgcng9IjMwIiByeT0iMTAiIGZpbGw9IiM4QjczNTUiIG9wYWNpdHk9IjAuMiIvPjxlbGxpcHNlIGN4PSIyOTAiIGN5PSIzNjAiIHJ4PSIzNSIgcnk9IjEyIiBmaWxsPSIjOEI3MzU1IiBvcGFjaXR5PSIwLjE1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0idXJsKCNhcm1vckNvbHVtbikiLz48L3N2Zz4=',
    cssClass: 'bg-tribute-armor',
    description: 'Silhouetted tank column moving across desert terrain with dust clouds',
    isDefault: false
  },

  // TRIBUTE: Submarine Deep - Silent Service
  {
    id: 'tribute-sub-deep',
    name: 'Tribute – Silent Service',
    branch: 'Navy',
    category: 'Tribute',
    gradient: 'linear-gradient(180deg, #000814 0%, #001d3d 20%, #003566 40%, #004d7a 60%, #006494 80%, #0077b6 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ic3ViRGVlcCIgeD0iMCIgeT0iMCIgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjwhLS0gU3VibWFyaW5lIFNpbGhvdWV0dGUgLS0+PGVsbGlwc2UgY3g9IjIwMCIgY3k9IjI1MCIgcng9IjEwMCIgcnk9IjIwIiBmaWxsPSIjMDAwMDAwIiBvcGFjaXR5PSIwLjYiLz48cmVjdCB4PSIxODAiIHk9IjIzMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMDAwMDAwIiBvcGFjaXR5PSIwLjYiLz48cmVjdCB4PSIyMjAiIHk9IjIzMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMDAwMDAwIiBvcGFjaXR5PSIwLjYiLz48IS0tIEJ1YmJsZXMgLS0+PGNpcmNsZSBjeD0iODAiIGN5PSIxMjAiIHI9IjMiIGZpbGw9IiNGRkZGRkYiIG9wYWNpdHk9IjAuMSIvPjxjaXJjbGUgY3g9IjE1MCIgY3k9IjE4MCIgcj0iMiIgZmlsbD0iI0ZGRkZGRiIgb3BhY2l0eT0iMC4wOCIvPjxjaXJjbGUgY3g9IjMwMCIgY3k9IjE0MCIgcj0iMi41IiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjA5Ii8+PGNpcmNsZSBjeD0iMzUwIiBjeT0iMjAwIiByPSIyIiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjA3Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNzdWJEZWVwKSIvPjwvc3ZnPg==',
    cssClass: 'bg-tribute-submarine',
    description: 'Submarine silhouette in deep ocean waters with bubble trails',
    isDefault: false
  },

  // TRIBUTE: Paratroopers Drop - Airborne
  {
    id: 'tribute-airborne-drop',
    name: 'Tribute – Airborne Drop',
    branch: 'Army',
    category: 'Tribute',
    gradient: 'linear-gradient(180deg, #0f0f23 0%, #2a2a4a 20%, #4a4a7a 40%, #7a7aa0 60%, #a0a0c0 80%, #d0d0e0 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDUwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYWlyYm9ybmVEcm9wIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDUwIiBoZWlnaHQ9IjQ1MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PCEtLSBQYXJhY2h1dGUgU2lsaG91ZXR0ZXMgLS0+PGVsbGlwc2UgY3g9IjEwMCIgY3k9IjE1MCIgcng9IjI1IiByeT0iMTUiIGZpbGw9IiMwMDAwMDAiIG9wYWNpdHk9IjAuNCIvPjxsaW5lIHgxPSIxMDAiIHkxPSIxNjUiIHgyPSIxMDAiIHkyPSIyMDAiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjQiLz48ZWxsaXBzZSBjeD0iMjUwIiBjeT0iMjAwIiByeD0iMjUiIHJ5PSIxNSIgZmlsbD0iIzAwMDAwMCIgb3BhY2l0eT0iMC4zNSIvPjxsaW5lIHgxPSIyNTAiIHkxPSIyMTUiIHgyPSIyNTAiIHkyPSIyNTAiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjM1Ii8+PGVsbGlwc2UgY3g9IjM1MCIgY3k9IjEwMCIgcng9IjI1IiByeT0iMTUiIGZpbGw9IiMwMDAwMDAiIG9wYWNpdHk9IjAuMyIvPjxsaW5lIHgxPSIzNTAiIHkxPSIxMTUiIHgyPSIzNTAiIHkyPSIxNTAiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjMiLz48IS0tIENsb3VkcyAtLT48ZWxsaXBzZSBjeD0iNjAiIGN5PSI4MCIgcng9IjQwIiByeT0iMTUiIGZpbGw9IiNGRkZGRkYiIG9wYWNpdHk9IjAuMDgiLz48ZWxsaXBzZSBjeD0iMzgwIiBjeT0iMzAwIiByeD0iNTAiIHJ5PSIyMCIgZmlsbD0iI0ZGRkZGRiIgb3BhY2l0eT0iMC4wNiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjQ1MCIgaGVpZ2h0PSI0NTAiIGZpbGw9InVybCgjYWlyYm9ybmVEcm9wKSIvPjwvc3ZnPg==',
    cssClass: 'bg-tribute-airborne',
    description: 'Paratroopers descending with deployed parachutes against cloudy sky',
    isDefault: false
  },

  // TRIBUTE: Marine Landing - Beach Assault
  {
    id: 'tribute-beach-assault',
    name: 'Tribute – Beach Landing',
    branch: 'Marine Corps',
    category: 'Tribute',
    gradient: 'linear-gradient(180deg, #2c3e50 0%, #34495e 15%, #546e7a 30%, #607d8b 45%, #90a4ae 60%, #b0bec5 75%, #cfd8dc 90%, #e0e0e0 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYmVhY2hBc3NhdWx0IiB4PSIwIiB5PSIwIiB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PCEtLSBMYW5kaW5nIENyYWZ0IFNpbGhvdWV0dGUgLS0+PHJlY3QgeD0iMTUwIiB5PSIzNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIGZpbGw9IiMwMDAwMDAiIG9wYWNpdHk9IjAuNSIvPjxwb2x5Z29uIHBvaW50cz0iMTUwLDM1MCAyMDAsMzMwIDI1MCwzNTAiIGZpbGw9IiMwMDAwMDAiIG9wYWNpdHk9IjAuNSIvPjwhLS0gTWFyaW5lIFNpbGhvdWV0dGVzIC0tPjxyZWN0IHg9IjE3MCIgeT0iMzIwIiB3aWR0aD0iMyIgaGVpZ2h0PSIzMCIgZmlsbD0iIzAwMDAwMCIgb3BhY2l0eT0iMC42Ii8+PHBvbHlnb24gcG9pbnRzPSIxNzEuNSwzMjAgMTc0LDMxNSAxNjksMzE1IiBmaWxsPSIjMDAwMDAwIiBvcGFjaXR5PSIwLjYiLz48cmVjdCB4PSIyMTAiIHk9IjMyNSIgd2lkdGg9IjMiIGhlaWdodD0iMjUiIGZpbGw9IiMwMDAwMDAiIG9wYWNpdHk9IjAuNiIvPjxwb2x5Z29uIHBvaW50cz0iMjExLjUsMzI1IDIxNCwzMjAgMjA5LDMyMCIgZmlsbD0iIzAwMDAwMCIgb3BhY2l0eT0iMC42Ii8+PCEtLSBPY2VhbiBXYXZlcyAtLT48cGF0aCBkPSJNIDAgNDAwIFEgNTAgMzkwIDEwMCA0MDAgVCAxNTAgNDEwIFQgMjAwIDQwMCBUIDI1MCA0MTAgVCAzMDAgNDAwIFQgMzUwIDQxMCBUICA0MDAgNDAwIFQgNDUwIDQxMCBUIDUwMCA0MDAgTCA1MDAgNTAwIEwgMCA1MDAgWiIgZmlsbD0iIzAwMDAwMCIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0idXJsKCNiZWFjaEFzc2F1bHQpIi8+PC9zdmc+',
    cssClass: 'bg-tribute-beach',
    description: 'Landing craft approaching beach with Marine silhouettes and ocean waves',
    isDefault: false
  },

  // TRIBUTE: Freedom's Banner - Flag Ceremony
  {
    id: 'tribute-freedom-banner',
    name: 'Tribute – Freedom\'s Banner',
    branch: 'All',
    category: 'Tribute',
    gradient: 'linear-gradient(180deg, #1a1a2e 0%, #2a2a4a 10%, #3c3b6e 25%, #FFFFFF 40%, #FFFFFF 60%, #B22234 75%, #8B1725 90%, #5a0f17 100%)',
    overlayPattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZnJlZWRvbUJhbm5lciIgeD0iMCIgeT0iMCIgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjwhLS0gRmxhZ3BvbGUgLS0+PHJlY3QgeD0iNTAiIHk9IjUwIiB3aWR0aD0iNCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMwMDAwMDAiIG9wYWNpdHk9IjAuNCIvPjwhLS0gRmxhZyBXYXZpbmcgLS0+PHBhdGggZD0iTSA1NCA3MCBRIDgwIDYwIDEyMCA3MCBRIDE2MCA4MCAxODAgNzAgUSAyMDAgNjAgMjIwIDcwIEwgMjIwIDEzMCBRIDIwMCAxNDAgMTgwIDEzMCBRIDE2MCAxMjAgMTIwIDEzMCBRIDgwIDE0MCA1NCAxMzAgWiIgZmlsbD0iIzAwMDAwMCIgb3BhY2l0eT0iMC4zIi8+PCEtLSBTdGFycyAtLT48cG9seWdvbiBwb2ludHM9IjcwLDg1IDcyLDkxIDc4LDkxIDczLDk1IDc1LDEwMSA3MCw5NyA2NSwxMDEgNjcsOTUgNjIsOTEgNjgsOTEiIGZpbGw9IiNGRkZGRkYiIG9wYWNpdHk9IjAuMiIvPjxwb2x5Z29uIHBvaW50cz0iMTAwLDEwMCAxMDIsMTA2IDEwOCwxMDYgMTAzLDExMCAxMDUsMTE2IDEwMCwxMTIgOTUsMTE2IDk3LDExMCA5MiwxMDYgOTgsMTA2IiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjIiLz48cG9seWdvbiBwb2ludHM9IjE0MCw4NSAxNDIsOTEgMTQ4LDkxIDE0Myw5NSAxNDUsMTAxIDE0MCw5NyAxMzUsMTAxIDEzNyw5NSAxMzIsOTEgMTM4LDkxIiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjIiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI2ZyZWVkb21CYW5uZXIpIi8+PC9zdmc+',
    cssClass: 'bg-tribute-flag',
    description: 'American flag waving on flagpole with stars and stripes gradient',
    isDefault: false
  }
];

// Helper function to get backgrounds by branch
export function getBackgroundsByBranch(branch: string): MilitaryBackground[] {
  return MILITARY_BACKGROUNDS.filter(bg =>
    bg.branch === branch || bg.branch === 'All'
  );
}

// Helper function to get background by ID
export function getBackgroundById(id: string): MilitaryBackground | undefined {
  return MILITARY_BACKGROUNDS.find(bg => bg.id === id);
}

// Helper function to get default background
export function getDefaultBackground(): MilitaryBackground {
  return MILITARY_BACKGROUNDS.find(bg => bg.isDefault) || MILITARY_BACKGROUNDS[0];
}

// Helper function to apply background to element
export function applyBackground(elementId: string, backgroundId: string): void {
  const element = document.getElementById(elementId);
  const background = getBackgroundById(backgroundId);

  if (element && background) {
    element.style.background = background.gradient;
    if (background.overlayPattern) {
      element.style.backgroundImage = `${background.gradient}, url("${background.overlayPattern}")`;
      element.style.backgroundBlendMode = 'overlay';
    }
  }
}
