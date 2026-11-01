import { expect, test } from '@playwright/test';

test.describe('Basic Period Tracking Feature', () => {
  // Before each test, we clear the IndexedDB to ensure a clean state.
  // This is crucial for test isolation and reliability.
  test.beforeEach(async ({ page }) => {
    await page.goto('/app');
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
    await page.goto('/app');

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

  test('should show an "insufficient data" message when there are less than two periods', async ({
    page,
  }) => {
    await page.goto('/app');

    // Check for the "insufficient data" message.
    const insufficientDataMessage = page.getByText(
      'Log at least two full periods to see your next period prediction.',
    );
    await expect(insufficientDataMessage).toBeVisible();
  });

  test('should cancel a same-day period without leaving records after reload', async ({
    page,
  }) => {
    await page.goto('/app');
    const startButton = page.getByRole('button', { name: /start period/i });
    await startButton.click();
    await page.getByRole('button', { name: /cancel period/i }).click();
    await expect(startButton).toBeVisible();
    await page.reload();
    await expect(startButton).toBeVisible();

    const counts = await page.evaluate(async () => {
      const openRequest = window.indexedDB.open('periodos_db');
      const database = await new Promise<IDBDatabase>((resolve, reject) => {
        openRequest.onsuccess = () => resolve(openRequest.result);
        openRequest.onerror = () => reject(openRequest.error);
      });
      const readAll = (store: string) =>
        new Promise<Array<unknown>>((resolve, reject) => {
          const transaction = database.transaction(store, 'readonly');
          const request = transaction.objectStore(store).getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      const periods = await readAll('periods');
      const days = await readAll('periodDays');
      database.close();
      return { periods: periods.length, days: days.length };
    });
    expect(counts).toEqual({ periods: 0, days: 0 });
  });

  test('should recover records saved by older versions instead of deleting them', async ({
    page,
  }) => {
    // The landing page never opens the tracker database, so legacy data can be seeded there.
    await page.goto('/');
    await page.evaluate(async () => {
      const databases = await window.indexedDB.databases();
      for (const { name } of databases) {
        if (!name) continue;
        await new Promise((resolve) => {
          const request = window.indexedDB.deleteDatabase(name);
          request.onsuccess = request.onerror = request.onblocked = resolve;
        });
      }
      const open = (name: string, upgrade: (database: IDBDatabase) => void) =>
        new Promise<IDBDatabase>((resolve, reject) => {
          const request = window.indexedDB.open(name, 10);
          request.onupgradeneeded = () => upgrade(request.result);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      const add = (database: IDBDatabase, store: string, rows: Array<object>) =>
        new Promise((resolve, reject) => {
          const transaction = database.transaction(store, 'readwrite');
          rows.forEach((row) => transaction.objectStore(store).add(row));
          transaction.oncomplete = resolve;
          transaction.onerror = () => reject(transaction.error);
        });

      // Oct 22 - Nov 8 2025 shape: `cycles` + `periodDays.cycleId`.
      const current = await open('periodos_db', (database) => {
        const cycles = database.createObjectStore('cycles', { keyPath: 'id', autoIncrement: true });
        cycles.createIndex('startDate', 'startDate');
        cycles.createIndex('endDate', 'endDate');
        const days = database.createObjectStore('periodDays', { keyPath: 'id', autoIncrement: true });
        days.createIndex('cycleId', 'cycleId');
        days.createIndex('date', 'date');
      });
      await add(current, 'cycles', [{ startDate: new Date(2025, 9, 23), endDate: new Date(2025, 9, 27) }]);
      await add(current, 'periodDays', [{ cycleId: 1, date: new Date(2025, 9, 23), flowIntensity: 3 }]);
      current.close();

      // Oct 16 - 22 2025 shape: separate "Database", one row per logged day.
      const earliest = await open('Database', (database) => {
        database.createObjectStore('cycles', { keyPath: 'id', autoIncrement: true }).createIndex('date', 'date');
      });
      await add(earliest, 'cycles', [
        { date: new Date(2025, 8, 25), type: 'periodDay', flowIntensity: 2, isEnded: false },
        { date: new Date(2025, 8, 27), type: 'periodDay', flowIntensity: 1, isEnded: true },
      ]);
      earliest.close();
    });

    await page.goto('/app');
    await page.getByRole('tab', { name: 'History' }).click();
    await expect(page.getByText('October 23, 2025')).toBeVisible();
    await expect(page.getByText('October 27, 2025')).toBeVisible();
    await expect(page.getByText('September 25, 2025')).toBeVisible();
    await expect(page.getByText('September 27, 2025')).toBeVisible();

    // The original records are kept as a backup, not deleted.
    const backupStores = await page.evaluate(
      () =>
        new Promise<Array<string>>((resolve, reject) => {
          const request = window.indexedDB.open('periodos_db');
          request.onsuccess = () => {
            resolve([...request.result.objectStoreNames]);
            request.result.close();
          };
          request.onerror = () => reject(request.error);
        }),
    );
    expect(backupStores).toContain('cycles');
  });
});
