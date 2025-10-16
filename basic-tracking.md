# Feature Breakdown: Basic Period Tracking

This document outlines the technical requirements, to-do list, and acceptance criteria for implementing the core "Period Tracking" feature as defined in the Product Requirements Document (PRD).

## 1. Overview

The goal of this feature is to provide users with the essential tools to log their menstrual cycle and view their history. This is a foundational feature for the application and directly supports the core value proposition of fast, private, and simple tracking.

### Core Components:
- **Period Logging Interface:** A primary UI element allowing users to mark the start and end of their period with a single tap.
- **Flow Intensity Tracker:** A simple mechanism to log menstrual flow intensity on a 1-5 scale for each day of the period.
- **Calendar View:** A visual representation of the current month, showing past and present cycle data.

## 2. Technical & Product Context

This feature should be implemented following the architecture and principles laid out in the PRD.

- **Tech Stack:** Vite, React, TypeScript, TanStack Router.
- **Data Persistence:** All data will be stored locally in the browser's IndexedDB using **Dexie.js**. No data should ever be sent to a server.
- **State Management:** **TanStack Query** will be used to manage the state of local data, providing hooks to interact with the Dexie.js database.
- **Validation:** **Zod** schemas will be used to ensure type safety and validate all data before it is written to the database.
- **Styling:** The UI will be built with **Tailwind CSS** and the **DaisyUI (Valentine theme)**.
- **Project Structure:** The logic and components for this feature will reside within the `src/modules/cycles/` directory, following the modular Domain-Driven Design (DDD) approach.

## 3. Implementation To-Do List

### Data Layer (`src/modules/cycles/` & `src/lib/`)

-   [x] **Define Zod Schema:** Create a Zod schema in `src/modules/cycles/types.ts` for a single period log entry. It should include fields like `id` (auto-incrementing), `date` (ISO string or Date object), `type` ('periodDay'), and `flowIntensity` (a number from 1 to 5).
-   [x] **Update Dexie.js Schema:** In `src/lib/db.ts`, define a `cycles` table in the Dexie schema that corresponds to the Zod schema.
-   [x] **Create Data Hooks:** In `src/modules/cycles/hooks/`, implement TanStack Query hooks for all database interactions:
    -   `useCycleLogs()`: Fetches all cycle logs.
    -   `useAddCycleLog()`: A mutation hook to add a new period day entry.
    -   `useUpdateCycleLog()`: A mutation hook to update an existing entry (e.g., change flow intensity).
    -   `useDeleteCycleLog()`: A mutation hook to remove an entry.

### UI Components (`src/modules/cycles/components/`)

-   [x] **Build `PeriodLoggingCard` Component:**
    -   This component will be the primary interaction point on the home page.
    -   It should display the current date.
    -   It must contain a primary button that intelligently toggles between "Start Period" and "End Period" based on the current cycle state.
    -   When a period is active for the current day, it should display a `FlowIntensitySlider` component.
-   [x] **Build `FlowIntensitySlider` Component:**
    -   A simple component using a DaisyUI `range` slider or `rating` input for selecting a value from 1 to 5.
    -   It should optimistically update the UI and use the `useUpdateCycleLog` hook to persist the change.
-   [x] **Build `CalendarView` Component:**
    -   Display a full month calendar.
    -   Use the `useCycleLogs` hook to fetch all period data.
    -   Render days with a special background color or indicator if they are marked as a period day.
    -   The current day should be visually highlighted.

### Business Logic & Integration

-   [x] **Cycle State Logic:** Implement logic (e.g., in a hook like `useCycleState`) that determines if the user's period is currently active based on the data from `useCycleLogs`. This will control the state of the `PeriodLoggingCard` button.
-   [x] **Connect UI to Hooks:** Integrate the data hooks into the React components, ensuring that loading states, error states, and data are handled correctly.
-   [x] **Page Integration:** Add the `PeriodLoggingCard` and `CalendarView` components to the main `HomePage.tsx`.

## 4. Acceptance Criteria

### AC 1: Logging a Period
-   **GIVEN** the user opens the app and is not on their period.
-   **WHEN** they tap the "Start Period" button.
-   **THEN** today's date is saved as a period day in the local database.
-   **AND** the UI updates to show the period is active, displaying the "End Period" button and the flow intensity tracker.

### AC 2: Logging Flow Intensity
-   **GIVEN** the user's period is currently active.
-   **WHEN** they select a flow intensity level (1-5) for the current day.
-   **THEN** the selected intensity is saved for that day's log in the database.
-   **AND** the UI instantly reflects the selected level.

### AC 3: Ending a Period
-   **GIVEN** the user's period is currently active.
-   **WHEN** they tap the "End Period" button.
-   **THEN** the cycle is considered ended (no new period days are automatically logged on subsequent days).
-   **AND** the main button reverts to "Start Period".

### AC 4: Viewing Cycle History
-   **GIVEN** the user has logged period data in the past.
-   **WHEN** they view the `CalendarView` component.
-   **THEN** all previously logged period days are clearly marked on the calendar.

### AC 5: Data Persistence and Offline Capability
-   **GIVEN** the user has logged any cycle data.
-   **WHEN** they close and re-open the browser tab or app.
-   **THEN** all their data is immediately available and displayed correctly.
-   **AND** all the above actions (starting, ending, logging flow) work perfectly without an internet connection.

## 5. Testing Strategy

To ensure the feature is robust, reliable, and bug-free, we will use end-to-end testing with Playwright.

### End-to-End (E2E) Testing with Playwright (`/tests/`)

E2E tests will simulate a complete user journey to validate the entire feature works as a whole.

-   [ ] **Test: Full Period Logging Flow**
    -   **Objective:** Verify a user can successfully log a full period cycle from start to finish.
    -   **Steps:**
        1.  Navigate to the application's home page.
        2.  Assert that the "Start Period" button is visible.
        3.  Click the "Start Period" button.
        4.  Assert that the UI updates to the "active period" state (shows "End Period" button and flow slider).
        5.  Interact with the flow intensity slider and select a value.
        6.  Reload the page and assert that the "active period" state persists, confirming data was saved to IndexedDB.
        7.  Check the `CalendarView` and assert that the current day is highlighted as a period day.
        8.  Click the "End Period" button.
        9.  Assert that the UI returns to the "period not active" state.