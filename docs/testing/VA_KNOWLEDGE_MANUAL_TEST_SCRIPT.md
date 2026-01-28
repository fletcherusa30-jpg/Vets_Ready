# VA Knowledge Center - Manual Testing Script
## Comprehensive User Experience Validation

**Test Date:** January 26, 2026
**Tester:** _________________
**Environment:** http://localhost:5173/va-knowledge

---

## Pre-Test Checklist
- [ ] Frontend server running (port 5173)
- [ ] Backend server running (port 8000)
- [ ] Browser: Chrome/Edge/Firefox (latest)
- [ ] Clear browser cache
- [ ] Screen resolution: 1920x1080 or higher

---

## SECTION 1: INITIAL LOAD & NAVIGATION (5 min)

### Test 1.1: Page Load
**Steps:**
1. Navigate to http://localhost:5173/va-knowledge
2. Observe page load time

**Expected Results:**
- [ ] Page loads within 2 seconds
- [ ] Hero section displays "VA Knowledge Center"
- [ ] Army branch theme visible (gold accent colors)
- [ ] Two tab buttons visible: "VA Resources" and "AI Search"
- [ ] AI Search tab is active (highlighted)

**Actual Results:**
```
Load Time: _____ seconds
Issues: ___________________________
```

### Test 1.2: Tab Switching
**Steps:**
1. Click "VA Resources" tab
2. Click "AI Search" tab
3. Repeat 3 times

**Expected Results:**
- [ ] Instant tab switching (no lag)
- [ ] Active tab highlighted with shadow
- [ ] Content changes appropriately
- [ ] No visual glitches

**Actual Results:**
```
Performance: ☐ Excellent  ☐ Good  ☐ Fair  ☐ Poor
Issues: ___________________________
```

---

## SECTION 2: VA RESOURCES TAB (10 min)

### Test 2.1: Resource Display
**Steps:**
1. Click "VA Resources" tab
2. Scroll through all resources
3. Count resource cards

**Expected Results:**
- [ ] Exactly 12 resource cards displayed
- [ ] All cards have icons, titles, descriptions
- [ ] External link indicators visible
- [ ] Cards arranged in 3-column grid (desktop)

**Actual Results:**
```
Cards Counted: _____ / 12
Layout: ☐ Correct  ☐ Issues: ___________
```

### Test 2.2: Category Filtering
**Steps:**
1. Click "M21-1 Manual" category button
2. Count visible resources
3. Click "Regulations" category
4. Count visible resources
5. Click "All Resources"

**Expected Results:**
- [ ] M21-1 Manual: Shows 3 resources
- [ ] Regulations: Shows 2 resources
- [ ] All Resources: Shows 12 resources
- [ ] Smooth filtering animation
- [ ] Active category button highlighted

**Actual Results:**
```
M21-1 Manual: _____ resources
Regulations: _____ resources
All Resources: _____ resources
Issues: ___________________________
```

### Test 2.3: External Links
**Steps:**
1. Right-click on "M21-1 Adjudication Procedures Manual"
2. Check "Opens in new tab"
3. Test 2-3 more resource links

**Expected Results:**
- [ ] All links have target="_blank"
- [ ] Links point to valid VA.gov or official URLs
- [ ] Hover effect visible on cards

**Actual Results:**
```
Links Working: ☐ Yes  ☐ No
URLs Valid: ☐ Yes  ☐ No
Issues: ___________________________
```

---

## SECTION 3: AI SEARCH INTERFACE (10 min)

### Test 3.1: Search Input
**Steps:**
1. Click "AI Search" tab
2. Observe search input field
3. Click inside input field
4. Type "test"
5. Clear input

**Expected Results:**
- [ ] Placeholder text visible
- [ ] Input accepts text smoothly
- [ ] "Ask AI" button disabled when empty
- [ ] "Ask AI" button enabled when text present
- [ ] Focus ring visible when focused

**Actual Results:**
```
Input Responsive: ☐ Yes  ☐ No
Button States: ☐ Correct  ☐ Issues: _______
```

### Test 3.2: Suggested Questions
**Steps:**
1. Count suggested question buttons
2. Click "How is VA disability rating calculated?"
3. Observe search input field

**Expected Results:**
- [ ] 8 suggested questions displayed
- [ ] Clicking suggestion populates search field
- [ ] Search field contains exact question text
- [ ] "Ask AI" button becomes enabled

**Actual Results:**
```
Suggested Questions: _____ / 8
Population Works: ☐ Yes  ☐ No
Issues: ___________________________
```

### Test 3.3: Knowledge Base Banner
**Steps:**
1. Locate green informational banner
2. Read content

