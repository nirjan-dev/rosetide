# Task: Add Vitest Testing to Hono Backend

This document outlines the tasks and sub-tasks required to implement a robust testing suite for the Hono backend using Vitest. The primary goals are to set up the testing infrastructure and then write comprehensive tests for the `period-tracker` module.

## Backend Project Structure

The backend project is structured as a typical Node.js/TypeScript application. Understanding this structure is key to placing tests and mocks correctly.

-   `src/index.ts`: The main application entry point where the Hono server is initialized.
-   `src/lib/`: Contains shared libraries and utilities.
    -   `src/lib/db/index.js`: Manages database connections. This will be a key file to handle for switching to a test database.
    -   `src/lib/period-calculations.js`: Contains business logic for period calculations.
-   `src/middleware/`: Contains Hono middleware.
    -   `src/middleware/auth-guard.js`: Protects routes and provides the authenticated user. This will need to be mocked during tests.
-   `src/modules/`: Contains the core feature modules of the application.
    -   `src/modules/period-tracker/`: The first module to be tested.
        -   `routes.ts`: Defines the API routes for period tracking.
        -   `db/period-tracker-queries.js`: Contains the database queries for the module.
-   `src/types/`: Contains shared TypeScript types and interfaces.
Note: the backend is in the apps/backend folder from the root. It's using pnpm workspaces to manage the backend and the frontend in a monorepo. When running installation or script commands please make sure it works for the pnpm monorepo and use appropriate pnpm --filter commands to run it for the backend project.
---

## Phase 1: Test Infrastructure Setup

This phase focuses on installing and configuring all the necessary tools and utilities to enable testing.

### Sub-task 1: Install Dependencies

Add Vitest and any necessary helper libraries for HTTP testing and mocking.

```bash
npm install -D vitest @vitest/coverage-v8 supertest
```

-   `vitest`: The testing framework.
-   `@vitest/coverage-v8`: For generating code coverage reports.
-   `supertest`: A library for making HTTP requests to the Hono app in a test environment.

### Sub-task 2: Configure Vitest

Create a `vitest.config.ts` file in the root of the `apps/backend` project to configure the test environment.

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
```

Also, add a `test` script to `package.json`.

```json
// package.json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "coverage": "vitest run --coverage"
}
```

### Sub-task 3: Test Database Management

We need a separate database for running tests to isolate them from development and production data.

1.  **Environment Configuration**: Use environment variables to specify the test database connection string. Create a `.env.test` file.

    ```
    # .env.test
    DATABASE_URL="file:./test.db"
    ```

2.  **Update Database Logic**: Modify the `getDB` function in `src/lib/db/index.js` to use the test database when the environment is `test`. Vitest automatically sets `process.env.NODE_ENV` to `test`.

3.  **Database Migrations**: Ensure the migration works properly with the existing setup (the server runs the migration on startup). If that doesn't work then we might need a script to apply the database schema to the test database before tests run. We can add a script to `package.json`.

    ```json
    // package.json
    "scripts": {
      "test:migrate": "dotenv -e .env.test -- drizzle-kit push:sqlite"
    }
    ```
    This can be called in a global setup file for Vitest if needed.

### Sub-task 4: Database Seeding for Tests

Tests require a consistent starting state. We need to create utilities to seed the test database.

1.  **Create a Seeding Utility**: Create a file, e.g., `src/lib/db/seed.ts`, that can clear the database and insert test data, like a specific test user.

2.  **Integrate with Tests**: Use Vitest's `beforeEach` or `beforeAll` hooks within test files to call the seeding utility, ensuring each test or test suite runs against a clean, predictable database state.

---

## Phase 2: Writing Tests

With the infrastructure in place, we can now write the actual tests. Tests should be located next to the file they are testing, using a `.spec.ts` or `.test.ts` suffix (e.g., `routes.spec.ts` alongside `routes.ts`).

### Sub-task 1: Test `period-tracker/routes.ts`

Create `src/modules/period-tracker/routes.spec.ts`. The main challenge here will be to properly instantiate the Hono app and mock the `authGuard` middleware to provide a test user.

**Testing Strategy:**

-   Import the `periodTrackerRoute` Hono instance.
-   In the test setup, create a new main Hono app and mount the `periodTrackerRoute` onto it.
-   Create a mock `authGuard` that directly calls the next middleware and sets a mock user in the context (`c.set('user', testUser)`).
-   Use `supertest` to send requests to the app instance and assert the responses.

#### Test Cases to Implement:

-   **`POST /` - Create a new period**
    -   `[SUCCESS]` Should create a new period for the authenticated user and return a 201 status code.
    -   `[FAILURE]` Should return a 400 error if the user already has an active period.

-   **`PUT /end` - End the current period**
    -   `[SUCCESS]` Should update the `endDate` of the active period and return a 200 status code.
    -   `[FAILURE]` Should return a 400 error if there is no active period to end.

-   **`GET /` - Get all periods**
    -   `[SUCCESS]` Should return a list of all periods for the authenticated user, including calculated cycle info and average cycle length.
    -   `[SUCCESS]` Should return an empty array if the user has no periods.

-   **`GET /active` - Get the active period**
    -   `[SUCCESS]` Should return the currently active period with its cycle info.
    -   `[SUCCESS]` Should return a `period` property of `null` if no active period is found.
