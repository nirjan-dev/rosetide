import { expect, test } from '@playwright/test';

test.describe('Basic Period Tracking Feature', () => {
  // Before each test, we clear the IndexedDB to ensure a clean state.
  // This is crucial for test isolation and reliability.
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(async () => {
      const databases = await window.indexedDB.databases();
      await Promise.all(
        databases
          .map((db) => db.name)
          .filter((name): name is string => !!name)
          .map((name) => window.indexedDB.deleteDatabase(name)),
      );
    });
    // Reload the page after clearing the database to ensure the app starts fresh
    await page.reload();
  });

  test('should allow a user to log a full period cycle from start to finish', async ({
    page,
  }) => {
    await page.goto('/');

    // We use a case-insensitive regex to make the selector more resilient.
    const startButton = page.getByRole('button', { name: /start period/i });
    await expect(startButton).toBeVisible();

    await startButton.click();

    // This means the "End Period" button and the flow slider should now be visible.
    const endButton = page.getByRole('button', { name: /end period/i });
    await expect(endButton).toBeVisible();

    const flowSlider3Input = page.getByLabel('3 out of 5');
    await expect(flowSlider3Input).toBeVisible();

    // We'll set the value to 3, which represents a medium flow.
    await flowSlider3Input.click()
    await expect(flowSlider3Input).toBeChecked()

    // This confirms that the data was successfully saved to IndexedDB.
    await page.reload();
    await expect(endButton).toBeVisible();
    await expect(flowSlider3Input).toBeChecked();



    await endButton.click();
    // The "Start Period" button should be visible again.
    await expect(startButton).toBeVisible();
    // The "End Period" button should no longer be in the DOM.
    await expect(endButton).not.toBeVisible();
  });
});
