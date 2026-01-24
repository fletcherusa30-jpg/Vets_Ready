# Outreach & Community Discovery System - Documentation

## Overview

The Outreach & Community Discovery System is a comprehensive module designed to help veterans discover, connect with, and contribute to veteran-focused communities, businesses, and organizations. It combines keyword-based discovery with community-curated directories.

## Features

### 1. **Public Page Discovery**
- Search and discover veteran-related Facebook groups, Instagram pages, LinkedIn groups, and Twitter accounts
- Confidence scoring for relevance assessment
- Filter by platform, category, and follower count
- Trending pages discovery

**Sample Categories:**
- VSO (Veteran Service Organizations)
- Support Groups
- Veteran Businesses
- Military Communities
- Benefits Information
- Job Resources

### 2. **Veteran-Owned Businesses Directory**
- Searchable directory of veteran-owned businesses
- Filter by industry, location, and certifications
- Contact information and website links
- Service branch and business certifications visible

**Sample Industries:**
- Tactical Gear & Equipment
- Consulting Services
- Construction & Trades
- Technology
- Fitness & Wellness

### 3. **Veteran Nonprofits Directory**
- Comprehensive list of veteran-focused nonprofits
- EIN verification for legitimacy
- Mission area filtering
- Donation and engagement links

**Sample Organizations:**
- Team Rubicon (disaster relief)
- The Mission Continues (purpose and service)
- Wounded Warrior Project (support services)
- Veteran Care Network (healthcare)

### 4. **Keyword Discovery Engine**
- Automatic detection of 30+ veteran-related keywords
- Confidence scoring for relevance
- Category classification
- Real-time text scanning

**Keywords Mapped:**
```
Confidence 0.95: "veteran", "VSO", "VA benefits"
Confidence 0.90: "VA", "GI bill", "Marine Corps"
Confidence 0.85: "military", "PTSD support", "veteran business"
...and 20+ more
```

### 5. **User Bookmarking System**
- Save favorite pages, businesses, and nonprofits
- Quick access to bookmarked resources
- Personal collection management

### 6. **Community Page Submissions**
- Users can submit new pages for community review
- Moderation queue for spam prevention
- Platform-specific submission (Facebook, Instagram, LinkedIn, Twitter, Other)
- Description and categorization required

### 7. **Moderation & Compliance**
- Two-tier approval system
- Moderator review queue
- Notes and tracking
- Prevents spam and irrelevant submissions

## API Endpoints

### Public Pages
```
GET /api/outreach/pages?keyword=&category=&minFollowers=
- Search pages with filters
- Returns: { success, data: { curated, community, total } }

GET /api/outreach/pages/category/:category
- Get all pages in specific category
- Returns: { success, data: PublicPage[] }

GET /api/outreach/pages/trending
- Get top 10 trending pages
- Returns: { success, data: PublicPage[] }

POST /api/outreach/submissions
- Submit a new page (requires: submittedBy, platform, pageName, pageUrl, category, description)
- Returns: { success, data: PageSubmission }
```

### Businesses
```
GET /api/outreach/businesses?keyword=&category=&location=
- Search veteran-owned businesses
- Returns: { success, data: VeteranBusiness[] }
```

### Nonprofits
```
GET /api/outreach/nonprofits?keyword=&mission=
- Search veteran nonprofits
- Returns: { success, data: VeteranNonprofit[] }
```

### Utilities
```
POST /api/outreach/scan-keywords
- Scan text for veteran keywords
- Body: { text: string }
- Returns: { success, data: { keywords: string[], categories: string[], confidence: number } }

GET /api/outreach/stats
- Get directory statistics
- Returns: { success, data: { totalPages, totalBusinesses, totalNonprofits, submissions } }
```

## Frontend Integration

### React Query Hooks

```typescript
// Search pages
const { data, isLoading } = useOutreachSearch({
  keyword: "support",
  category: "support-group"
})

// Get trending pages
const { data: trending } = useTrendingPages()

// Search businesses
const { data: businesses } = useBusinessSearch({
  keyword: "consulting",
  location: "DC"
})

// Search nonprofits
const { data: nonprofits } = useNonprofitSearch({
  mission: "support"
})

// Submit a page
const { mutate: submitPage, isPending } = useSubmitPage()

// Scan keywords
const { mutate: scanKeywords } = useKeywordScan()

// Manage bookmarks
const { addBookmark, removeBookmark } = useBookmarkOperations(userId)
const { data: bookmarks } = useUserBookmarks(userId)
```

