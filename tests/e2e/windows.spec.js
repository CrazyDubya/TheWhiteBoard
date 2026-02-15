import { test, expect } from '@playwright/test';

test.describe('Floating Windows', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.evaluate(() => localStorage.clear());
    });

    test('should open shared files panel', async ({ page }) => {
        const sharedFilesBtn = page.locator('button:has-text("Shared Files")');
        await sharedFilesBtn.click();

        const sharedFilesPanel = page.locator('#shared-files-panel');
        await expect(sharedFilesPanel).toBeVisible();
    });

    test('should add a shared file', async ({ page }) => {
        // Open shared files panel
        await page.locator('button:has-text("Shared Files")').click();

        // Add a file
        const fileInput = page.locator('#file-name-input');
        const addFileBtn = page.locator('#add-file-btn');

        await fileInput.fill('test-file.txt');
        await addFileBtn.click();

        // Verify file appears
        const fileItem = page.locator('.file-item');
        await expect(fileItem).toBeVisible();
        await expect(fileItem).toContainText('test-file.txt');
    });

    test('should open file in floating window', async ({ page }) => {
        await page.locator('button:has-text("Shared Files")').click();

        // Add a file
        await page.locator('#file-name-input').fill('doc.txt');
        await page.locator('#add-file-btn').click();

        // Open the file
        const fileItem = page.locator('.file-item');
        await fileItem.click();

        // Verify floating window opens
        const floatingWindow = page.locator('.floating-window');
        await expect(floatingWindow).toBeVisible();
        await expect(floatingWindow).toContainText('doc.txt');
    });

    test('should close floating window', async ({ page }) => {
        await page.locator('button:has-text("Shared Files")').click();
        await page.locator('#file-name-input').fill('temp.txt');
        await page.locator('#add-file-btn').click();
        await page.locator('.file-item').click();

        // Verify window is open
        const floatingWindow = page.locator('.floating-window');
        await expect(floatingWindow).toBeVisible();

        // Close the window
        const closeBtn = floatingWindow.locator('.window-close');
        await closeBtn.click();

        // Verify window is closed
        await expect(floatingWindow).not.toBeVisible();
    });

    test('should minimize and restore window', async ({ page }) => {
        await page.locator('button:has-text("Shared Files")').click();
        await page.locator('#file-name-input').fill('minimized.txt');
        await page.locator('#add-file-btn').click();
        await page.locator('.file-item').click();

        const floatingWindow = page.locator('.floating-window');
        const minimizeBtn = floatingWindow.locator('.window-minimize');

        // Minimize
        await minimizeBtn.click();
        await expect(floatingWindow).toHaveClass(/minimized/);

        // Restore
        await minimizeBtn.click();
        await expect(floatingWindow).not.toHaveClass(/minimized/);
    });

    test('should create multiple windows', async ({ page }) => {
        await page.locator('button:has-text("Shared Files")').click();

        // Add and open multiple files
        await page.locator('#file-name-input').fill('file1.txt');
        await page.locator('#add-file-btn').click();

        await page.locator('#file-name-input').fill('file2.txt');
        await page.locator('#add-file-btn').click();

        // Open both files
        const fileItems = page.locator('.file-item');
        await fileItems.nth(0).click();
        await fileItems.nth(1).click();

        // Verify two windows exist
        const windows = page.locator('.floating-window');
        await expect(windows).toHaveCount(2);
    });
});
