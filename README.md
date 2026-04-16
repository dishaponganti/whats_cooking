# What's Cooking? 🍽️

A lightweight meal planner app that displays your weekly Hindi meal plan and advances through meals throughout the day.

## Features

✅ **Automatic Meal Detection** - Shows the right meal based on current time  
✅ **Hindi Text Support** - Full Devanagari script rendering  
✅ **Offline Mode** - Works without internet after first sync  
✅ **Health App Design** - Professional emerald green theme  
✅ **Manual Navigation** - "अगला आहार" button to skip ahead  

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start the app:**
```bash
npm start
```

3. **Run on device:**
- **iOS:** Press `i` to open in iOS Simulator
- **Android:** Press `a` to open in Android Emulator
- **Web:** Press `w` to open in browser

## How It Works

1. **On Launch** - App fetches `meal_plan.xlsx` from GitHub
2. **Automatic Slot Detection** - Based on current time:
   - 🌅 Breakfast: before 10:00 AM
   - 🍽️ Lunch: 10:00 AM - 2:00 PM
   - 🥤 Snack: 2:00 PM - 5:00 PM
   - 🌙 Dinner: after 5:00 PM
3. **Display Current Meal** - Shows in Hindi with optional tips
4. **Manual Navigation** - Click "अगला आहार" to see next meal

## Meal Plan Format

The Excel file should have these columns:

| day | slot | name_hindi | notes_hindi |
|-----|------|-----------|------------|
| Monday | breakfast | पनीर डोसा | गरम परोसें |

## Tech Stack

- **Frontend:** React Native + Expo
- **Excel Parsing:** SheetJS
- **Storage:** AsyncStorage (local caching)
- **Styling:** Health app theme (Emerald green, Cyan accents)

## Customization

### Update Meal Plan URL

Edit the `GITHUB_URL` in `src/screens/HomeScreen.tsx`:

```typescript
const GITHUB_URL = 'https://raw.githubusercontent.com/your-username/your-repo/main/meal_plan.xlsx';
```

### Theming

Modify colors in `src/constants/colors.ts`:

```typescript
export const Colors = {
  primary: '#10B981',     // Change primary color
  secondary: '#06B6D4',   // Change accent color
  // ...
};
```

## File Structure

```
├── App.tsx                 # Entry point
├── index.js               # Expo registration
├── src/
│   ├── constants/
│   │   └── colors.ts      # Theme & typography
│   ├── hooks/
│   │   └── useMeals.ts    # Fetch & cache meals
│   ├── screens/
│   │   └── HomeScreen.tsx # Main UI
│   └── utils/
│       └── mealLogic.ts   # Slot & meal logic
├── app.json               # Expo config
├── babel.config.js        # Babel config
└── package.json           # Dependencies
```

## Future Enhancements (v1.1+)

- 🔊 Hindi text-to-speech
- 🔔 Meal reminders
- ✏️ In-app meal editing
- 📊 Nutrition information

## License

Personal use only.
