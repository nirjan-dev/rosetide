# Core Period Tracking Feature - Implementation Task

## Requirements

The core period tracking feature allows users to log their menstrual periods with start/stop functionality and view their period history. This is a simplified version focusing on the essential logging experience.

### Functional Requirements
1. Users can start a new period with a single tap
2. Users can stop an ongoing period with a single tap
3. Users can view a list of their past periods (start date, end date, duration)
4. The system calculates and displays basic cycle information

### Non-functional Requirements
1. Fast interaction - period logging should take < 30 seconds
2. Type-safe API communication between frontend and backend
3. Responsive design that works on mobile and desktop
4. Accessible UI components

## User Flow

1. User opens the app and lands on the period tracking page
2. User sees a prominent "Start Period" button if no period is currently active
3. User taps "Start Period" to log today as the start of their period
4. On subsequent visits, if a period is active, user sees "End Period" button
5. User taps "End Period" to mark today as the end of their current period
6. User can view a simple list of past periods with start date, end date, and duration

## Tech Choices

### Frontend
- **Framework:** React with TypeScript
- **State Management:** React Query (TanStack Query) for data fetching and mutations
- **UI Components:** DaisyUI with Valentine theme for styling
- **API Communication:** Hono RPC client

### Backend
- **Framework:** Hono with TypeScript
- **Database:** Turso (SQLite)
- **ORM:** Drizzle ORM
- **API Structure:** Hono RPC routes

## Code Organization

### Frontend Structure
```
packages/frontend/src/
├── components/
│   └── PeriodTracker/
│       ├── PeriodTracker.tsx (main component)
│       └── PeriodButton.tsx (start/stop button)
├── hooks/
│   └── usePeriodTracking.ts (custom hook for period tracking logic)
└── lib/
    └── hono-client.ts (Hono RPC client setup)
```

### Backend Structure
```
packages/backend/src/
├── routes/
│   └── period-tracker.ts (Hono RPC routes for period tracking)
└── lib/
    ├── period-calculations.ts (cycle calculation logic)
    └── db/
        ├── schema.ts (Drizzle schema for period tracking)
        └── queries.ts (database queries for period data)
```

## Business Rules

1. A user can only have one active period at a time
2. Periods must have a start date and can optionally have an end date
3. Cycle length is calculated from the start date of one period to the start date of the next
4. Users can only start a new period if they don't currently have an active one
5. Users can only end a period if they currently have an active one
6. Period duration is calculated as the number of days between start and end dates (inclusive)

## Implementation Notes

1. **Type Safety:** Use Hono RPC's generated types for API communication
2. **Error Handling:** Implement comprehensive error handling for validation errors and database issues
3. **Loading States:** Show appropriate loading indicators during data fetching and mutations
4. **Accessibility:** Ensure the start/stop button is accessible with proper ARIA attributes
5. **Visual Design:** Follow the Valentine theme with warm pink/red colors for period-related UI elements
6. **Data Display:** Show past periods in a simple list format with clear date information

## Step-by-Step Implementation Todo List

### Phase 1: Database Schema and Queries
1. Create Drizzle schema for period tracking in `packages/backend/src/lib/db/schema.ts`
   - Define period table with id, userId, startDate, endDate, createdAt, updatedAt
2. Create database migration files for the new schema
3. Implement database queries in `packages/backend/src/lib/db/queries.ts`
   - CRUD operations for periods
   - Query for user's period history ordered by start date

### Phase 2: API Routes
1. Implement Hono RPC routes in `packages/backend/src/routes/period-tracker.ts`
   - createPeriod (starts a new period)
   - updatePeriod (ends current period)
   - getPeriods (fetches user's period history)

### Phase 3: Frontend Implementation
1. Set up Hono RPC client in `packages/frontend/src/lib/hono-client.ts`
2. Create custom hook `packages/frontend/src/hooks/usePeriodTracking.ts`
   - Implement React Query hooks for period data fetching
   - Implement mutations for starting/stopping periods
3. Create PeriodTracker component in `packages/frontend/src/components/PeriodTracker/PeriodTracker.tsx`
   - Fetch and display list of past periods
   - Determine if user has active period
4. Create PeriodButton component in `packages/frontend/src/components/PeriodTracker/PeriodButton.tsx`
   - Show "Start Period" or "End Period" based on current state
   - Handle button click with appropriate mutation
