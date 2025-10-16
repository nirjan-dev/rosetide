# Period Tracker App - Product Requirements Document (v2: Privacy-First SPA)

## 1. Product Overview

### Vision
Create a fast, private, and intuitive period tracking Progressive Web App (PWA) that empowers young women to understand their reproductive health without compromising their data. All user data is stored exclusively on the user's device.

### Target Users
- **Primary:** Teenagers and young adults (13-25 years) who are privacy-conscious.
- **Experience Level:** Mostly beginners to period tracking.
- **Current Solutions:** Basic health watch tracking, spreadsheets, or no tracking.
- **Primary Use Cases:** General health awareness, avoiding pregnancy, reproductive health education, private data logging.

### Core Value Proposition
- **100% Private:** All data is stored locally on your device and never sent to a server.
- **Lightning-fast logging:** Log your cycle in under 30 seconds.
- **Works entirely offline:** No internet connection is required after the initial load.
- **Simple, beautiful interface:** Designed for a delightful user experience.
- **No Account Needed:** Start tracking immediately without signing up.

## 2. Technical Architecture

### Tech Stack
- **Frontend:** Vite + React SPA + TypeScript + Tanstack router
- **Local Database:** Dexie.js (a wrapper for IndexedDB)
- **State Management:** React Query (TanStack Query) for managing local data state, TanStack Store for global state management
- **Styling:** Tailwind CSS + DaisyUI (Valentine theme), lucide react for icons
- **Components:** Radix UI (headless components for complex logic), tanstack form for forms, tanstack table for tables
- **Project Structure:** Modular, Domain-Driven Design
- **Validation:** Zod schemas for data validation before storage
- **Linting:** ESLint + ESLint Stylistic
- **CI/CD:** GitHub Actions, T3Env for typesafe env variables
- **Deployment:** Cloudflare Pages (static hosting)
- **PWA:** Service Worker + Web App Manifest
- **Testing** Storybook (with vitest browser mode)
- **Package Management** PNPM with corepack and node 24

### Data Strategy
- **Approach:** Local-first and local-only. All data is stored and managed in the browser's IndexedDB.
- **Type Safety:** End-to-end type safety within the client application, from UI components to the local database.
- **Offline Strategy:** The app is offline by default. No data synchronization is required.
- **Data Persistence:** Data is persisted across sessions using IndexedDB, managed via Dexie.js.
- **Performance Target:** < 1 second load times.

### Data Model (Dexie Schema + Zod Validation)
- Use Dexie.js to define IndexedDB schemas for tables like `cycles` and `symptoms`.
- Use Zod for runtime validation of all data before it's written to the local database.
- Use TanStack Query hooks for fetching, creating, and updating data in the local database.

## 3. MVP Features
### 3.1 Essential Features (Phase 1)
1. **Period Tracking**
   - Start/stop period logging.
   - Flow intensity tracking (1-5 scale).
   - Calendar view of past and current cycles.

2. **Symptom Logging**
   - Quick 1-5 scale for: Flow, Mood, Pain, Energy, Bloating, Cravings.
   - Optional notes field.
   - Medication tracking (free text).

3. **Basic Predictions**
   - Next period start date.
   - Cycle length averages.
   - Simple confidence indicators based on data consistency.

4. **Data Management**
   - Ability to export all data to a JSON file.
   - Ability to import data from a previously exported file.
   - A clear "Delete All My Data" button.

5. **PWA Functionality**
   - Service worker for instant loading.
   - Web App Manifest to allow users to "install" the app on their home screen.

6. **Static FAQ**
   - Common period questions and health education content.

### 3.2 Nice-to-Have Features (Phase 2)
1. **Enhanced Analytics**
   - Cycle pattern analysis.
   - Symptom correlation insights.
   - Historical comparisons and charts.

2. **Fertility Tracking**
   - Ovulation predictions.
   - Fertile window indicators.
   - Conception probability estimates.

3. **UI Themes**
   - Allow users to choose from a few different color themes besides the default Valentine theme.

## 4. User Experience Requirements

