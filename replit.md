# GolfWithAlex - Golf Score Tracker

## Overview
A single-page, mobile-first golf scoring web app optimized for iPhone in portrait mode. Designed for fast, tap-based scoring during real play on the course.

## Key Features
- Track golf rounds for 1-4 players
- Tap-based scoring: tap to add stroke, tap-and-hold to subtract
- Dynamic color coding based on par performance (birdie, par, bogey, etc.)
- Swipe navigation between holes
- 9 or 18 hole rounds
- Automatic subtotals at hole 9 and hole 18
- PNG export of final scorecard
- Light/Dark mode toggle
- Offline-friendly with localStorage persistence

## Tech Stack
- Frontend: React with TypeScript
- Styling: Tailwind CSS with custom golf-themed colors
- State: React hooks with localStorage persistence
- Export: html2canvas for PNG generation
- No backend required - all data stored locally

## Data Storage
All game state is persisted in browser localStorage:
- `golfwithalex_game` - Complete game state (players, scores, setup)
- `golfwithalex_theme` - User's light/dark mode preference

## How to Run
```bash
npm run dev
```
The app runs on port 5000.

## Project Structure
```
client/src/
├── components/
│   ├── ThemeProvider.tsx    # Light/dark mode context
│   ├── TopBar.tsx           # App header with controls
│   ├── PreRoundSetup.tsx    # Course/player configuration
│   ├── PlayerTile.tsx       # Tap-to-score player cards
│   ├── BottomControls.tsx   # Hole indicator and par input
│   ├── HelpModal.tsx        # Usage instructions
│   ├── ScoreModal.tsx       # Current score grid
│   ├── SubtotalModal.tsx    # Front 9 / round complete summary
│   ├── Scorecard.tsx        # Final scorecard with export
│   └── ConfirmDialog.tsx    # Reset confirmation
├── lib/
│   ├── types.ts             # TypeScript interfaces
│   ├── storage.ts           # localStorage utilities
│   └── utils.ts             # General utilities
├── pages/
│   └── GolfApp.tsx          # Main app component
└── App.tsx                  # Root component
```

## PNG Export
- Uses html2canvas to capture the scorecard element
- Attempts iOS-friendly share API, falls back to download
- Includes watermark: "GolfWithAlex" and "golfwithalex.me"

## Par-Based Color Coding
- Birdie (-1): Gold
- Par (0): Green  
- Bogey (+1): Yellow
- Double Bogey (+2): Medium Brown
- Triple+ (+3 or worse): Light Red
- No par set: Neutral gray

## User Preferences
- Light/dark mode preference saved to localStorage
- Last round data persisted automatically