**Expected Results:**
- [ ] Banner visible below search input
- [ ] Mentions "38 CFR Parts 3 & 4"
- [ ] Mentions "M21-1 Adjudication Manual"
- [ ] Mentions "VA Policy Letters"
- [ ] Checkmark icon visible

**Actual Results:**
```
Banner Visible: ☐ Yes  ☐ No
Content Complete: ☐ Yes  ☐ No
```

---

## SECTION 4: AI RESPONSES - PRESUMPTIVE CONDITIONS (15 min)

### Test 4.1: Presumptive Conditions Query
**Steps:**
1. Type "what conditions are presumptive"
2. Click "Ask AI"
3. Wait for response
4. Read full response

**Expected Results:**
- [ ] Loading indicator appears immediately
- [ ] Response arrives within 2 seconds
- [ ] Response contains "VA Presumptive Conditions - Complete List"
- [ ] 10 major categories listed
- [ ] Agent Orange conditions listed (16 conditions)
- [ ] Gulf War conditions listed
- [ ] Burn Pit/PACT Act conditions listed
- [ ] HIGH CONFIDENCE badge visible
- [ ] Timestamp displayed
- [ ] 5 sources cited

**Actual Results:**
```
Response Time: _____ seconds
Categories Found: _____ / 10
Agent Orange Conditions: ☐ Complete  ☐ Incomplete
Confidence Badge: ☐ Visible  ☐ Missing
Sources Count: _____ / 5
```

**Check for Specific Conditions:**
- [ ] Diabetes Mellitus Type 2
- [ ] Ischemic Heart Disease
- [ ] Parkinson's Disease
- [ ] Chronic Fatigue Syndrome
- [ ] Glioblastoma
- [ ] COPD
- [ ] Hypertension

**Sources Should Include:**
- [ ] 38 CFR §3.309
- [ ] 38 U.S.C. §1116
- [ ] 38 U.S.C. §1117
- [ ] PACT Act (2022)
- [ ] M21-1 Part IV Subpart ii Chapter 2 Section C

### Test 4.2: Scrolling Long Response
**Steps:**
1. Scroll through entire presumptive conditions response
2. Check formatting

**Expected Results:**
- [ ] All text readable
- [ ] Proper spacing between sections
- [ ] Bold headers visible
- [ ] Bullet points formatted correctly
- [ ] No text overflow

**Actual Results:**
```
Formatting: ☐ Excellent  ☐ Good  ☐ Fair  ☐ Poor
Issues: ___________________________
```

---

## SECTION 5: AI RESPONSES - OTHER QUESTION TYPES (20 min)

### Test 5.1: Disability Rating Question
**Steps:**
1. Clear previous search
2. Type "how is disability rating calculated"
3. Click "Ask AI"
4. Read response

**Expected Results:**
- [ ] Response mentions "VA Disability Rating Information"
- [ ] Explains combined rating vs simple addition
- [ ] Provides example: 50% + 30% + 20% = 70%
- [ ] Mentions bilateral factor
- [ ] Mentions rounding rules (74% → 70%, 75% → 80%)
- [ ] Cites 38 CFR §4.25

**Actual Results:**
```
Content Complete: ☐ Yes  ☐ No
Example Included: ☐ Yes  ☐ No
Sources: ___________________________
Issues: ___________________________
```

### Test 5.2: Service Connection Question
**Steps:**
1. Type "what is service connection"
2. Click "Ask AI"
3. Read response

**Expected Results:**
- [ ] Three elements explained (diagnosis, event, nexus)
- [ ] "At least as likely as not" standard mentioned
- [ ] Four types listed (Direct, Presumptive, Secondary, Aggravation)
- [ ] Benefit of the doubt rule mentioned
- [ ] Cites 38 CFR §3.303

**Actual Results:**
```
Three Elements: ☐ Yes  ☐ No
Four Types: ☐ Yes  ☐ No
Legal Standard: ☐ Mentioned  ☐ Missing
```

### Test 5.3: Secondary Conditions Question
**Steps:**
1. Type "common secondary conditions"
2. Click "Ask AI"

**Expected Results:**
- [ ] Lists Knee → Hip/Back
- [ ] Lists PTSD → Gastro Issues
- [ ] Lists Sleep Apnea → Hypertension
- [ ] Explains bilateral factor
- [ ] Mentions nexus requirement

**Actual Results:**
```
Examples Count: _____ / 5+
Bilateral Factor: ☐ Explained  ☐ Missing
```

### Test 5.4: Evidence Question
**Steps:**
1. Type "what evidence do I need"
2. Click "Ask AI"

