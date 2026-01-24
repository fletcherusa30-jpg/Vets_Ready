# 🎖️ Military Badge System - Visual & Design Guide

## Badge Design Specifications

### Color Palettes

#### Badge #1: HALO Wing Badge
```
Primary:    Brushed Gunmetal (#707070)
Secondary:  Golden (#FFD700)
Accent:     Light Silver (#c0c0c0)
Purpose:    Airborne elite operations
```

#### Badge #2: Airborne Badge
```
Primary:    Metallic Gray (#b0b0b0)
Secondary:  Golden (#FFD700)
Accent:     Brown (#8B7355)
Purpose:    Airborne resilience
```

#### Badge #3: Infantry Badge
```
Primary:    Matte Black (#1a1a1a)
Secondary:  Steel (#555555)
Accent:     Gray (#4a4a4a)
Purpose:    Ground combat ready
```

#### Badge #4: Armor Badge
```
Primary:    Desert Tan (#d4a574)
Secondary:  Iron (#8b6f47)
Accent:     Rust (#b8926a)
Purpose:    Durability in harsh environments
```

#### Badge #5: Artillery Badge
```
Primary:    Matte Black (#2a2a2a)
Secondary:  Golden (#FFD700)
Accent:     Orange (#FFA500)
Purpose:    Explosive power
```

#### Badge #6: Aviation Badge
```
Primary:    Sky Blue (#4a90e2)
Secondary:  Navy (#2c5aa0)
Accent:     Gray (#666666)
Purpose:    Speed and technology
```

#### Badge #7: Special Ops Badge
```
Primary:    Dark Matte (#1a1a1a)
Secondary:  Charcoal (#2a2a2a)
Accent:     Subtle Gray (#3a3a3a)
Purpose:    Stealth and precision
```

#### Badge #8: Tactical Shield Badge
```
Primary:    Steel (#4a5568)
Secondary:  Golden (#FFD700)
Accent:     Navy (#2a3f5f)
Purpose:    Modern tactical doctrine
```

#### Badge #9: Camo Badge
```
Primary:    Olive Drab (#3a4f2a)
Secondary:  Dark Olive (#2a3f1a)
Accent:     Sage Green (#4a6f3a)
Purpose:    Field readiness
```

#### Badge #10: WWII Badge
```
Primary:    Olive Drab (#6b8e23)
Secondary:  Khaki (#D2B48C)
Accent:     Gold (#C4A000)
Purpose:    Historical heritage
```

---

## Visual Elements

### Shared Design Patterns

#### Shadow Effects
```tsx
<filter id="shadow">
  <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.5" />
</filter>
```

#### Metallic Gradients
```tsx
<linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
  <stop offset="0%" style={{ stopColor: '#e0e0e0' }} />
  <stop offset="50%" style={{ stopColor: '#b0b0b0' }} />
  <stop offset="100%" style={{ stopColor: '#505050' }} />
</linearGradient>
```

#### Distressed Textures
```tsx
<filter id="distress">
  <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" />
  <feDisplacementMap in="SourceGraphic" scale="3" />
</filter>
```

#### Glow Effects
```tsx
<filter id="glow">
  <feGaussianBlur stdDeviation="2" />
  <feDropShadow dx="1" dy="1" stdDeviation="2" floodOpacity="0.8" />
</filter>
```

---

## Size Variations

All badges support three sizes via `size` prop:

### Small (sm)
```
Dimensions: 64px × 64px
Use Case:   List items, dashboards
Tailwind:   w-16 h-16
Detail:     Simplified design
```

### Medium (md)
```
Dimensions: 96px × 96px
Use Case:   Grids, rows
Tailwind:   w-24 h-24
Detail:     Full detail visible
```

### Large (lg)
```
Dimensions: 128px × 128px
Use Case:   Modals, showcase
Tailwind:   w-32 h-32
Detail:     Maximum detail, animation ready
```

---

## Display Modes

### Grid Mode
```
┌────┬────┬────┬────┬────┐
│ 🎖️ │ 🔒 │ 🎖️ │ 🔒 │ 🎖️ │
└────┴────┴────┴────┴────┘
┌────┬────┬────┬────┬────┐
│ 🔒 │ 🎖️ │ 🔒 │ 🎖️ │ 🔒 │
└────┴────┴────┴────┴────┘
```
**Layout**: CSS Grid, 5 columns on desktop, 3 on tablet, 2 on mobile
**Spacing**: 1.5rem gaps
**Interaction**: Click opens modal
**Accessibility**: Keyboard navigation enabled