### React Components

#### PageFinder
Main search interface for discovering public pages.

```typescript
<PageFinder
  onBookmark={handleBookmark}
  userId={currentUserId}
/>
```

#### BusinessDirectory
Searchable directory of veteran-owned businesses.

```typescript
<BusinessDirectory
  onSelect={handleBusinessSelect}
/>
```

#### NonprofitDirectory
Nonprofit mission browser and search.

```typescript
<NonprofitDirectory
  onSelect={handleNonprofitSelect}
/>
```

#### SubmitPageForm
Community page submission interface.

```typescript
<SubmitPageForm
  userId={currentUserId}
  onSuccess={handleSubmissionSuccess}
/>
```

## Database Schema

### Core Tables

#### public_pages
```sql
- id (UUID, PK)
- name (VARCHAR)
- platform (VARCHAR) -- facebook, instagram, linkedin, twitter, etc.
- url (VARCHAR, unique)
- category (VARCHAR)
- description (TEXT)
- followers_count (INT)
- confidence_score (DECIMAL)
- status (VARCHAR) -- active, inactive, archived
- last_checked (TIMESTAMP)
- created_at, updated_at (TIMESTAMP)
```

#### page_submissions
```sql
- id (UUID, PK)
- submitted_by (UUID, FK -> users)
- platform (VARCHAR)
- page_name (VARCHAR)
- page_url (VARCHAR)
- category (VARCHAR)
- description (TEXT)
- status (VARCHAR) -- pending, approved, rejected
- moderator_notes (TEXT)
- reviewed_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

#### veteran_businesses
```sql
- id (UUID, PK)
- name (VARCHAR)
- description (TEXT)
- industry (VARCHAR)
- location (VARCHAR)
- website (VARCHAR)
- phone (VARCHAR)
- email (VARCHAR)
- veteran_owner_name (VARCHAR)
- service_branch (VARCHAR)
- certifications (TEXT[])
- created_at, updated_at (TIMESTAMP)
```

#### veteran_nonprofits
```sql
- id (UUID, PK)
- name (VARCHAR)
- description (TEXT)
- mission (TEXT)
- ein (VARCHAR, unique)
- website (VARCHAR)
- phone (VARCHAR)
- email (VARCHAR)
- headquarters_location (VARCHAR)
- mission_areas (TEXT[]) -- support, employment, education, etc.
- donation_url (VARCHAR)
- created_at, updated_at (TIMESTAMP)
```

#### user_bookmarks
```sql
- id (UUID, PK)
- user_id (UUID, FK -> users)
- page_id (UUID, FK -> public_pages)
- business_id (UUID, FK -> veteran_businesses)
- nonprofit_id (UUID, FK -> veteran_nonprofits)
- created_at (TIMESTAMP)
-- Constraint: exactly one of page/business/nonprofit must be set
```

#### moderation_queue
```sql
- id (UUID, PK)
- submission_id (UUID, FK -> page_submissions)
- submission_type (VARCHAR)
- priority (INT)
- assigned_to (UUID, FK -> users)
- status (VARCHAR) -- pending, approved, rejected
- created_at (TIMESTAMP)
- due_date (TIMESTAMP)
```

## Social Media Compliance

### Facebook Integration
- ✅ Does NOT require graph API for discovery
- Curated list of established pages
- User can submit with URL for verification
- Community vetting system

### Instagram Integration
- ✅ Profile discovery via public accounts
- Public business information only
- User submissions processed through moderation

### LinkedIn Integration
- ✅ Public group discovery
- Company profiles for veteran businesses
- No personal data collection beyond public profiles

### Twitter/X Integration
- ✅ Public account following recommended
- Hashtag communities tracked
- Open verification system

### Compliance Features
- No personal DMs or private messages
- No friend/follower scraping
- No automated account creation
- User consent for bookmarking only
- Transparent moderation policies
- GDPR/CCPA compliant

## Keyword Engine

### Configuration
Located in `/src/outreach/utils/keywordEngine.ts`

```typescript
KEYWORD_MAPPINGS = {
  "veteran": { category: "veteran-resource", confidence: 0.95 },
  "VA": { category: "va-resource", confidence: 0.90 },
  "VSO": { category: "veteran-service-org", confidence: 0.95 },
  "PTSD support": { category: "support-group", confidence: 0.85 },
  // ... 26+ more mappings
}
```

### Usage
```typescript
import { scanForVeteranKeywords } from "@/outreach/utils/keywordEngine"