**Expected Results:**
- [ ] Three types: Lay, Medical, Service Records
- [ ] Mentions buddy statements
- [ ] Mentions nexus letters
- [ ] Mentions DD214
- [ ] Mentions DBQs
- [ ] VA's duty to assist explained

**Actual Results:**
```
Evidence Types: _____ / 3
Best Practices: ☐ Included  ☐ Missing
```

### Test 5.5: PTSD Question
**Steps:**
1. Type "how do I file PTSD claim"
2. Click "Ask AI"

**Expected Results:**
- [ ] Three criteria explained
- [ ] Combat vs non-combat distinction
- [ ] MST special provisions mentioned
- [ ] Forms 21-0781 and 21-0781a listed
- [ ] Common secondary conditions listed

**Actual Results:**
```
Criteria Complete: ☐ Yes  ☐ No
MST Provisions: ☐ Mentioned  ☐ Missing
Forms Listed: ☐ Yes  ☐ No
```

### Test 5.6: Appeals Question
**Steps:**
1. Type "how do I appeal denied claim"
2. Click "Ask AI"

**Expected Results:**
- [ ] Three AMA lanes explained
- [ ] Supplemental Claim described
- [ ] Higher-Level Review described
- [ ] Board Appeal described
- [ ] 1-year deadline mentioned
- [ ] CAVC mentioned

**Actual Results:**
```
Three Lanes: ☐ Yes  ☐ No
Deadlines: ☐ Mentioned  ☐ Missing
Court Process: ☐ Explained  ☐ Missing
```

### Test 5.7: Default/Generic Question
**Steps:**
1. Type "tell me about VA"
2. Click "Ask AI"

**Expected Results:**
- [ ] Provides overview
- [ ] Lists topic areas
- [ ] Encourages more specific questions
- [ ] Mentions knowledge base sources

**Actual Results:**
```
Helpful: ☐ Yes  ☐ No
Suggests Topics: ☐ Yes  ☐ No
```

---

## SECTION 6: CONVERSATION HISTORY (10 min)

### Test 6.1: Multiple Questions
**Steps:**
1. Ask "presumptive conditions"
2. Wait for response
3. Ask "disability rating"
4. Wait for response
5. Ask "service connection"
6. Wait for response
7. Scroll to view all responses

**Expected Results:**
- [ ] All three questions visible
- [ ] Responses in reverse chronological order (newest first)
- [ ] Each has timestamp
- [ ] Each has confidence badge
- [ ] Each has sources section
- [ ] Can scroll through all

**Actual Results:**
```
Questions Visible: _____ / 3
Order Correct: ☐ Yes  ☐ No
All Elements Present: ☐ Yes  ☐ No
```

### Test 6.2: Search Field Clearing
**Steps:**
1. Type a question
2. Click "Ask AI"
3. Observe search field

**Expected Results:**
- [ ] Search field clears after submission
- [ ] Ready for next question
- [ ] Placeholder text returns

**Actual Results:**
```
Clears Properly: ☐ Yes  ☐ No
```

---

## SECTION 7: KEYBOARD & ACCESSIBILITY (5 min)

### Test 7.1: Enter Key Submit
**Steps:**
1. Type "test question"
2. Press Enter key

**Expected Results:**
- [ ] Question submits without clicking button
- [ ] Response appears

**Actual Results:**
```
Works: ☐ Yes  ☐ No
```

### Test 7.2: Tab Navigation
**Steps:**
1. Press Tab key repeatedly
2. Observe focus indicators

**Expected Results:**
- [ ] Can tab through all interactive elements
- [ ] Focus rings visible
- [ ] Logical tab order

**Actual Results:**
```
Tab Navigation: ☐ Good  ☐ Issues: _______
```

---

## SECTION 8: EDGE CASES (10 min)

### Test 8.1: Empty Input
**Steps:**
1. Click in search field
2. Leave empty
3. Try to click "Ask AI"

**Expected Results:**
- [ ] Button disabled
- [ ] Cannot submit

**Actual Results:**
```
Handled Correctly: ☐ Yes  ☐ No
```

### Test 8.2: Whitespace Only
**Steps:**
1. Type "     " (spaces only)
2. Observe "Ask AI" button

**Expected Results:**
- [ ] Button remains disabled

**Actual Results:**
```
Handled Correctly: ☐ Yes  ☐ No
```

### Test 8.3: Very Long Question
**Steps:**
1. Type a 200+ character question
2. Submit

**Expected Results:**
- [ ] Accepts long input
- [ ] Provides relevant response
- [ ] No UI breaking

**Actual Results:**
```
Handled Correctly: ☐ Yes  ☐ No
```

