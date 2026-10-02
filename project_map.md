# FitTrack Project Map & Architecture

This document provides a detailed overview of the FitTrack application structure, its components, and data flow.

---

## 🏗️ 1. Core Architecture
The project follows a **Modular Service-Oriented Architecture** built on **React 19 + Vite 8**.

- **Frontend**: React (Functional Components + Hooks)
- **Styling**: Tailwind CSS v4 (Engineered in `index.css`)
- **Backend/DB**: Transitioning to **Supabase** (Client configured in `src/lib/`)
- **Language**: Strict **TypeScript** (unified `.ts` and `.tsx` files)

---

## 📁 2. Directory Breakdown

### `📂 src/context/` (The Brain)
Centralized state management using React Context API.
- `AuthContext.tsx`: Manages user sessions, login/register, and profile updates.
- `WorkoutSessionContext.tsx`: The runtime engine for active workouts (timers, set logging, sequence).
- `GamificationContext.tsx`: Tracks XP, levels, and achievements.
- `NutritionContext.tsx`: Manages daily caloric logs and macro targets.
- `LanguageContext.tsx`: Lightweight bilingual (EN/FR) string mapping.
- `ThemeContext.tsx`: Manages the dark-mode/premium aesthetic state.

### `📂 src/services/` (The Data Layer)
Abstracted API and logic handlers.
- `api.ts`: Base Axios/Fetch configuration.
- `authService.ts`: Authentication logic (localStorage + API).
- `workoutService.ts`: Algorithm 4 (Predicted Workouts) and Algorithm 5 (AI Summaries).
- `exerciseService.ts`: CRUD for the exercise library.
- `nutritionService.ts`: Calorie and macro calculations.
- `📂 mockData/`: Contains `mockExercises.ts` and `mockUser.ts` for development.

### `📂 src/pages/` (View Layer)
Main application screens.
- `LandingPage.tsx`: Marketing/Entrance.
- `DashboardPage.tsx`: The primary hub showing stats, streaks, and today's plan.
- `ExerciseLibraryPage.tsx`: Searchable 500+ exercise database.
- `WorkoutExecutionPage.tsx`: The high-intensity "active workout" screen.
- `NutritionPage.tsx`: Macro tracking with visual rings.
- `OnboardingWizard.tsx`: Multi-step AI profile builder.

### `📂 src/components/` (UI Components)
Re-usable atomic and composite components.
- `📂 layout/`: `MainLayout`, `Sidebar`.
- `📂 dashboard/`: `StatCard`, `TodayPlan`, `CalendarStrip`, `StreakTracker`.
- `📂 workout/`: `SetLogger`, `RestTimer`, `WorkoutHeader`, `SummaryCard`.
- `📂 exercises/`: `ExerciseCard`, `FilterBar`, `MuscleMap`.

---

## 🔄 3. Data Flow Example

1. **User Action**: User clicks "Start Workout" on `DashboardPage`.
2. **Context**: `WorkoutSessionContext` initializes a new `WorkoutSession` object.
3. **Navigation**: User is routed to `WorkoutExecutionPage`.
4. **Execution**: User logs sets; `SetLogger` updates the context state in real-time.
5. **Completion**: `finishWorkout` triggers `workoutService.generateSummary`, awarding XP via `GamificationContext`.
6. **Persistence**: The session is saved to `localStorage` (and soon, Supabase).

---

## 🎨 4. Design System
- **Variables**: Defined in `@theme` block within `src/index.css`.
- **Primary Colors**: 
  - `primary-bg`: `#0F172A`
  - `brand-blue`: `#3B82F6`
  - `energy-cyan`: `#0EA5E9`
- **Glassmorphism**: Custom utility classes like `.glass-card` using `backdrop-filter`.

---

## ⚙️ 5. Configuration Files
- `vite.config.ts`: Vite setup with React and Tailwind plugins.
- `tsconfig.json`: Strict TypeScript configuration.
- `package.json`: Manifest of dependencies (React 19, Tailwind 4, Lucide).
- `schema.md`: Detailed map of table and column names.
- `.env.local`: (Hidden) Supabase keys and environment variables.
