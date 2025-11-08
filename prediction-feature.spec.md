# Feature Spec: Next Period Prediction

## 1. Overview

**Feature:** Next Period Prediction
**Module:** `periods` (formerly `cycles`)
**Priority:** High (MVP Essential)
**Summary:** This feature calculates and displays the predicted start date of the user's next menstrual period based on their logged historical data. It will also show the average cycle length and provide a simple indicator of the prediction's confidence, as outlined in the Product Requirements Document.

## 2. User Stories

- **As a user, I want to see an estimate of when my next period will start so I can be prepared.**
- **As a new user, I want to understand that the app needs a few periods of data before it can make accurate predictions.**
- **As a user with irregular cycles, I want to know if the prediction is less likely to be accurate so I can manage my expectations.**

## 3. Functional Requirements & Prediction Logic

### 3.1. Prediction Algorithm

The prediction for the next period's start date will be calculated using a simple average of the user's past cycle lengths.

1.  **Collect Historical Data:** Fetch all completed periods from the `periods` table in IndexedDB. A completed period is one that has both a `startDate` and an `endDate`.
2.  **Calculate Cycle Lengths:** A single "cycle length" is the number of days from the `startDate` of one period to the day *before* the `startDate` of the next consecutive period.
3.  **Calculate Average Cycle Length:** Sum the lengths of all available past cycles and divide by the number of cycles. The result should be rounded to the nearest whole number.
4.  **Predict Next Start Date:** The predicted start date is calculated by adding the `average cycle length` (in days) to the `startDate` of the most recent logged period.

**Formula:**
`predictedStartDate = lastPeriod.startDate + averageCycleLengthInDays`

### 3.2. Data Requirements

- A minimum of **two** completed periods is required to calculate the first average cycle length and make a prediction.
- A "completed period" is defined as a record in the `periods` table with a non-null `startDate` and `endDate`.

### 3.3. Edge Cases & Error Handling

- **Insufficient Data:** If fewer than two completed periods are available, the UI should not display a prediction. Instead, it should show a message guiding the user to log more periods.
    - *Example Message:* "Log at least two full periods to see your next period prediction."
- **Ongoing Period:** The current, ongoing period (where `endDate` is `null`) is not used in the average length calculation, but its `startDate` is the baseline for predicting the *next* period.

### 3.4. Confidence Indicators

A simple confidence level will be displayed based on the amount of data available.

- **Low Confidence:** 2-3 completed periods logged.
- **Medium Confidence:** 4-6 completed periods logged.
- **High Confidence:** 7+ completed periods logged.

This is a proxy for confidence, as it doesn't account for variance in cycle length. More complex variance-based indicators are deferred to a post-MVP phase.

## 4. UI/UX Design

### 4.1. Display Component

- The prediction will be displayed prominently on the main dashboard/home screen.
- A `DaisyUI Card` component will be used to contain the prediction information.
- The card will display:
    1.  **Predicted Date:** The primary piece of information (e.g., "Around June 25th").
    2.  **Countdown:** A relative time until the predicted date (e.g., "In 10 days").
    3.  **Average Cycle Length:** "Based on an average cycle of 28 days."
    4.  **Confidence Indicator:** A simple text label (e.g., "Confidence: Medium").

### 4.2. Mockup

```
+----------------------------------------+
|                                        |
|   Your Next Period is Predicted        |
|   Around...                            |
|                                        |
|   June 25th, 2024                      |
|   (In 10 days)                         |
|                                        |
|   ------------------------------------ |
|   Avg. Cycle: 28 days | Confidence: Med|
|                                        |
+----------------------------------------+
```

### 4.3. Insufficient Data State

```
+----------------------------------------+
|                                        |
|   Ready for Your First Prediction?     |
|                                        |
|   Log at least two full periods to     |
|   unlock your next period prediction.  |
|                                        |
|   [ Log a Past Period ] button         |
|                                        |
+----------------------------------------+
```

## 5. Technical Implementation Plan

**Prerequisite: Data Model Refactoring**

Before implementing the prediction logic, the core data model needs a semantic update to avoid confusion. The term "Cycle" should refer to the calculated duration between periods, not the logged period itself.

-   [x] **Rename DB Table:** In Dexie schema (`lib/db.ts`), rename the `cycles` table to `periods`.
-   [x] **Update Foreign Key:** Rename the `cycleId` foreign key in the `periodDays` table to `periodId`.
-   [x] **Update Module Name:** Rename the feature module directory from `src/modules/cycles` to `src/modules/periods`.
-   [x] **Update Hooks & Types:** Rename all related types and hooks (e.g., `Cycle` -> `Period`, `useAllCycles` -> `useAllPeriods`). This is a project-wide find-and-replace task.

---

**Implementation Steps**

1.  **Analytics Hook (`usePredictionAnalytics`):**
    - Create a new hook within `src/modules/periods/hooks/`.
    - This hook will use the refactored `useAllPeriods` hook to fetch all period data from Dexie via TanStack Query.
    - It will be responsible for memoizing the calculation of cycle lengths, average cycle length, and the predicted next start date.
    - It should return a clean API for the UI, such as:
        ```typescript
        {
          predictedStartDate: Date | null;
          averageCycleLength: number | null;
          confidenceLevel: 'low' | 'medium' | 'high' | null;
          isLoading: boolean;
          error: Error | null;
          hasSufficientData: boolean;
        }
        ```

2.  **Calculation Logic (`calculatePeriodAnalytics`):**
    - Create a pure utility function in a new `src/modules/periods/utils.ts` file.
    - This function will take an array of `Period` objects (the refactored type) as input.
    - It will perform the logic described in section 3.1 and return the calculated analytics. The `usePredictionAnalytics` hook will call this function.

3.  **UI Component (`PredictionCard.tsx`):**
    - Create a new component in `src/modules/periods/components/`.
    - This component will call the `usePredictionAnalytics` hook.
    - It will conditionally render either the prediction card or the "insufficient data" message based on the `hasSufficientData` flag from the hook.
    - It will handle the formatting of dates and display of the confidence level.

## 6. Acceptance Criteria

- [ ] When the app has fewer than two completed periods logged, a message is shown prompting the user to log more data.
- [ ] No prediction date is displayed when there is insufficient data.
- [ ] When two or more completed periods are logged, the prediction card is displayed.
- [ ] The average cycle length is calculated correctly as the mean of all completed cycle lengths.
- [ ] The predicted start date is calculated correctly by adding the average cycle length to the start date of the most recent period.
- [ ] The confidence level correctly reflects the number of logged periods (Low: 2-3, Medium: 4-6, High: 7+).
- [ ] The UI component correctly displays all required information: predicted date, countdown, average length, and confidence.
- [ ] The calculations are updated automatically when a new period is completed or an existing period is modified/deleted.