### Test 8.4: Special Characters
**Steps:**
1. Type "What's the §3.303 regulation?"
2. Submit

**Expected Results:**
- [ ] Accepts special characters
- [ ] Processes normally

**Actual Results:**
```
Handled Correctly: ☐ Yes  ☐ No
```

---

## SECTION 9: RESPONSIVE DESIGN (5 min)

### Test 9.1: Browser Resize
**Steps:**
1. Resize browser to 1024px width
2. Resize to 768px width (tablet)
3. Return to full width

**Expected Results:**
- [ ] Layout adjusts appropriately
- [ ] All content accessible
- [ ] No horizontal scrolling
- [ ] Grid columns adjust

**Actual Results:**
```
Responsive: ☐ Yes  ☐ Issues: _________
```

---

## SECTION 10: BRANCH THEME VERIFICATION (5 min)

### Test 10.1: Theme Colors
**Steps:**
1. Observe current branch theme (Army)
2. Note accent color (gold)
3. Note background gradient

**Expected Results:**
- [ ] Army gold (#FFD700) visible
- [ ] Olive drab green background
- [ ] Consistent throughout page

**Actual Results:**
```
Theme Correct: ☐ Yes  ☐ No
Colors: ___________________________
```

---

## SECTION 11: PERFORMANCE TESTING (5 min)

### Test 11.1: Response Time
**Steps:**
1. Ask 5 different questions
2. Time each response

**Expected Results:**
- [ ] All responses under 2.5 seconds

**Actual Results:**
```
Q1: _____ seconds
Q2: _____ seconds
Q3: _____ seconds
Q4: _____ seconds
Q5: _____ seconds
Average: _____ seconds
```

### Test 11.2: Rapid Tab Switching
**Steps:**
1. Rapidly switch between tabs 10 times
2. Observe performance

**Expected Results:**
- [ ] No lag or freezing
- [ ] Smooth transitions

**Actual Results:**
```
Performance: ☐ Excellent  ☐ Good  ☐ Fair  ☐ Poor
```

---

## OVERALL ASSESSMENT

### Functionality Score
☐ Excellent (95-100%) - All features work perfectly
☐ Good (85-94%) - Minor issues, core features work
☐ Fair (70-84%) - Some issues, most features work
☐ Poor (<70%) - Major issues

### User Experience Score
☐ Excellent - Intuitive, smooth, no confusion
☐ Good - Generally easy to use
☐ Fair - Some usability issues
☐ Poor - Difficult to use

### Content Quality Score
☐ Excellent - Comprehensive, accurate, helpful
☐ Good - Mostly complete and accurate
☐ Fair - Some gaps or inaccuracies
☐ Poor - Incomplete or incorrect

### Critical Issues Found
```
1. ___________________________________
2. ___________________________________
3. ___________________________________
```

### Minor Issues Found
```
1. ___________________________________
2. ___________________________________
3. ___________________________________
```

### Recommendations
```
1. ___________________________________
2. ___________________________________
3. ___________________________________
```

---

## SIGN-OFF

**Tester Name:** _____________________
**Date Completed:** __________________
**Time Spent:** ______ minutes
**Overall Status:** ☐ PASS  ☐ PASS WITH ISSUES  ☐ FAIL

**Approved for Production:** ☐ YES  ☐ NO  ☐ AFTER FIXES

**Signature:** _______________________

---

## APPENDIX: EXPECTED SOURCE CITATIONS REFERENCE

### Presumptive Conditions
- 38 CFR §3.309
- 38 U.S.C. §1116, §1117
- PACT Act (2022)
- M21-1 Part IV Subpart ii Chapter 2 Section C

### Disability Ratings
- 38 CFR §4.25
- 38 CFR Part 4
- M21-1 Part III Subpart iv Chapter 3

### Service Connection
- 38 CFR §3.303
- 38 CFR §3.102
- M21-1 Part III Subpart iv Chapter 1 Section C

### Secondary Conditions
- 38 CFR §3.310(a)
- 38 CFR §4.26
- M21-1 Part IV Subpart ii Chapter 2 Section D
- Allen v. Brown, 7 Vet.App. 439 (1995)

### PTSD
- 38 CFR §3.304(f)
- 38 CFR §4.130
- M21-1 Part IV Subpart ii Chapter 1 Section C

### Appeals
- 38 CFR §3.2500
- M21-1 Part I Chapter 5
- 38 USC §5110(a)

### Evidence
- 38 CFR §3.159
- 38 USC §5103A
- M21-1 Part III Subpart iv Chapter 4
- Jandreau v. Nicholson, 492 F.3d 1372