const result = scanForVeteranKeywords(textContent)
// Returns: { keywords, categories, confidence, matches }
```

## Sample Data

### Curated Public Pages (Built-in)
1. American Legion (250K followers) - VSO
2. Veterans of Foreign Wars (180K) - VSO
3. Disabled American Veterans (120K) - VSO
4. Army Vet Network (45K) - Military Community

### Veteran Businesses (Built-in)
1. Veteran's Tactical Gear - Denver
2. Veteran Consulting Group - Washington DC
3. Operation Trades - Austin

### Veteran Nonprofits (Built-in)
1. Team Rubicon (27-3278407) - Disaster Relief
2. The Mission Continues - Purpose & Service
3. Wounded Warrior Project - Support Services
4. Veteran Care Network - Healthcare

## Implementation Roadmap

### Phase 1: ✅ Complete
- Keyword engine with 30+ mappings
- Page discovery service with sample data
- Business/nonprofit directories
- React components for search/display
- Zustand state management
- Zod validation schemas

### Phase 2: ✅ Complete
- Backend controllers and routes
- Database schema with indexes
- React Query hooks for API integration
- Moderation system structure

### Phase 3: Pending
- Social media API integrations (OAuth2)
- Automated page crawling (respect robots.txt)
- User activity analytics
- Export/sharing features
- Real-time notifications
- Advanced filtering UI

### Phase 4: Future
- AI-powered recommendation engine
- Community reputation scoring
- Veteran story interviews
- Resource helpfulness voting
- Mobile app optimization

## Performance Considerations

### Indexes
- `idx_public_pages_followers` - Sorting by popularity
- `idx_public_pages_category` - Category filtering
- `idx_veteran_businesses_location` - Location search
- `idx_veteran_nonprofits_mission` - Mission area filtering
- `idx_user_bookmarks_user` - User bookmark retrieval

### Query Optimization
- Pagination implemented (default 20 items)
- Caching with React Query (5 min stale time for stats)
- Lazy loading for large result sets
- Database connection pooling

### Scalability
- Supports up to 10,000+ pages/businesses/nonprofits
- Bookmark system handles millions of user preferences
- Moderation queue designed for high-volume submissions

## Security & Privacy

- ✅ No personal data collection beyond user ID
- ✅ Page submissions vetted by moderators
- ✅ GDPR/CCPA compliant
- ✅ Rate limiting on API endpoints (recommended)
- ✅ Input validation via Zod schemas
- ✅ SQL injection prevention via parameterized queries
- ✅ CORS enabled for frontend communication

## Testing Strategy

### Unit Tests
- Keyword scanning accuracy
- Match scoring algorithms
- Filter logic

### Integration Tests
- API endpoint response formats
- Database CRUD operations
- Moderation workflow

### E2E Tests
- Full page discovery flow
- Bookmark management
- Page submission to approval

## Troubleshooting

### Common Issues

**Q: Pages not appearing in search?**
A: Check `status = 'active'` in database. Ensure keyword matches or category is correctly set.

**Q: Bookmarks not persisting?**
A: Verify user_id is present. Check React Query cache invalidation.

**Q: Slow search performance?**
A: Ensure indexes are created. Check follower count filtering isn't forcing full table scan.

## Future Enhancements

1. **AI-Powered Recommendations**
   - Machine learning model for page recommendations
   - Personalized business discovery

2. **Social Integration**
   - One-click social sharing of resources
   - Social widget embeds

3. **Veteran Stories**
   - User testimonials and reviews
   - Impact metrics from nonprofits

4. **Mobile App**
   - Native iOS/Android apps
   - Offline bookmarking

5. **Analytics**
   - Resource popularity trends
   - User engagement metrics
   - Geographic distribution maps
