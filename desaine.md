# FitTrack — Exhaustive UI/UX Design Specification

## Table of Contents
1. [Brand Identity & Design System](#brand-identity--design-system)
2. [1. Onboarding Flow](#1-onboarding-flow)
3. [2. Dashboard (Home)](#2-dashboard-home)
4. [3. Exercise Library](#3-exercise-library)
5. [4. Active Workout Flow](#4-active-workout-flow)
6. [5. Workout History & Progress](#5-workout-history--progress)
7. [6. Nutrition Hub](#6-nutrition-hub)
8. [7. Profile & Settings](#7-profile--settings)
9. [8. Gamification Layer](#8-gamification-layer)

---

## Brand Identity & Design System

### Brand Identity
- **Tone:** Athletic Precision meets Digital Energy — fast, purposeful, subtly aggressive.
- **Feel:** Premium glassmorphism, dark-mode-first, gamified, data-dense but never cluttered.
- **Audience:** Fitness enthusiasts aged 18–40, mobile-first but desktop-capable.
- **Differentiator:** The UI explicitly shifts states: analytical and calm during review, highly focused and energetic during active workouts.

### Global Design Tokens
| Category | Token/Value | Usage |
| :--- | :--- | :--- |
| **Primary BG** | `#0F172A` → `#162032` | Base layer, radial gradient anchored top-right |
| **Secondary BG** | `#1E293B` | Cards, modals, elevated surfaces (70% opacity for glassmorphism with 12px blur) |
| **Brand Blue** | `#3B82F6` | Primary interactions, standard CTAs, links |
| **Energy Cyan** | `#0EA5E9` | Highlights, active navigation states, data visualization |
| **Momentum** | `#F97316` | Active workout sets, live timers |
| **In-Progress**| `#8B5CF6` | Ongoing activities, planned but incomplete sets |
| **XP / Gold** | `#F59E0B` → `#FBBF24` | Gamification elements, level-ups, streaks |
| **Success** | `#22C55E` | Completion, positive feedback, PRs |
| **Warning** | `#F59E0B` | Destructive action warnings, rest timer overflow |
| **Danger** | `#EF4444` | Form errors, account deletion, missed goals |

### Typography
- **Display/Headers:** `Barlow Condensed Bold` (uppercase for main headers)
- **Body:** `DM Sans` (clean, geometric)
- **Numbers/Timers:** `JetBrains Mono` with `font-variant-numeric: tabular-nums`

### Global Animation Primitives
- **Page Transitions:** 200ms `ease-out` fade-in.
- **Card Hover:** `transform: translateY(-4px)` with `box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5)`, duration 300ms `cubic-bezier(0.4, 0, 0.2, 1)`.
- **Button Press:** `transform: scale(0.94)` with `box-shadow: inset 0 2px 4px rgba(0,0,0,0.3)`, duration 100ms.
- **Skeleton:** Linear gradient shimmer, `-200%` to `200%` over 1.5s infinite.
- **Modals:** Enter `scale(0.95)` → `scale(1.0)` + `opacity: 0` → `1`, duration 200ms `ease-out`.

---

## 1. Onboarding Flow

### 1. Layout Blueprint
- **Mobile/Tablet/Desktop:** Single-column centered container (max-width 480px) on all viewports to maintain focus.
- **Z-Layers:** Background gradient (z-0) → Glass container (z-10) → Interactive elements (z-20) → Toast errors (z-50).
- **Scroll:** Prevent body scroll during onboarding unless content exceeds viewport height.

### 2. Component Inventory
- **Inputs:** Default (1px border Secondary BG), Focus (2px border Energy Cyan + 4px glow), Error (2px border Danger).
- **Progress Bar:** Top of modal, filling progressively from 0% to 100%.
- **Option Cards (Goals/Level):** Default (opacity 80%), Selected (border Brand Blue, `scale(1.02)`, full opacity).

### 3. Color & Typography Mapping
- **Header:** `Barlow Condensed`, `text-white`, text-3xl.
- **Subtext:** `DM Sans`, `text-slate-400`, text-sm.
- **CTA:** `Brand Blue` background, `JetBrains Mono` for step counter (e.g., "Step 1/4").

### 4. Motion Spec
- **Step Transitions:** Content slides left (`-20px`) and fades out (150ms), new content slides from right (`+20px`) and fades in (200ms).
- **Selection Bounce:** Tapping a goal card triggers a 100ms `scale(0.96)` bounce.

### 5. Responsive Behavior
- **Mobile:** Full width, bottom-fixed sticky CTA button.
- **Desktop:** Floating centered glass card, CTA button inline below form.

### 6. Empty & Zero States
- **Empty Inputs:** Placeholder text (`DM Sans`, italic, `#64748B`). Next button remains disabled (opacity 50%) until requirements are met.

### 7. Error States
- **Inline:** Red text appears below input (`translateY(-5px)` to `0`, fade in 150ms).
- **Shake Animation:** The entire form card shakes 3 times (`±4px` X-axis) on invalid submission.

### 8. Accessibility Notes
- **Focus Rings:** `2px solid #0EA5E9` with `2px offset`.
- **Contrast:** Ensure placeholder text meets WCAG 4.5:1 against `#1E293B`.
- **Touch Targets:** All selectable goal cards are min 60px height.

### 9. Bilingual Considerations (FR/EN)
- Buttons use `flex-wrap` or text truncation. "Create Account" vs. "Créer un compte" — button width must accommodate the longer French string without breaking layout.

### 10. Edge Cases
- **Offline:** Disable "Submit" button, show top banner "Connexion requise / Connection required".
- **Very Long Names:** Truncate with ellipsis after 24 characters.

---

## 2. Dashboard (Home)

### 1. Layout Blueprint
- **Grid:** 12-column CSS Grid.
- **Mobile:** Single column stacked.
- **Desktop:** Sidebar (2 cols) + Main (7 cols) + Right Rail for Calendar/Stats (3 cols).
- **Sticky:** Top navigation/header remains sticky on scroll.

### 2. Component Inventory
- **"Today's Plan" Smart Card:** Hero element. Default (solid), Hover (glow effect), Loading (skeleton). Includes large "Start" CTA.
- **Stat Cards (Calories, Workouts, XP):** Compact cards with inline SVG sparklines.
- **Weekly Calendar Strip:** 7 rounded rectangular day blocks. Active day (Brand Blue), Logged day (Success green dot), Missed day (greyed out).

### 3. Color & Typography Mapping
- **"Start" CTA:** `Energy Cyan` to `Brand Blue` gradient.
- **Sparklines:** `Success` for positive trends, `Warning` for neutral, `Danger` for negative.
- **Values:** `JetBrains Mono` for calorie counts and XP.

### 4. Motion Spec
- **Number Morphing:** XP and Calorie values roll up from 0 to actual value on initial load (duration 800ms, `ease-out`).
- **Streak Flame:** Infinite 2s pulse animation (`scale(1) -> 1.1 -> 1`, `opacity: 0.8 -> 1 -> 0.8`) using `XP/Gold` gradient.

### 5. Responsive Behavior
- **Mobile:** Calendar strip enables horizontal swipe (`overflow-x: auto`, `snap-type: x mandatory`).
- **Tablet:** Stat cards shift to 2-column grid.

### 6. Empty & Zero States
- **No Plan Today:** "Rest Day" illustration (vector art of a battery recharging). CTA becomes "Explore Workouts".
- **Zero Workouts:** Sparklines replaced with a dashed flat line.

### 7. Error States
- **Failed Data Fetch:** Skeleton loaders turn red, accompanied by a "Retry" ghost button.

### 8. Accessibility Notes
- Sparkline charts must include `aria-label` detailing the trend (e.g., "Calories trending up by 15%").
- Calendar days must be navigable via Tab key.

### 9. Bilingual Considerations
- "Workouts" vs "Entraînements" — ensure stat card headers can break into two lines if necessary.

### 10. Edge Cases
- **0 XP:** Still render progress bar but at a minimum 2% width so it remains visible.

---

## 3. Exercise Library

### 1. Layout Blueprint
- **Grid:** Masonry or strict grid.
- **Top Bar:** Sticky z-30 container holding Search input and horizontal scrolling Filter Chips.
- **List:** Z-10 scrollable region.

### 2. Component Inventory
- **Search Bar:** Left search icon, right clear (X) icon when populated.
- **Interactive Muscle Map SVG:** An anatomical human figure. Hovering a muscle group applies an SVG `<filter>` drop-shadow in `Energy Cyan`.
- **Filter Chips:** Default (pill, outline), Active (solid `Brand Blue`, bold text).
- **Exercise Card:** Image (aspect-video), Title, Badge (Difficulty), Muscle tags.

### 3. Color & Typography Mapping
- **Card Titles:** `Barlow Condensed` text-xl.
- **Badges:** Beginner (`Success`), Intermediate (`Warning`), Advanced (`Danger`).

### 4. Motion Spec
- **Search Debounce:** Results fade out/in (150ms) to prevent jarring flashes during typing.
- **Card Enter:** Staggered fade-up (`translateY(20px)`) 50ms apart upon initial load.

### 5. Responsive Behavior
- **Mobile:** 1 column. Muscle Map is hidden behind a "Visual Filter" modal button to save space.
- **Desktop:** 3-4 columns. Muscle Map permanently visible in a left sticky sidebar (3 cols).

### 6. Empty & Zero States
- **No Search Results:** Illustration of a magnifying glass over a dumbbell. "No exercises found / Aucun exercice trouvé".

### 7. Error States
- **Media Load Failure:** Fallback to a placeholder generic gradient with a barbell icon.

### 8. Accessibility Notes
- Muscle Map SVG paths must have `<title>` tags and `tabindex="0"` for keyboard navigation.
- Minimum 44x44px target for closing the detail modal.

### 9. Bilingual Considerations
- Bilingual Form Cues: Data structure provides both; UI binds to active `LanguageContext` to switch seamlessly.

### 10. Edge Cases
- **500+ Exercises:** Implement virtual scrolling (`react-window`) to maintain DOM performance and 60fps scrolling.

---

## 4. Active Workout Flow

### 1. Layout Blueprint
- **Focus Mode:** Absolute full screen, hiding main navigation bars.
- **Header:** Sticky top with Workout Name, Total Timer, and "Finish" CTA.
- **Main:** List of sets. Current active set is pinned/highlighted.

### 2. Component Inventory
- **Set Logger Row:** Set number, Previous Data (ghost text), Weight Input, Reps Input, Checkbox.
- **Animated Checkbox:** Default (circular outline), Checked (Solid `Success` green, checkmark draws path).
- **Progressive Overload Chip:** Inline tooltip button positioned next to previous stats.
- **Rest Timer Circular Progress:** SVG circle stroke.

### 3. Color & Typography Mapping
- **Active State Override:** The primary color shifts from `Brand Blue` to `Momentum Orange` (#F97316) to signal active physical output.
- **Numbers:** Exclusively `JetBrains Mono` for maximum readability under physical stress.

### 4. Motion Spec
- **Checkbox Draw:** SVG path stroke-dashoffset animation (300ms).
- **Rest Timer Wash:** Background of the timer card transitions from `transparent` → `Success` (start) → `Warning` (5s left) → `Danger` (overtime) using CSS transitions (500ms).
- **AI Summary Reveal:** Typewriter effect (15ms per character). PR badges stamp in with `scale(3) -> 1` over 200ms.

### 5. Responsive Behavior
- **Mobile:** Inputs dominate the screen width. Keypad auto-triggers numeric layout (`inputmode="decimal"`).
- **Desktop:** Splitscreen: Left side shows current exercise video loop; Right side shows logging inputs.

### 6. Empty & Zero States
- **Before First Set:** Display ghost data from the previous session to guide the user.

### 7. Error States
- **Invalid Weight:** Input border turns `Danger` red. Subtle vibration animation. Prevents checkbox toggle.

### 8. Accessibility Notes
- Extremely high contrast required (WCAG AAA) as users may view screen in bright gym lighting, through sweat, or at a distance.
- `aria-live="polite"` for the rest timer countdown announcements.

### 9. Bilingual Considerations
- Rest timer text ("Rest" / "Repos") must fit inside the circular SVG without overflowing.

### 10. Edge Cases
- **App sent to background:** Use `localStorage` to save state on every keystroke. Use `Date.now()` delta calculations to keep the rest timer accurate even if JS execution is paused by the OS.

---

## 5. Workout History & Progress

### 1. Layout Blueprint
- **Top Section:** GitHub-style Calendar Heatmap (horizontal scroll).
- **Middle Section:** Volume charts (Bar graphs).
- **Bottom Section:** PR Timeline (Vertical feed).

### 2. Component Inventory
- **Heatmap Cell:** Empty (`#1E293B`), Level 1 (`#3B82F6` @ 30%), Level 2 (60%), Level 3 (100%).
- **Charts:** Chart.js canvas elements with custom tooltip components.
- **Timeline Item:** Date node, connection line, Exercise Name, PR Value badge.

### 3. Color & Typography Mapping
- **Charts:** Axes in `Slate-600`. Bars use `Energy Cyan`.
- **Badges:** `XP/Gold` for absolute all-time PRs, `Success` for 30-day PRs.

### 4. Motion Spec
- **Chart Render:** Bars grow from the bottom (X-axis) up to their value over 800ms on intersection observe.
- **Heatmap Hover:** Tooltip fades in (100ms) instantly following cursor.

### 5. Responsive Behavior
- **Mobile:** Heatmap defaults to showing only the last 3 months, scrollable left for more.
- **Desktop:** Full 12-month heatmap fits horizontally.

### 6. Empty & Zero States
- **No Data:** "Your journey begins here" text overlaid on a blurred, fake chart to show what the interface *will* look like.

### 7. Error States
- Fallback text if Chart.js fails to initialize (e.g., "Unable to render chart data").

### 8. Accessibility Notes
- Data tables must be available via a visually hidden `table` element for screen readers, as `<canvas>` charts are inherently inaccessible.

### 9. Bilingual Considerations
- Date formatting (MM/DD/YYYY vs DD/MM/YYYY) dynamically adapts based on the active `LanguageContext` (`fr-FR` vs `en-US`).

### 10. Edge Cases
- **Years of Data:** Lazy load chart data. Render heatmap in chunks by year.

---

## 6. Nutrition Hub

### 1. Layout Blueprint
- **Header:** Sticky dashboard showing total calories consumed / remaining.
- **Hero:** Three concentric or side-by-side SVG Circular Progress rings for Macros.
- **Body:** Vertical timeline representing the day's meals.

### 2. Component Inventory
- **Macro Rings:** SVG `circle` elements with animated `stroke-dasharray`.
- **Radar Chart:** Polygon chart plotting protein intake across 4-6 daily time slots.
- **Meal Log Card:** Food name, macros breakdown (tiny badges), timestamp.
- **Barcode Button:** Floating Action Button (FAB) anchored bottom-right.

### 3. Color & Typography Mapping
- **Protein:** `Brand Blue`
- **Carbs:** `Momentum Orange`
- **Fats:** `Warning Yellow`
- Over-consuming calories turns the main calorie text from `Success/Primary` to `Danger`.

### 4. Motion Spec
- **Ring Fill:** Circular paths animate from 0 to actual % over 1.2s `cubic-bezier(0.17, 0.67, 0.83, 0.67)`.
- **Radar Build:** Radar points expand from center `(0,0)` to final coordinates over 600ms.

### 5. Responsive Behavior
- **Mobile:** Concentric rings (one inside the other) to save horizontal space.
- **Desktop:** 3 separate distinct circular charts placed side-by-side.

### 6. Empty & Zero States
- Rings default to 5% visible background track (`#1E293B`) to establish the visual perimeter.

### 7. Error States
- **Camera Denied (Barcode):** Modal pops up explaining how to grant permissions or fallback to manual search.

### 8. Accessibility Notes
- Color cannot be the only indicator of a macro. Explicitly label rings (P, C, F) visually and via `aria-label`.

### 9. Bilingual Considerations
- "Protein/Protéines", "Carbs/Glucides", "Fats/Lipides" — text in legends must not overlap charts.

### 10. Edge Cases
- **User consumes 200% of goal:** The SVG ring must handle overlap gracefully. Implement a second overlapping ring layer in a darker shade to signify >100%.

---

## 7. Profile & Settings

### 1. Layout Blueprint
- **Layout:** Standard list view/settings pane design. Left sidebar on desktop, full screen stacked on mobile.
- **Header:** Sticky avatar, Name, Level badge.

### 2. Component Inventory
- **Avatar:** Circular image with `XP/Gold` stroke based on level progression.
- **Toggles:** iOS-style switch components.
- **Danger Zone Button:** Red outline button, turns solid red on hover.

### 3. Color & Typography Mapping
- **Danger Zone:** `Danger` red `#EF4444` heavily utilized here to signal destructive actions.
- **Section Headers:** `Barlow Condensed`, `text-slate-500`, uppercase tracking-wide.

### 4. Motion Spec
- **Toggle Switch:** The inner circle translates X by 20px over 150ms `spring` physics. Background color transitions `Secondary BG` → `Success`.

### 5. Responsive Behavior
- **Desktop:** Settings split into tabs (Account, Preferences, Data).
- **Mobile:** Long scrollable list with internal anchor links.

### 6. Empty & Zero States
- **No Avatar:** Fallback to user's initials generated via JS, rendered in `Barlow Condensed` inside a `Brand Blue` circle.

### 7. Error States
- **Settings Save Failed:** Revert the UI toggle back to its previous state instantly and trigger a red Toast error.

### 8. Accessibility Notes
- Toggles must be `<button role="switch" aria-checked="true/false">`.
- Danger actions require explicit confirmation modals with focus-traps.

### 9. Bilingual Considerations
- "Delete Account" vs "Supprimer le compte". Button width flexes accordingly.

### 10. Edge Cases
- **Offline:** Disable data export and account deletion buttons to prevent state desync.

---

## 8. Gamification Layer

### 1. Layout Blueprint
- This layer sits globally above the main UI (z-index 100).
- **Level Up Modal:** Centered absolute overlay taking over the viewport.
- **Toasts/Badges:** Slide in from Top-Right (Desktop) or Top-Center (Mobile).

### 2. Component Inventory
- **Badge Icon:** SVG polygon shapes (hexagons, shields) with metallic CSS gradients.
- **Level Up Confetti:** Canvas-based particle emitter.
- **Flame Icon:** SVG path with multiple states (lit, frozen, extinguished).

### 3. Color & Typography Mapping
- **Core Palette:** Exclusively uses the `XP/Gold` (`#F59E0B` → `#FBBF24`) and `Energy Cyan` tokens to separate it visually from functional UI.

### 4. Motion Spec
- **Badge Unlocked:** Card slides in, badge icon rotates on Y-axis 360deg over 1s.
- **Level Up Modal:** Background blurs (backdrop-filter: blur(8px) over 300ms). Modal scales up rapidly with elastic bounce. Confetti particles emit outward.

### 5. Responsive Behavior
- **Mobile:** Level Up modal forces portrait orientation lock if possible. Toasts stack vertically with 8px gaps.
- **Desktop:** Badges appear as non-blocking toasts in the corner.

### 6. Empty & Zero States
- **Locked Badges:** Rendered in greyscale (`filter: grayscale(100%) opacity(30%)`) with a subtle lock icon superimposed.

### 7. Error States
- Gamification calculations occur client-side; errors fail silently (fallback to previous known state) rather than disrupting the user's workout flow.

### 8. Accessibility Notes
- All gamification animations respect `prefers-reduced-motion` media queries (bypassing scaling/confetti, opting for simple fades).

### 9. Bilingual Considerations
- Badge titles are often highly idiomatic ("Full Week Warrior" vs "Guerrier de la Semaine"). Ensure the translated JSON data accommodates idiom equivalents rather than literal translations.

### 10. Edge Cases
- **Simultaneous Triggers:** User completes workout AND levels up AND hits a streak. Queue the modals/toasts sequentially (Wait 1s between dismissal and next trigger) rather than overlapping them in a chaotic manner.
