# What's Cooking? - MVP PRD

**Version:** 1.0  
**Date:** April 14, 2026  
**Status:** Implemented

---

## 1. Overview

What's Cooking? is a lightweight, personal meal planner app for iOS that displays a weekly Hindi meal plan and intelligently shows the current meal based on device time. The app combines automatic meal detection with manual navigation controls and an intuitive health app-inspired design.

---

## 2. Goals

✅ Display weekly meal plan in a clean, accessible format  
✅ Automatically detect current meal based on time of day  
✅ Provide manual navigation through meal schedule  
✅ Support Hindi (Devanagari) text rendering  
✅ Work offline with local caching  
✅ Maintain professional health app aesthetic  

---

## 3. Features

### 3.1 Week Calendar View
- **Horizontal scrollable calendar** displaying all days with dates in English format
- **Four meal slots per day**: Breakfast, Lunch, Snack, Dinner
- **Consistent grid layout** with fixed-width columns for professional appearance
- **Full meal names** displayed in Devanagari script
- **Visual gridlines** separating slots and days
- **Current day highlighted** in header (emerald green background)
- **Upcoming meal highlighted** with light green background

### 3.2 Automatic Meal Detection
The app intelligently determines the current meal based on time of day:

| Slot | Time Range | Icon |
|------|-----------|------|
| Breakfast | 12:00 AM - 10:00 AM | 🌅 |
| Lunch | 10:00 AM - 2:00 PM | 🍽️ |
| Snack | 2:00 PM - 5:00 PM | 🥤 |
| Dinner | 5:00 PM - 12:00 AM | 🌙 |

### 3.3 Now & Next Meal Display
Two-card layout showing current and upcoming meals:

**NOW Card (Emerald Badge)**
- Current meal slot (e.g., "Breakfast")
- Full meal name in Hindi
- Optional tips/cooking notes

**NEXT Card (Cyan Badge)**
- Next meal slot (e.g., "Lunch")
- Full meal name in Hindi
- Optional tips/cooking notes

### 3.4 Manual Navigation
- **"अगला आहार" (Next Meal) Button** - Advances through meal schedule
- **Reset Button** - Returns to current meal (appears when override active)
- **Wrapping** - Cycles back to first meal after last meal

### 3.5 Offline Support
- **AsyncStorage Caching** - Stores meal plan locally with 24-hour TTL
- **Offline Badge** - Displays when operating in offline mode
- **Graceful Fallback** - Uses cached data if network unavailable
- **Refresh Button** - Manually invalidate cache and re-fetch

### 3.6 GitHub Integration
- Fetches `meal_plan.xlsx` from GitHub raw URL
- Automatic parsing via SheetJS
- 10-second timeout for network requests
- Error handling with fallback to cached data

### 3.7 Design System
**Colors:**
- Primary (Emerald): `#10B981` - Main actions, current day highlight
- Secondary (Cyan): `#06B6D4` - Next meal badge, accents
- Accent (Amber): `#F59E0B` - Energy/food emphasis
- Background: `#F9FAFB` - App background
- Surface: `#FFFFFF` - Cards and containers
- Text Primary: `#111827` - Main text
- Text Secondary: `#6B7280` - Labels and hints

**Typography:**
- Large (32px, 600wt) - Page titles
- Heading (20px, 700wt) - Section headers
- Subheading (16px, 600wt) - Meal names
- Body (14px, 400wt) - Regular text
- Body Small (12px, 400wt) - Labels, hints
- Label (11px, 600wt) - Badges, tags

**Spacing:**
- XS: 4px
- SM: 8px
- MD: 16px
- LG: 24px
- XL: 32px
- XXL: 48px

---

## 4. Data Structure

### Meal Object
```typescript
{
  day: string;           // "Monday", "Tuesday", etc.
  slot: string;          // "breakfast", "lunch", "snack", "dinner"
  name_hindi: string;    // Meal name in Devanagari (e.g., "पनीर डोसा")
  notes_hindi?: string;  // Optional cooking tips (e.g., "गरम परोसें")
}
```

### Excel Format
The meal plan should be stored as `meal_plan.xlsx` with columns:

| day | slot | name_hindi | notes_hindi |
|-----|------|-----------|------------|
| Monday | breakfast | पनीर डोसा | गरम परोसें |
| Monday | lunch | आलू मेथी और रोटी | नमक स्वादानुसार |
| Tuesday | breakfast | चपाती और दही | ठंडा दही बेहतर |

---

## 5. User Flows

