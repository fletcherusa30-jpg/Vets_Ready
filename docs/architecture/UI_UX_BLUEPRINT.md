# rallyforge UI/UX Blueprint

**Last Updated:** January 25, 2026
**Purpose:** Design system, layout patterns, and accessibility standards for all rallyforge components.

---

## Table of Contents

1. [Global Layout System](#global-layout-system)
2. [Theme System](#theme-system)
3. [Card-Based Design System](#card-based-design-system)
4. [Form Patterns](#form-patterns)
5. [Navigation Patterns](#navigation-patterns)
6. [Data Display Patterns](#data-display-patterns)
7. [Interactive Elements](#interactive-elements)
8. [Responsive Breakpoints](#responsive-breakpoints)
9. [Accessibility Standards](#accessibility-standards)
10. [UI Requirements Per Tool](#ui-requirements-per-tool)

---

## Global Layout System

### Header

**Component:** `src/components/Layout/Header.tsx` ✅ Implemented

**Contents:**
- Logo (left)
- Theme toggle (☀️ Light / 🌙 Dark / 🔆 High-Contrast)
- Profile menu (right)
- Notifications icon (right)

**Behavior:**
- Sticky top
- 64px height
- Collapses profile menu to icon on mobile

---

### Sidebar

**Component:** `src/components/Layout/Sidebar.tsx` ✅ Implemented

**Contents:**
- 9 dashboard views:
  1. Overview
  2. Benefits
  3. Claims & Appeals
  4. Retirement/CRSC
  5. Housing
  6. Employment
  7. Education
  8. Documents
  9. Settings

**Behavior:**
- 260px width (desktop)
- 80px width (tablet, icons only)
- Hidden (mobile, hamburger menu)
- Active route highlighted with branch accent color

---

### ContentShell

**Component:** `src/components/Layout/ContentShell.tsx` ✅ Implemented

**Configurable Widths:**
- `narrow`: 800px max-width (forms, wizards)
- `medium`: 1200px max-width (dashboards, lists)
- `wide`: 1600px max-width (matrices, tables)
- `full`: 100% width (maps, timelines)

**Configurable Padding:**
- `none`: 0 padding
- `small`: 1rem padding
- `medium`: 2rem padding (default)
- `large`: 3rem padding

---

### Footer

**Component:** `src/components/Layout/Footer.tsx` ✅ Implemented

**Contents:**
- Legal disclaimer
- Privacy policy link
- Terms of service link
- Accessibility statement
- VA.gov link
- Veterans Crisis Line: 988 then 1

**Behavior:**
- 3-column layout (desktop)
- Stacked layout (mobile)
- Always at bottom of page

---

### AppLayout

**Component:** `src/components/Layout/AppLayout.tsx` ✅ Implemented

**Structure:**
```
<AppLayout>
  <Header />
  <div className="main-container">
    <Sidebar /> (if showSidebar=true)
    <ContentShell>
      {children}
    </ContentShell>
  </div>
  <Footer />
</AppLayout>
```

---

## Theme System

**Component:** `src/contexts/ThemeContext.tsx` ✅ Implemented

### Light Mode

- Background: White (#FFFFFF)
- Text: Dark gray (#1F2937)
- Borders: Light gray (#E5E7EB)
- Cards: White with subtle shadow
- Hover: Light gray (#F9FAFB)

### Dark Mode

- Background: Charcoal (#1F2937)
- Text: Light gray (#F9FAFB)
- Borders: Dark gray (#374151)
- Cards: Dark gray (#374151) with subtle shadow
- Hover: Lighter dark gray (#4B5563)
- Accents: Branch-specific colors

### High-Contrast Mode

- Background: Black (#000000)
- Text: White (#FFFFFF)
- Borders: Yellow (#FBBF24) or Blue (#3B82F6)
- Cards: Black with thick yellow/blue border
- Hover: Dark gray (#1F2937)
- Links: Bright yellow (#FBBF24)

### Branch Accents

| Branch | Primary Color | Usage |
|--------|---------------|-------|
| Army | Olive Green (#4B5320) | Active tabs, primary buttons |
| Navy | Navy Gold (#B8860B) | Active tabs, primary buttons |
| Air Force | Steel Blue (#4682B4) | Active tabs, primary buttons |
| Marines | Crimson (#DC143C) | Active tabs, primary buttons |
| Coast Guard | Blue & Orange (#0055A4, #FF6600) | Active tabs, primary buttons |
| Space Force | Black & Silver (#000000, #C0C0C0) | Active tabs, primary buttons |
| National Guard | Red & Blue (#B22234, #3C3B6E) | Active tabs, primary buttons |

**Usage:**
- Active sidebar items
- Primary action buttons
- Progress indicators
- Focus rings

---

## Card-Based Design System

All data displays use cards with consistent structure:

### Benefit Card

```tsx
<BenefitCard>
  <CardHeader>
    <Icon /> {/* Federal/State/Local icon */}
    <Title>Benefit Name</Title>
    <EligibilityBadge /> {/* Eligible / Maybe / Not Eligible */}
  </CardHeader>
  <CardBody>
    <Description>Plain-language description</Description>
    <KeyDetails>
      <DetailRow label="Benefit Type" value="..." />
      <DetailRow label="Provider" value="..." />
    </KeyDetails>
  </CardBody>
  <CardFooter>
    <ActionButton>Learn More</ActionButton>
  </CardFooter>
</BenefitCard>
```

**Variants:**
- Federal Benefit Card (blue accent)
- State Benefit Card (green accent)
- Local Benefit Card (orange accent)

---

### Job Card

```tsx
<JobCard>
  <CardHeader>
    <Title>Job Title</Title>
    <MatchScore>85% Match</MatchScore>
  </CardHeader>
  <CardBody>
    <CompanyName>Company Name</CompanyName>
    <Location>City, State</Location>
    <Salary>$70,000 - $90,000</Salary>
    <Skills>
      <SkillBadge match="direct">Skill 1</SkillBadge>
      <SkillBadge match="transferable">Skill 2</SkillBadge>
    </Skills>
  </CardBody>
  <CardFooter>
    <ActionButton>View Job</ActionButton>
    <SecondaryButton>Save</SecondaryButton>
  </CardFooter>
</JobCard>
```

---

### Organization Card

```tsx
<OrganizationCard>
  <CardHeader>
    <Logo />
    <Title>Organization Name</Title>
  </CardHeader>
  <CardBody>
    <Description>Mission and services</Description>
    <Location>City, State (X miles away)</Location>
    <Services>
      <ServiceBadge>Employment</ServiceBadge>
      <ServiceBadge>Housing</ServiceBadge>
    </Services>
  </CardBody>
  <CardFooter>
    <ActionButton>Visit Website</ActionButton>
    <SecondaryButton>Get Directions</SecondaryButton>
  </CardFooter>
</OrganizationCard>
```

---

### Document Card

```tsx
<DocumentCard>
  <CardHeader>
    <Icon type="DD214 | RatingDecision | Evidence" />
    <Title>Document Name</Title>
    <DateBadge>Uploaded: 01/15/2026</DateBadge>
  </CardHeader>
  <CardBody>
    <Tags>
      <Tag>Claim #123</Tag>
      <Tag>Tinnitus</Tag>
    </Tags>
    <Preview>
      {/* Thumbnail or first page preview */}
    </Preview>
  </CardBody>
  <CardFooter>
    <ActionButton>View</ActionButton>
    <SecondaryButton>Download</SecondaryButton>
  </CardFooter>
</DocumentCard>
```

---

## Form Patterns

### Filter Panel

Used in: Benefits Matrix, Employment Hub, Education Hub, Local Resources

```tsx
<FilterPanel>
  <FilterGroup label="Category">
    <Checkbox value="federal">Federal Benefits</Checkbox>
    <Checkbox value="state">State Benefits</Checkbox>
    <Checkbox value="local">Local Benefits</Checkbox>
  </FilterGroup>
  <FilterGroup label="Eligibility">
    <Radio value="eligible">Eligible Only</Radio>
    <Radio value="maybe">Maybe Eligible</Radio>
    <Radio value="all">Show All</Radio>
  </FilterGroup>
  <FilterActions>
    <ApplyButton>Apply Filters</ApplyButton>
    <ClearButton>Clear All</ClearButton>
  </FilterActions>
</FilterPanel>
```

**Behavior:**
- Sticky left sidebar (desktop)
- Collapsible accordion (tablet)
- Bottom sheet (mobile)

---

### Search Bar

Used in: Employment Hub, Education Hub, Local Resources

```tsx
<SearchBar>
  <Icon>🔍</Icon>
  <Input
    placeholder="Search jobs, programs, organizations..."
    aria-label="Search"
  />
  <ClearButton aria-label="Clear search" />
</SearchBar>
```

**Behavior:**
- Debounced search (300ms)
- Shows results count
- Highlights matching terms

---

### Multi-Select

Used in: Wizard, Employment Hub, Evidence Builder

```tsx
<MultiSelect label="Select Conditions">
  <Option value="tinnitus">Tinnitus</Option>
  <Option value="kneeInjury">Knee Injury</Option>
  <Option value="ptsd">PTSD</Option>
</MultiSelect>
```

**Features:**
- Search within options
- Select all / Deselect all
- Chip display of selected items

---

## Navigation Patterns

### Tabs

Used in: Dashboard, Matrix, Profile

```tsx
<Tabs>
  <Tab active>Overview</Tab>
  <Tab>Benefits</Tab>
  <Tab>Claims</Tab>
</Tabs>
```

**Behavior:**
- Horizontal scroll on mobile
- Active tab highlighted with branch accent
- Keyboard navigable (arrow keys)

---

### Breadcrumbs

Used in: All pages except Home

```tsx
<Breadcrumbs>
  <Crumb href="/">Home</Crumb>
  <Crumb href="/dashboard">Dashboard</Crumb>
  <Crumb active>Benefits</Crumb>
</Breadcrumbs>
```

---

### Step Indicators

Used in: Wizard, Evidence Builder

```tsx
<StepIndicator>
  <Step number={1} status="complete">Veteran Basics</Step>
  <Step number={2} status="active">Disabilities</Step>
  <Step number={3} status="pending">Retirement/CRSC</Step>
</StepIndicator>
```

**Component:** `src/components/wizard/WizardLayout.tsx` ✅ Implemented

---

## Data Display Patterns

### Table

Used in: Dashboard (Claims list, Appeals list)

```tsx
<Table>
  <TableHeader>
    <Column sortable>Claim ID</Column>
    <Column sortable>Status</Column>
    <Column>Filed Date</Column>
  </TableHeader>
  <TableBody>
    <Row>
      <Cell>123456</Cell>
      <Cell><StatusBadge>Pending</StatusBadge></Cell>
      <Cell>01/15/2026</Cell>
    </Row>
  </TableBody>
</Table>
```

**Behavior:**
- Responsive (stacks on mobile)
- Sortable columns
- Pagination for >10 rows

---

### List

Used in: Recommendations, Missing Information, Opportunities

```tsx
<List>
  <ListItem>
    <Icon>⚠️</Icon>
    <Content>
      <Title>Missing DD214</Title>
      <Description>Upload your DD214 to unlock federal benefits</Description>
    </Content>
    <Action>Upload</Action>
  </ListItem>
</List>
```

---

### Timeline

Used in: Life Map, Appeals history

```tsx
<Timeline orientation="horizontal">
  <TimelineEvent date="2020-01-15" type="service">
    <Title>Enlisted</Title>
    <Description>Army, Fort Bragg</Description>
  </TimelineEvent>
  <TimelineEvent date="2023-06-30" type="discharge">
    <Title>Honorable Discharge</Title>
  </TimelineEvent>
</Timeline>
```

**Behavior:**
- Horizontal scroll (desktop)
- Vertical scroll (mobile)
- Color-coded by event type

---

## Interactive Elements

### Tooltip

```tsx
<Tooltip content="Eligibility: 10% rating or higher">
  <InfoIcon />
</Tooltip>
```

**Behavior:**
- Show on hover (desktop)
- Show on tap (mobile)
- Keyboard accessible (focus)

---

### Modal

```tsx
<Modal title="Resume Builder" size="large">
  <ModalContent>
    {/* Form or content */}
  </ModalContent>
  <ModalFooter>
    <CancelButton>Cancel</CancelButton>
    <SaveButton>Save</SaveButton>
  </ModalFooter>
</Modal>
```

**Behavior:**
- Focus trap (keyboard navigation stays within modal)
- Esc to close
- Click outside to close (optional)

---

### Dropdown

```tsx
<Dropdown label="Branch of Service">
  <Option value="army">Army</Option>
  <Option value="navy">Navy</Option>
  <Option value="airForce">Air Force</Option>
</Dropdown>
```

**Behavior:**
- Keyboard navigable (arrow keys)
- Type-ahead search
- ARIA compliant

---

## Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 768px | Sidebar hidden, cards stack, tables collapse |
| Tablet | 768px - 1024px | Sidebar icons only (80px), 2-column card grid |
| Desktop | 1024px - 1440px | Full sidebar (260px), 3-column card grid |
| Wide | > 1440px | Full sidebar (260px), 4-column card grid |

---

## Accessibility Standards

rallyforge must meet **WCAG 2.1 AA** standards at minimum.

### Keyboard Navigation

- All interactive elements focusable via Tab
- Focus visible (2px solid outline in branch accent color)
- Skip links to main content
- Arrow keys for tabs, dropdowns, sliders
- Esc to close modals, dropdowns, tooltips

### Screen Reader Support

- All images have `alt` text
- All icons have `aria-label`
- All form fields have associated `<label>`
- ARIA landmarks (`<main>`, `<nav>`, `<aside>`)
- ARIA live regions for dynamic content
- Meaningful page titles

### Color Contrast

| Element | Ratio | Requirement |
|---------|-------|-------------|
| Body text | 4.5:1 | AA |
| Large text (18px+) | 3:1 | AA |
| UI components | 3:1 | AA |
| High-contrast mode | 7:1 | AAA |

### Interactive Element Sizing

- Minimum tap target: 44px × 44px
- Minimum spacing between targets: 8px

### Motion & Animation

- Reduced motion support (`prefers-reduced-motion`)
- No auto-playing videos
- No flashing content (seizure risk)

---

## UI Requirements Per Tool

### 1. Digital Twin Dashboard

**Route:** `/dashboard?tab=overview`

**Layout:**
- AppLayout with Sidebar
- ContentShell width="wide"

**Components:**
- Hero card (veteran name, photo, status summary)
- Tabs: Benefits, Employment, Education, Housing, Family, Local
- Auto-updating indicators (last updated timestamp)

**Design:**
- Card-based layout
- Branch accent for active tab
- Progress rings for completeness scores

---

### 2. Life Map

**Route:** `/lifemap`

**Layout:**
- AppLayout without Sidebar
- ContentShell width="full"

**Components:**
- Horizontal timeline (zoomable)
- Color-coded events:
  - Service: Blue
  - Injuries: Red
  - Ratings: Green
  - Appeals: Orange
  - Employment: Purple
  - Education: Teal
  - Housing: Brown
- Expandable event cards on click

**Design:**
- Timeline centered vertically
- Events above/below timeline alternating
- Mobile: Vertical timeline

---

### 3. Digital Wallet

**Route:** `/wallet`

**Layout:**
- AppLayout with Sidebar
- ContentShell width="wide"

**Components:**
- Document grid (4 columns desktop, 2 tablet, 1 mobile)
- Tags and filters panel (left sidebar)
- Auto-extracted metadata display
- Packet builder modal

**Design:**
- Document cards with thumbnails
- Color-coded tags
- Drag-and-drop to packet builder

---

### 4. Opportunity Radar

**Route:** `/opportunities`

**Layout:**
- AppLayout with Sidebar
- ContentShell width="medium"

**Components:**
- Hero section: "Your Top 5 Opportunities This Week"
- Opportunity cards (expandable)
- "Why this applies to you" section per card
- Category filters (Benefits, Jobs, Education, Housing, Local, Events)

**Design:**
- Numbered cards (1-5)
- Branch accent for card borders
- Expandable details

---

### 5. Employment Hub

**Route:** `/employment`

**Layout:**
- AppLayout with Sidebar
- ContentShell width="wide"

**Components:**
- MOS translator card (top)
- Job match list (left)
- Resume builder modal (triggered by button)
- Employer search panel (right)
- Skills gap planner (expandable)

**Design:**
- 2-column layout (jobs left, details right)
- Match percentage badges
- Skill badges (direct match vs transferable)

---

### 6. Education Hub

**Route:** `/education`

**Layout:**
- AppLayout with Sidebar
- ContentShell width="wide"

**Components:**
- GI Bill program cards (grid)
- Apprenticeship finder (search + results)
- License/cert crosswalk (table)
- BAH estimator (calculator card)

**Design:**
- Program cards with eligibility badges
- Filters: program type, location, duration
- Interactive BAH calculator

---

### 7. Local Resources Hub

**Route:** `/local`

**Layout:**
- AppLayout with Sidebar
- ContentShell width="full"

**Components:**
- Map view (left, 60% width)
- List view (right, 40% width)
- Filters: Orgs, VSOs, Attorneys, Events
- Distance sorting

**Design:**
- Map markers color-coded by type
- List items with distance, phone, website
- Mobile: Tabs for Map/List

---

### 8. Evidence Builder

**Route:** Integrated into Claims Assistant, Appeals view

**Layout:**
- Modal (large)

**Components:**
- Guided prompts (step-by-step)
- Auto-formatting preview (right panel)
- Export options (Download PDF, Save to Wallet)

**Design:**
- 2-column layout (form left, preview right)
- Real-time preview update
- Template selector dropdown

---

### 9. Family Hub

**Route:** `/family`

**Layout:**
- AppLayout with Sidebar
- ContentShell width="medium"

**Components:**
- CHAMPVA card (eligibility + learn more)
- DEA card (eligibility + learn more)
- Caregiver program card (eligibility + learn more)
- Survivor benefits card (overview only)
- Transition resources section

**Design:**
- 2-column card grid (desktop)
- Eligibility hints as badges
- Plain-language descriptions

---

### 10. Expiration Tracker

**Route:** Integrated into Dashboard, Opportunity Radar

**Layout:**
- Dashboard widget (sidebar)

**Components:**
- Calendar view (mini)
- Upcoming deadlines list
- Alerts for <30 days

**Design:**
- Red/yellow/green color coding
- Days remaining badges
- Expandable to full calendar view

---

**End of UI/UX Blueprint**