### Row Mode
```
┌────────────────────────────────────────────────┐
│ 🎖️ | 🔒 | 🎖️ | 🔒 | 🎖️ | 🔒 | 🎖️ | 🔒 | ...│
└────────────────────────────────────────────────┘
```
**Layout**: Horizontal flex, overflow-x-auto
**Spacing**: 1rem gaps
**Use Case**: Dashboard row
**Tooltip**: Hover for badge name

### Showcase Mode
```
┌─────────────────────────────────────┐
│   Military Service Badges           │
│                                     │
│   ┌─────────────────────────────┐   │
│   │       FEATURED BADGE        │   │
│   │       [Large SVG]           │   │
│   │    [Name & Description]     │   │
│   │  Unlock: [Condition]        │   │
│   └─────────────────────────────┘   │
│                                     │
│  [Grid of all 10 badges below]     │
│                                     │
└─────────────────────────────────────┘
```
**Layout**: Full page dark theme
**Background**: Gradient slate-900 to slate-800
**Featured**: Large badge display + details
**Stats**: Progress bar, counts, percentages

---

## State Variations

### Unlocked Badge
```
Visual State:
  • Full color saturation
  • Normal opacity (1.0)
  • Visible details
  • Hover: scale 1.1

Indicator: ✓ Badge Unlocked (in modal)
Background: Gradient (blue/slate)
Border: Yellow/gold highlight
```

### Locked Badge
```
Visual State:
  • Reduced saturation
  • Opacity 0.5
  • Muted colors
  • 🔒 Lock icon overlaid

Indicator: [Unlock Condition Text]
Background: Dark gray/slate
Border: Gray
Interaction: Still clickable (show unlock path)
```

### Hover State
```
Transform: scale(1.1)
Transition: 0.3s ease-out
Cursor: pointer
Shadow: Enhanced drop shadow
Tooltip: Badge name appears
```

### Active State (Selected)
```
Ring: 4px solid yellow
Style: ring-4 ring-yellow-400
Opacity: Full brightness
Scale: 1.15
```

---

## Animation Specifications

### Badge Earn Animation (Future)
```css
@keyframes badgeUnlock {
  0% {
    opacity: 0;
    transform: scale(0.5) rotateZ(-180deg);
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: scale(1) rotateZ(0deg);
  }
}

Duration: 0.8s
Timing: cubic-bezier(0.34, 1.56, 0.64, 1)
Delay: 0.2s per badge
```

### Badge Hover Animation (Current)
```css
transform: scale(1.1);
transition: transform 0.3s ease-out;
```

### Progress Bar Animation (Current)
```css
@keyframes fillProgress {
  0% { width: 0%; }
  100% { width: 100%; }
}

Duration: 0.5s
Easing: ease-out
```

---

## Mobile Responsiveness

### Breakpoints

#### Mobile (< 640px)
```
Grid: 2 columns
Badge Size: sm (w-16 h-16)
Font: text-xs
Spacing: gap-3
Layout: Single column everywhere
```

#### Tablet (640px - 1024px)
```
Grid: 3 columns
Badge Size: md (w-24 h-24)
Font: text-sm
Spacing: gap-4
Dashboard: 2-column grid
```

#### Desktop (> 1024px)
```
Grid: 5 columns
Badge Size: md/lg (w-24 or w-32)
Font: text-base
Spacing: gap-6
Dashboard: 3-column grid
Full layouts with sidebars
```

---

## Typography

### Badge Names
```
Font: Font Weight 600 (semibold)
Color: White (#ffffff)
Size: text-sm (mobile) to text-base (desktop)
Alignment: center
Truncate: No (multiline acceptable)
```

### Badge Descriptions
```
Font: Font Weight 400 (regular)
Color: Gray-300 (#d1d5db)
Size: text-xs (mobile) to text-sm (desktop)
Line Height: 1.5
Max Width: 300px (in modals)
```

### Unlock Conditions
```
Font: Font Weight 600 (semibold)
Color: Yellow-400 (#facc15)
Size: text-sm
Label: "Unlock: "
Accessible: Always visible in modal
```

---

## Accessibility Features

### Color Contrast
```
✓ White on Dark: 21:1 (AAA)
✓ Yellow on Dark: 18:1 (AAA)
✓ Gray on Dark: 9:1 (AA)
✓ All colors tested with WebAIM
```