### Design Principles
- **Minimalist:** Clean, uncluttered interface using DaisyUI Valentine theme.
- **Fast:** Quick interactions, instant feedback.
- **Empathetic:** Supportive tone, educational, warm color palette.
- **Accessible:** Radix UI primitives ensure proper accessibility.
- **Private:** Reassure users their data is safe and local.

### Key User Flows

#### Quick Logging Flow
1. Open app → Auto-loads to today's view.
2. One-tap period start/stop.
3. Optional: Quick symptom sliders (< 15 seconds).
4. Data saves automatically to the local database with visual confirmation.

#### Analysis Flow
1. Navigate to calendar view.
2. See cycle history and patterns.
3. View predictions for the next period.
4. Access detailed cycle insights.

### Performance Requirements
- **Initial Load:** < 1 second.
- **Offline Functionality:** 100% of features work offline.
- **PWA Score:** > 90 on Lighthouse.

## 5. Development Roadmap

### Priority 1: Core Foundation
**Essential infrastructure and basic functionality**

**Project Setup & Infrastructure**
- [ ] Initialize Vite + React project with pnpm.
- [ ] Set up TypeScript configuration.
- [ ] Configure Tailwind CSS + DaisyUI (Valentine theme).
- [ ] Configure ESLint + ESLint Stylistic.
- [ ] Set up GitHub Actions workflow for CI.

**Local Data Persistence**
- [ ] Set up Dexie.js and define IndexedDB schemas for cycles and symptoms.
- [ ] Create Zod schemas for all data models.
- [ ] Set up React Query client to interact with Dexie.js.
- [ ] Implement data access hooks (e.g., `useCycles`, `addCycleEntry`).
- [ ] Implement data import/export functionality.

**Core Period Tracking**
- [ ] Build the main UI for period start/stop functionality.
- [ ] Build the calendar view component using Radix UI Calendar.
- [ ] Implement cycle calculation logic.
- [ ] Connect UI to local data hooks with comprehensive error handling and loading states.

### Priority 2: User Experience Essentials
**Core features users need for basic functionality**

**Symptom Logging Interface**
- [ ] Create symptom logging interface with DaisyUI sliders.
- [ ] Implement 1-5 scale components with optimistic updates.
- [ ] Build a daily log view.
- [ ] Add notes and medication fields.

**Predictions & Basic Analytics**
- [ ] Implement a simple cycle prediction algorithm.
- [ ] Calculate and display average cycle length.
- [ ] Build prediction display components using DaisyUI cards.
- [ ] Implement error handling for insufficient data scenarios.

**PWA & Offline Capability**
- [ ] Implement a service worker with a comprehensive caching strategy.
- [ ] Add a web app manifest with theme assets and icons.
- [ ] Build UI indicators to encourage users to "install" the app.
- [ ] Test PWA functionality across major browsers.

### Priority 3: Polish & Enhancement
**Features that improve the experience but aren't essential for launch**

**UI/UX Polish & Accessibility**
- [ ] Implement a cohesive design system with the DaisyUI Valentine theme.
- [ ] Ensure responsive design using Tailwind breakpoints.
- [ ] Improve accessibility with Radix UI primitives.
- [ ] Add loading states, error handling, and user feedback animations.
- [ ] Test for keyboard navigation and screen reader compatibility.

**Content & Education**
- [ ] Create static FAQ content.
- [ ] Implement an educational section with DaisyUI collapse components.
- [ ] Write clear, empathetic error messages and user guidance.
- [ ] Build a simple onboarding flow explaining the privacy features.

## 6. Success Criteria

### Technical Success
- [ ] App loads in < 1 second.
- [ ] PWA score > 90.
- [ ] 100% offline functionality is flawless.
- [ ] Data persists correctly between sessions.
- [ ] Mobile-responsive design works on all major devices.

### User Experience Success
- [ ] Users can log their period in < 30 seconds.
- [ ] Predictions are reasonably accurate (within 2-3 days).
- [ ] The app feels fast and responsive.
- [ ] Users understand and trust the privacy model.
- [ ] The interface is intuitive and requires no training.

