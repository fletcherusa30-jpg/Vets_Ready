# Military Badge System - Complete Documentation

## Overview

PhoneApp 2.0 now features an integrated **Military Service Badge System** with 10 original military-inspired badge designs. These badges are earned as achievements when veterans analyze claims, reach rating milestones, and demonstrate service expertise.

---

## Badge Collection

### 1. **HALO-Inspired Wing Badge**
- **Visual Design**: Wide, angular wings with stylized parachute canopy and golden spearhead
- **Unlock Condition**: Complete airborne specialty analysis (3+ PTSD/TBI/Tinnitus analyses)
- **Color Scheme**: Brushed gunmetal with golden lightning accents
- **Military Significance**: Represents elite airborne rapid deployment capabilities

### 2. **Airborne-Inspired Badge**
- **Visual Design**: Shield with upward-swept wings flanking a golden star
- **Unlock Condition**: Analyze 3+ airborne-related disabilities
- **Color Scheme**: Metallic grays and golds with rugged texture
- **Military Significance**: Embodies airborne resilience and strength

### 3. **Infantry-Inspired Badge**
- **Visual Design**: Crossed rifles over tactical shield in matte black and steel
- **Unlock Condition**: Analyze 5+ disability claims total
- **Color Scheme**: Matte black and steel tones with sight crosshairs
- **Military Significance**: Ground combat readiness and traditional values

### 4. **Armor-Inspired Badge**
- **Visual Design**: Tank silhouette on heavy riveted shield with desert-worn texture
- **Unlock Condition**: Achieve 50%+ combined disability rating
- **Color Scheme**: Desert tan with iron rivets and weathered patina
- **Military Significance**: Durability and armored strength in harsh environments

### 5. **Artillery-Inspired Badge**
- **Visual Design**: Two stylized cannons crossing over circular emblem with explosive energy radiating lines
- **Unlock Condition**: Analyze artillery or combat-related service conditions
- **Color Scheme**: Blacks and golds with dynamic explosion effect
- **Military Significance**: Power, precision, and destructive capability

### 6. **Aviation-Inspired Wings**
- **Visual Design**: Sleek jet silhouette between aerodynamic wings on radar-grid background
- **Unlock Condition**: Analyze aviation-related service disabilities
- **Color Scheme**: Blues and grays with technological radar patterns
- **Military Significance**: Speed, agility, and technological superiority

### 7. **Special Operations-Inspired Emblem**
- **Visual Design**: Minimalist dagger overlaying subdued wings in dark matte finish
- **Unlock Condition**: Achieve 70%+ combined disability rating
- **Color Scheme**: Dark matte blacks with minimal highlights
- **Military Significance**: Stealth, precision, and elite capability

### 8. **Tactical Shield Emblem**
- **Visual Design**: Modern shield with geometric lines, star accents, and reinforced plating
- **Unlock Condition**: Complete 10+ claim analyses
- **Color Scheme**: Futuristic steels and golds with angular geometry
- **Military Significance**: Modern tactical doctrine and strength

### 9. **Camo-Themed Badge**
- **Visual Design**: Circular emblem with fractal camouflage pattern and distressed border
- **Unlock Condition**: Analyze all 8 disability condition types
- **Color Scheme**: Olive drab greens with compass rose center
- **Military Significance**: Adaptability and field readiness

### 10. **WWII-Style Vintage Badge**
- **Visual Design**: Retro emblem with muted olive drab, distressed textures, classic geometry
- **Unlock Condition**: Complete profile as WWII-era veteran (future feature)
- **Color Scheme**: Muted olive drab and khaki with distressed overlay
- **Military Significance**: Historical heritage and valor of service

---

## Frontend Implementation

### Components

#### **BadgeLibrary Component** (`BadgeLibrary.tsx`)
Main component for displaying badges in multiple modes:

```tsx
<BadgeLibrary
  userBadges={['Infantry-Inspired Badge', 'Armor-Inspired Badge']}
  displayMode="showcase"  // 'grid' | 'row' | 'showcase'
  size="md"              // 'sm' | 'md' | 'lg'
/>
```

**Display Modes:**
- **`grid`**: 5-column grid with click-to-detail modal
- **`row`**: Horizontal scrollable row (ideal for dashboard)
- **`showcase`**: Full-page immersive display with featured badge

**Props:**
- `userBadges`: Array of unlocked badge names
- `displayMode`: How to render the badge collection
- `size`: Physical size of badge SVGs

#### **Individual Badge Components**
Each badge is a standalone React component:

```tsx
import { HALOWingBadge, ArmorBadge, SpecialOpsBadge } from './MilitaryBadges'

export const MyComponent = () => (
  <div>
    <HALOWingBadge size="lg" className="custom-styles" />
    <ArmorBadge size="md" />
    <SpecialOpsBadge size="sm" />
  </div>
)
```

