# FitTrack — Personalized Fitness & Nutrition Web App

This document outlines the implementation plan for the FitTrack web application, utilizing React (Frontend), Node.js/Express (Backend), and MySQL (Database). The plan follows the agent-based task division requested.

## User Review Required

> [!IMPORTANT]
> Since I am a single agent orchestrating the entire project, I will sequentially act as each requested agent. Please review this plan to confirm if the breakdown aligns with your expectations before I begin execution.

## Open Questions

1. **Database Hosting Locally:** For development, should I use a local MySQL instance (or SQLite as a fallback for faster setup without external dependencies), or do you have a PlanetScale/Aiven connection string ready for me to use?
2. **Backend Architecture:** I will create a separate `backend` folder inside the project root for the Express API. The current Vite React app will serve as the `frontend`. Is this mono-repo structure acceptable?

## Proposed Changes

### Phase 1: Database (Agent 1)
- **Schema Creation:** Write a comprehensive `schema.sql` containing all tables defined in Section 6 (Users, Gamification, Exercises, Workouts, AI Features, Nutrition, Supplements, Progress, System).
- **Foreign Keys & Indexes:** Establish correct relations and add indexes for frequent queries.
- **Seed Data:** Create an `insert_seed.sql` script containing 20 standard exercises with French names, descriptions, and JSON metadata.

### Phase 2: Backend API Core (Agent 2)
- **Initialization:** Create the Express server structure (`server.js`, `routes/`, `controllers/`, `middlewares/`, `config/`).
- **Authentication:** Implement JWT-based registration and login logic with bcrypt hashing.
- **Endpoints Structure:** Scaffold all specified endpoints in Section 7 (Dashboard, Exercises, Workouts, Nutrition, Supplements, Progress, Export, Admin).

### Phase 3: Frontend Foundation (Agent 3)
- **Setup:** Configure Tailwind CSS with dark/light mode variables.
- **Routing:** Setup `react-router-dom` with protected routes.
- **Contexts:** Implement `AuthContext`, `ThemeContext`, and `LanguageContext` (i18next).
- **Core Pages:** Build Landing, Login, Register, and Profile Setup wizard.

### Phase 4: Frontend Features (Agent 4)
- **Dashboard:** Implement stat cards, weekly calendar, predicted workout component, XP bar, and streak flame.
- **Exercise Library:** Build grid view with filters and detail modals supporting looping videos.

### Phase 5: Full-Stack Workout & AI (Agent 5)
- **Workout Builder:** Create the UI and logic for manual and AI-predicted workout generation.
- **Active Session:** Implement the active workout UI with timers and set logging.
- **AI Summaries:** Implement the backend algorithm to generate contextual post-workout summaries based on the user's performance.

### Phase 6: Polish & QA (Agent 6)
- Ensure keyboard navigation and a11y compliance.
- Responsive design checks for all major breakpoints.
- Offline capabilities (Service Worker & IndexedDB setup).
- Export functionalities (PDF/CSV).

---

## Verification Plan

### Automated/Manual Verification
- I will write unit/integration tests for the core backend algorithms.
- I will run the frontend and backend locally to manually verify authentication, data fetching, and layout correctness.
- The `browser_subagent` will be used to automatically test the UI components as they are built.