### Learning Objectives Success
- [ ] Solid understanding of building local-first, privacy-focused PWAs.
- [ ] Experience with IndexedDB and libraries like Dexie.js.
- [ ] Mastery of state management for local data with React Query.
- [ ] Clean, maintainable codebase.

## 7. Technical Considerations

### Project Structure (Modular DDD)
The project will follow a modular, domain-driven structure to ensure a clear separation of concerns and to make the codebase easier to maintain and scale. Logic is grouped by feature/domain rather than by file type.

```
periodos/
├── src/
│   ├── components/
│   │   └── ui/               # Shared, simple UI components (Button, Card, Input)
│   ├── features/             # Core application domains
│   │   ├── cycles/           # Domain: Everything related to period cycles
│   │   │   ├── components/   # React components specific to cycles (e.g., CalendarView)
│   │   │   ├── hooks/        # React hooks for cycle logic (e.g., useCyclePredictions)
│   │   │   ├── types.ts      # TypeScript types and Zod schemas for cycles
│   │   │   └── index.ts      # Public API for the 'cycles' module
│   │   ├── symptoms/         # Domain: Everything related to symptom logging
│   │   │   ├── components/   # (e.g., SymptomLogForm)
│   │   │   ├── hooks/
│   │   │   ├── types.ts
│   │   │   └── index.ts      # Public API for the 'symptoms' module
│   │   └── settings/         # Domain: Data import/export, themes, etc.
│   │       ├── components/   # (e.g., DataExportButton)
│   │       ├── hooks/
│   │       └── index.ts
│   ├── lib/
│   │   └── db.ts             # Dexie.js database definition and initialization
│   ├── pages/                # Top-level page components for routing
│   │   ├── HomePage.tsx
│   │   └── SettingsPage.tsx
│   ├── providers/            # Global context providers (React Query, Theme, etc.)
│   ├── types/                # Truly global types shared across all domains
│   └── main.tsx              # Application entry point
├── public/
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```
**Module Communication:**
- A feature module (e.g., `cycles`) should only expose what is necessary through its `index.ts` file.
- Other parts of the application (e.g., a page component or another feature) should only import from a module's `index.ts` file (`import { CalendarView } from '@/features/cycles';`).
- This prevents tight coupling and makes dependencies explicit.

### Code Style
To maintain a clean and readable codebase, the following styles are enforced:

-   **Import Aliases:** Always use non-relative import aliases for modules within the `src` directory. Use `@/` as the prefix for all imports referencing the `src` root.
    -   **Correct:** `import { MyComponent } from '@/components/MyComponent';`
    -   **Incorrect:** `import { MyComponent } from '../../components/MyComponent';`

### Security & Privacy
- **Primary Feature:** All user data is stored exclusively on the user's device in IndexedDB. It is never transmitted to any server.
- **Data Control:** The user has full control over their data, with clear options for export and deletion.
- **Dependencies:** Use well-maintained libraries and scan for vulnerabilities.
- **HTTPS:** The app will be served over HTTPS to protect it in transit from the host to the user.

### Scalability
- **Client-Side Performance:** Scalability is a matter of client-side performance. Efficient data queries with Dexie.js and optimized React rendering are key.
- **Storage Limits:** Be mindful of browser storage limits, though they are generous for this type of application. Implement checks if data grows unexpectedly large.

### Maintenance
- Clear code documentation and type safety with TypeScript and Zod.
- Automated testing pipeline for core logic (cycle calculations, data validation).
- Easy, one-command deployment process for the static site.

## 8. Future Considerations

### Phase 2+ Features
- Advanced fertility tracking.
- Community features (if a privacy-preserving model can be designed).
- Wearable device integration (via client-side APIs).
- AI-powered insights running locally in the browser (e.g., using TensorFlow.js).

### Monetization Options
- One-time purchase to unlock "Pro" features (e.g., advanced analytics, themes). This can be managed client-side without a server.
- The app will never monetize by selling user data.

### Privacy-Preserving Sync
- Explore options for opt-in, end-to-end encrypted data backup/sync using a user's own cloud storage (e.g., Google Drive, iCloud) via file-based import/export.

---

*This PRD serves as the foundation for building a delightful, fast, and reliable period tracking application that prioritizes user privacy and experience above all else.*