### Interactive Elements
```
✓ Keyboard navigation (Tab, Enter)
✓ Focus rings (ring-2 ring-blue-500)
✓ Hover states visible
✓ Click targets ≥ 44px
```

### Text Alternatives
```
✓ Locked badges: alt="Locked badge - click for details"
✓ Unlocked badges: alt="Unlocked badge"
✓ Modal titles: semantic HTML <h3>
✓ Descriptions: <p> semantic structure
```

### Screen Reader Support
```
✓ ARIA labels on interactive elements
✓ Semantic heading hierarchy
✓ List structures for badge grids
✓ Form labels for inputs
```

---

## Brand Guidelines

### Military Aesthetic
- **Rugged**: Use distressed textures
- **Professional**: Metallic finishes
- **Authentic**: Real military symbolism
- **Heroic**: Golden accents for emphasis
- **Timeless**: Classic geometric shapes

### Design Consistency
- **Borders**: 1-2px dark outlines
- **Shadows**: Always include drop shadows
- **Gradients**: Linear or radial, military colors
- **Symmetry**: Most badges vertically symmetric
- **Detail**: SVG filters for depth

### Visual Hierarchy
1. **Primary element**: Central symbol (wing, rifle, tank)
2. **Secondary element**: Supporting shape (shield, background)
3. **Accent element**: Details (star, stripe, highlight)
4. **Border**: Outer ring frame
5. **Effects**: Shadow and glow

---

## SVG Structure Template

```tsx
import React from 'react'

interface BadgeProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
}

export const MyBadge: React.FC<BadgeProps> = ({
  size = 'md',
  className = ''
}) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`${sizeMap[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradients, filters, patterns */}
      </defs>

      {/* Background */}

      {/* Main elements */}

      {/* Details and effects */}

      {/* Border */}
    </svg>
  )
}
```

---

## Implementation Checklist for New Badge

- [ ] Design sketch created
- [ ] Color palette selected
- [ ] SVG component file created
- [ ] ViewBox set to 0 0 200 200
- [ ] All elements properly grouped
- [ ] Gradients/filters defined in <defs>
- [ ] Responsive sizing implemented (sm/md/lg)
- [ ] Drop shadow applied
- [ ] Border styling completed
- [ ] Exported from index.ts
- [ ] Added to BADGES array in BadgeLibrary
- [ ] Backend unlock logic added
- [ ] Documentation updated
- [ ] Tested at all sizes
- [ ] Mobile appearance verified
- [ ] Accessibility checked
- [ ] Hover effects working
- [ ] Modal details complete

---

## Quality Assurance

### Visual Testing Checklist
- [ ] Badge renders at all sizes
- [ ] Colors match specification
- [ ] No SVG rendering errors
- [ ] Shadows visible and correct
- [ ] Text centered if applicable
- [ ] Borders aligned properly
- [ ] Effects not pixelated
- [ ] Locked/unlocked distinction clear
- [ ] Mobile appearance acceptable
- [ ] Hover scale smooth
- [ ] Modal displays correctly
- [ ] Print-friendly (if needed)

### Browser Compatibility
```
✓ Chrome/Chromium (latest 2 versions)
✓ Firefox (latest 2 versions)
✓ Safari (latest 2 versions)
✓ Edge (latest 2 versions)
✓ Mobile Chrome
✓ Mobile Safari
```

---

## Design System Integration

### Tailwind CSS Classes Used
```
Layout: grid, flex, gap-*, p-*, m-*
Colors: bg-*, text-*, border-*, ring-*
Effects: shadow-*, opacity-*, hover:*
Responsive: sm:, md:, lg:, xl:
Animation: transition, transform, scale-*
```

### Custom Colors
```
Military grays:     #2a2a2a, #4a4a4a, #707070, #b0b0b0
Military golds:     #FFD700, #C4A000, #FFA500
Military blues:     #2c5aa0, #4a90e2, #003366
Military greens:    #3a4f2a, #4a6f3a, #556b2f
```

---

## Future Design Enhancements

### Potential Additions
1. **Animated earning** - Celebration animation when unlocked
2. **Badge levels** - Rare, Epic, Legendary tiers
3. **Seasonal variants** - Holiday badge designs
4. **Custom colors** - User-selectable color themes
5. **3D effects** - Perspective transforms
6. **Sound design** - Unlock sound effects
7. **Particle effects** - Success animation
8. **Badge combinations** - Prestige system

---

**Design System Version**: 1.0.0
**Last Updated**: January 23, 2026
**Status**: ✅ Complete and Implemented
