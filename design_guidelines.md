# GolfWithAlex Design Guidelines

## Design Approach
**Utility-First Mobile Design System** — Drawing from iOS Human Interface Guidelines and Material Design for mobile, optimized for single-handed operation during outdoor golf play.

## Typography System
- **Primary Font**: System font stack (San Francisco on iOS, Roboto on Android) for optimal native performance
- **Hierarchy**:
  - App title: 18px, semibold
  - Player names: 20px, medium
  - Stroke counts (in tiles): 48px, bold — maximum legibility for at-a-glance reading
  - Hole indicators: 16px, medium
  - Par input: 24px, semibold
  - Help/modal text: 16px, regular
  - Scorecard grid: 14px, medium

## Layout & Spacing System
**Tailwind spacing units**: Consistently use 4, 6, 8, 12 for all spacing (p-4, gap-6, h-8, mt-12)

**Screen Structure**:
- Top bar: h-16 with px-4 padding
- Main scoring area: Fills remaining viewport (calc(100vh - top bar - bottom controls))
- Bottom controls: h-24 with px-4 padding
- All interactive elements: min-h-12 for thumb accessibility

## Component Library

### Player Tiles (Critical Component)
- Dynamic grid: 1 player (full width), 2 players (2×1 grid), 3 players (2×2 with one empty), 4 players (2×2)
- Tile dimensions: Min height 160px per tile with gap-4 between tiles
- Border: 3px solid (dynamic color based on par logic)
- Border radius: rounded-2xl
- Internal padding: p-6
- Name box: Full-width at top with underline separator (border-b-2), pb-3 mb-4
- Stroke counter: Centered, occupying majority of tile space
- Hint text: text-sm, positioned at bottom, opacity-60

### Top Bar Elements
- Flex row with space-between
- Left: App title
- Right cluster: Help (44×44), Theme toggle (44×44), View Score button (min-w-32)
- All icons: 24×24 within 44×44 touch targets

### Bottom Controls
- Flex column with gap-3
- Hole indicator: Centered, text-center
- Par input: w-24 centered with large tap target, number input styled
- Finish Hole button: w-full, h-12, rounded-xl, bold text

### Modals/Overlays
- Full-screen overlay with 85% opacity backdrop
- Content card: max-w-md, rounded-3xl at top, slides up from bottom (iOS sheet pattern)
- Header: h-16 with title centered, close button (44×44) top-right
- Content padding: p-6
- Dismiss zone: Tap backdrop or swipe down

### Scorecard Grid
- Sticky header row with hole numbers
- Fixed-width columns: 40px per hole, 60px for totals
- Horizontal scroll if needed
- Cell padding: p-2
- Border: 1px borders creating complete grid
- Totals column: border-l-2 for visual separation

### Pre-Round Setup
- Vertical stack with gap-4
- Input fields: h-12, rounded-lg, px-4
- Dropdowns: Custom-styled select with 16px chevron icon
- Section appears only on Hole 1, collapses to single-line summary afterward

## Interaction Patterns

### Touch Targets
- Minimum: 44×44px for all interactive elements
- Player tiles: Entire tile is tap target
- Swipe gestures: Require 50px minimum distance, ignore vertical swipes
- Haptic feedback: Light impact on tap, medium impact on hold-to-subtract

### Animations
**Minimal, functional only**:
- Modal slide-up: 200ms ease-out
- Hole transition: 150ms fade between hole numbers
- Tile color change: 100ms transition on stroke update
- No decorative animations — battery and performance priority

## Accessibility Standards
- Touch targets: 44×44px minimum throughout
- Focus indicators: 3px solid outline with 2px offset
- Form labels: Always visible, never placeholder-only
- Contrast: Maintain 4.5:1 minimum for all text (critical for outdoor use)
- Reduce motion: Respect prefers-reduced-motion, skip all transitions

## Special Considerations

### Outdoor Readability
- Maximum contrast throughout
- Large text sizes (nothing smaller than 14px)
- Bold weights for key information
- Avoid pure white/pure black — use near-white/near-black for reduced glare
- Par-based colors (per user requirements): High saturation for visibility

### Single-Page Architecture
- No scroll on main scoring screen — everything fits in viewport
- Modals/overlays for: Help, View Score, Round Setup (after Hole 1)
- Sticky positioning for Top Bar and Bottom Controls

### PNG Export Layout
- Scorecard header: Course · Tees · Date · Location (text-sm, separated by ·)
- Grid preserves all formatting and colors
- Watermark: Fixed at bottom-right, text-xs, includes "GolfWithAlex" and "golfwithalex.me"
- Export captures exactly what's visible on screen

## Images
**No hero images** — This is a pure utility application. All visual interest comes from dynamic color coding and crisp typography.