### 5.1 On App Launch
1. App loads with splash screen
2. Fetches meal plan from GitHub (with 10s timeout)
3. Parses Excel file via SheetJS
4. Detects current day and time slot
5. Shows current meal in "NOW" card
6. Shows next meal in "NEXT" card
7. Renders week calendar with upcoming meal highlighted

### 5.2 Viewing Different Meals
1. User taps "अगला आहार" button
2. App advances to next meal in sequence
3. Updates "NOW" card with selected meal
4. Updates "NEXT" card with following meal
5. Shows "Reset" button to return to actual current meal
6. Calendar highlights the selected meal

### 5.3 Offline Mode
1. App detects no network connection
2. Displays "📡 Offline Mode" badge
3. Falls back to cached meal plan (if available)
4. Shows previously fetched data
5. Re-attempts download on next app launch

---

## 6. Technical Stack

| Component | Technology |
|-----------|-----------|
| Framework | React Native 0.81.5 |
| Runtime | Expo SDK 54.0.0 |
| Language | TypeScript |
| Http Client | Axios |
| Excel Parsing | SheetJS (xlsx) |
| Local Storage | AsyncStorage |
| Styling | StyleSheet (inline) |

---

## 7. File Structure

```
whats_cooking/
├── App.tsx                           # Entry point
├── index.js                          # Expo registration
├── app.json                          # Expo configuration
├── babel.config.js                   # Babel setup
├── metro.config.js                   # Metro bundler config
├── tsconfig.json                     # TypeScript config
├── package.json                      # Dependencies
├── meal_plan.xlsx                    # Meal data
│
├── src/
│   ├── constants/
│   │   └── colors.ts                 # Theme, colors, typography
│   │
│   ├── hooks/
│   │   └── useMeals.ts               # Data fetching & caching
│   │
│   ├── screens/
│   │   └── HomeScreen.tsx            # Main UI (calendar, meals, buttons)
│   │
│   └── utils/
│       └── mealLogic.ts              # Slot detection, meal navigation
│
└── README.md                         # User documentation
```

---

## 8. Performance Targets

- **App Load Time:** < 2 seconds
- **First Meal Display:** < 1 second
- **GitHub Fetch:** 10-second timeout
- **Cache Expiry:** 24 hours
- **Memory Usage:** < 50MB

---

## 9. Testing Checklist

### Functional Testing
- [ ] Automatic slot detection works correctly all day
- [ ] Calendar displays all 7 days with correct dates
- [ ] "Now" and "Next" cards update on button press
- [ ] Reset button returns to actual current meal
- [ ] Offline badge appears when no network
- [ ] Cached data loads when offline
- [ ] GitHub fetch timeout works (10s)
- [ ] App handles missing meals gracefully

### Device Testing
- [ ] App runs on iPhone (Expo Go)
- [ ] Hindi text renders correctly
- [ ] Touch interactions responsive
- [ ] Horizontal scroll smooth (calendar)
- [ ] Vertical scroll smooth (main content)

### Edge Cases
- [ ] App handles midnight correctly
- [ ] Meal wrapping works (last meal → first meal)
- [ ] Empty cache handled gracefully
- [ ] Network reconnect re-fetches data

---

## 10. Future Enhancements (v1.1+)

### v1.1
- 🔊 Hindi text-to-speech for meal names
- 🔔 Meal reminders (push notifications)
- 📸 Meal photos/images support

### v1.2
- ✏️ In-app meal editing UI
- 📅 Custom meal plan creation
- 🎨 Theme customization

### v2.0
- ☁️ Cloud sync (Firebase/Supabase)
- 👥 Multi-user support
- 📊 Nutrition information

---

## 11. Accessibility

- Large, readable fonts throughout
- High contrast text (WCAG AA compliant)
- Touch targets ≥ 44x44pt
- Clear semantic structure
- Support for system text sizing

---

## 12. Deployment

### Development
```bash
npm install
npm start
```

### Testing on Device
1. Install Expo Go from App Store
2. Scan QR code from terminal
3. App loads on iPhone

### Production (Future)
- Build via Expo Application Services (EAS)
- Submit to Apple App Store
- Configure TestFlight for beta testing

---

## 13. Success Metrics

✅ App launches without errors  
✅ All MVP features functional  
✅ Hindi text displays correctly  
✅ Offline mode works  
✅ Calendar UI intuitive  
✅ Performance acceptable on all devices  

---

**Document Version:** 1.0  
**Last Updated:** April 14, 2026  
**Status:** Ready for Testing