**Available Components:**
- `HALOWingBadge`
- `AirborneBadge`
- `InfantryBadge`
- `ArmorBadge`
- `ArtilleryBadge`
- `AviationWingsBadge`
- `SpecialOpsBadge`
- `TacticalShieldBadge`
- `CamoBadge`
- `WWIIBadge`

### Pages

#### **BadgesPage** (`BadgesPage.tsx`)
Dedicated full-page badges showcase:

```tsx
import BadgesPage from './pages/BadgesPage'

// Shows:
// - Badge collection progress (X/10)
// - All badges with unlock conditions
// - "Check for New Badges" button
// - How to earn badges guide
```

#### **Dashboard Integration**
Dashboard now displays badges in a horizontal row:

```tsx
<BadgeLibrary userBadges={userBadges} displayMode="row" size="md" />
```

### Styling

All components use **Tailwind CSS**:
- Responsive grid layouts
- Hover effects and transitions
- Dark/light theme support
- Mobile-optimized displays

---

## Backend Implementation

### Badge Service (`badge_service.py`)

Main service for badge management:

```python
from app.services.badge_service import BadgeService, BadgeType

# Initialize
badge_service = BadgeService(db)

# Check and award badges
newly_awarded = badge_service.check_and_award_badges(user_id)
# Returns: ['Infantry-Inspired Badge', 'Armor-Inspired Badge']

# Get user badges
badges = badge_service.get_user_badges(user_id)
# Returns: [
#   {
#     'name': 'Infantry-Inspired Badge',
#     'condition': 'Analyze 5+ claims total',
#     'type': 'military'
#   }
# ]

# Reset badges (testing)
badge_service.reset_badges(user_id)
```

### User Model Updates

User now includes badges field:

```python
class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True)
    full_name = Column(String)
    hashed_password = Column(String)
    badges = Column(Text, nullable=True)  # JSON-serialized list
    # ... other fields
```

Badges are stored as JSON array:
```json
["Infantry-Inspired Badge", "Armor-Inspired Badge", "Camo-Themed Badge"]
```

### Badge Unlock Logic

**Automatic Badge Award Triggers:**

1. **Infantry Badge** → 5+ claims analyzed
2. **Tactical Shield** → 10+ claims analyzed
3. **Armor Badge** → 50%+ max disability rating achieved
4. **Special Operations** → 70%+ max disability rating achieved
5. **HALO Wing** → 3+ airborne condition analyses
6. **Airborne Badge** → 3+ airborne-related conditions
7. **Aviation Badge** → 1+ aviation-related condition
8. **Artillery Badge** → 1+ artillery-related condition
9. **Camo Badge** → All 8 condition types analyzed
10. **WWII Badge** → Future: WWII veteran profile flag

### API Endpoints

#### `GET /api/badges/my-badges`
Get user's unlocked badges with metadata

**Request:**
```bash
curl -X GET http://localhost:8000/api/badges/my-badges \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**
```json
[
  {
    "name": "Infantry-Inspired Badge",
    "condition": "Analyze 5+ claims total",
    "type": "military"
  },
  {
    "name": "Armor-Inspired Badge",
    "condition": "Achieve 50%+ combined disability rating",
    "type": "military"
  }
]
```

#### `POST /api/badges/check`
Check for new badge eligibility and award

**Request:**
```bash
curl -X POST http://localhost:8000/api/badges/check \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**
```json
{
  "newly_awarded": ["Infantry-Inspired Badge"],
  "message": "Awarded 1 new badge(s)!"
}
```

### Integration with Claims

Badge check is **automatically triggered** after each claim analysis:

```python
# In claims_service.py analyze_claim()
@router.post("/claims/analyze")
async def analyze_claim(...):
    service = ClaimsService(db)
    result = service.analyze_claim(user_id, claim_data)

    # Automatically check for badges
    badge_service = BadgeService(db)
    badge_service.check_and_award_badges(user_id)

    return ClaimAnalysisResponse(**result)
```

---

## User Experience Flow

### 1. **Dashboard View**
- User lands on dashboard
- Sees 3-4 badge thumbnails in horizontal row
- Locked badges shown with 🔒 icon
- Clicking badge shows full details

### 2. **Analyze Claims**
- User fills claim form and analyzes
- Backend automatically checks badge eligibility
- If badge earned: notification popup
- User returns to dashboard

### 3. **Badges Page** (`/badges`)
- Full showcase of all 10 badges
- Progress bar: X/10 badges earned
- Statistics: badges earned, remaining, % complete
- Detailed unlock conditions for each
- "Check for New Badges" button for manual refresh

### 4. **Badge Details Modal**
- Clicking any badge opens detailed view
- Large badge SVG rendering
- Full name and description
- Unlock condition
- "Unlocked ✓" badge if earned
- How to earn if locked

---

## File Structure

```
frontend/src/
├── components/
│   └── MilitaryBadges/
│       ├── index.ts                  (exports)
│       ├── BadgeLibrary.tsx           (main component)
│       ├── HALOWingBadge.tsx          (badge #1)
│       ├── AirborneBadge.tsx          (badge #2)
│       ├── InfantryBadge.tsx          (badge #3)
│       ├── ArmorBadge.tsx             (badge #4)
│       ├── ArtilleryBadge.tsx         (badge #5)
│       ├── AviationWingsBadge.tsx     (badge #6)
│       ├── SpecialOpsBadge.tsx        (badge #7)
│       ├── TacticalShieldBadge.tsx    (badge #8)
│       ├── CamoBadge.tsx              (badge #9)
│       └── WWIIBadge.tsx              (badge #10)
└── pages/
    └── BadgesPage.tsx                 (badges showcase page)

backend/app/
├── services/
│   └── badge_service.py              (badge logic)
└── routers/
    └── badges.py                      (API endpoints)
```

---

## Customization Guide

### Adding New Badges

1. **Create SVG Component:**
```tsx
// MyCustomBadge.tsx
export const MyCustomBadge: React.FC<CustomBadgeProps> = ({ size = 'md' }) => {
  return (
    <svg viewBox="0 0 200 200" className={sizeMap[size]}>
      {/* SVG content */}
    </svg>
  )
}
```

2. **Add to BadgeLibrary:**
```tsx
const BADGES: BadgeInfo[] = [
  // ... existing badges
  {
    name: 'My Custom Badge',
    description: 'Description here',
    component: MyCustomBadge,
    unlockCondition: 'Some achievement'
  }
]
```

3. **Add Backend Logic:**
```python
# In badge_service.py
class BadgeType(str, Enum):
    MY_CUSTOM = "My Custom Badge"

# In _get_eligible_badges():
if some_condition:
    eligible.append(BadgeType.MY_CUSTOM)
```

### Modifying Unlock Conditions

Edit `badge_service.py`:
```python
BADGE_UNLOCK_CONDITIONS = {
    BadgeType.INFANTRY: "Analyze 10+ claims total",  # Changed from 5
    # ...
}
```

### Changing Display Styles

All styling uses Tailwind CSS classes in:
- `BadgeLibrary.tsx` - Grid/row/showcase layouts
- `BadgesPage.tsx` - Page styling
- Individual badge components - SVG styling

---

## Testing

### Manual Testing Checklist

- [ ] Badge display on dashboard
- [ ] Click badge opens details
- [ ] Locked badges show 🔒
- [ ] Analyze claims triggers badge check
- [ ] New badges show notification
- [ ] /badges page loads and displays all
- [ ] Progress bar updates
- [ ] Responsive on mobile
- [ ] API endpoints return correct data

### API Testing with Curl

```bash
# Get badges
curl -X GET http://localhost:8000/api/badges/my-badges \
  -H "Authorization: Bearer <TOKEN>"

# Check for new badges
curl -X POST http://localhost:8000/api/badges/check \
  -H "Authorization: Bearer <TOKEN>"

# Analyze claim (triggers badge check)
curl -X POST http://localhost:8000/api/claims/analyze \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{...claim data...}'
```

---

## Future Enhancements

1. **Badge Rarity Tiers**: Common, Uncommon, Rare, Epic
2. **Badge Evolution**: Badges change appearance as you progress
3. **Badge Descriptions**: Personalized messages for earned badges
4. **Social Sharing**: Share badge achievements
5. **Leaderboards**: Compare badge progress with other veterans
6. **Custom Badge Creation**: Upload your own badge designs
7. **Badge Trading**: Exchange duplicate badges
8. **Animated Transitions**: Celebration animations when earning
9. **Badge Gallery**: High-quality renders for printing
10. **Integration**: Link to VA awards/recognitions

---

## Technical Notes

### SVG Implementation
- All badges use pure SVG (no images)
- Responsive scaling via viewBox
- Gradients and filters for visual depth
- Animatable for future enhancements

### Performance
- Lazy loading of badge components
- No external API calls for rendering
- Client-side caching of badge state
- Minimal re-renders with React.memo potential

### Accessibility
- Alt text for locked badges (🔒)
- Keyboard navigation support
- High contrast colors
- Semantic HTML structure

---

## Support & Documentation

- **API Docs**: http://localhost:8000/docs
- **Badge Page**: http://localhost:5173/badges
- **Dashboard**: http://localhost:5173/dashboard

For issues or enhancements, refer to the main QUICK-START.md and API documentation.

---

**Badge System Created**: January 23, 2026
**Status**: Fully Operational & Extensible
**Version**: 1.0.0
