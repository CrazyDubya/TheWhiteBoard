import { test, expect } from '@playwright/test';

test.describe('Whiteboard Drawing', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('should load the whiteboard application', async ({ page }) => {
        await expect(page).toHaveTitle(/WhiteBoard/);
        await expect(page.locator('h1')).toContainText('The WhiteBoard');
    });

    test('should display toolbar with drawing tools', async ({ page }) => {
        const toolbar = page.locator('#toolbar');
        await expect(toolbar).toBeVisible();

        // Check for key tools
        await expect(page.locator('#tool-select')).toBeVisible();
        await expect(page.locator('#tool-draw')).toBeVisible();
        await expect(page.locator('#tool-text')).toBeVisible();
        await expect(page.locator('#tool-rect')).toBeVisible();
        await expect(page.locator('#tool-circle')).toBeVisible();
    });

    test('should switch between drawing tools', async ({ page }) => {
        const drawTool = page.locator('#tool-draw');
        const panTool = page.locator('#tool-pan');

        // Click draw tool
        await drawTool.click();
        await expect(drawTool).toHaveClass(/active/);

        // Click pan tool
        await panTool.click();
        await expect(panTool).toHaveClass(/active/);
        await expect(drawTool).not.toHaveClass(/active/);
    });

    test('should display canvas element', async ({ page }) => {
        const canvas = page.locator('#whiteboard');
        await expect(canvas).toBeVisible();

        // Check canvas is actually a canvas element
        const tagName = await canvas.evaluate((el) => el.tagName);
        expect(tagName).toBe('CANVAS');
    });

    test('should show color picker', async ({ page }) => {
        const colorInput = page.locator('#color-picker');
        await expect(colorInput).toBeVisible();
        await expect(colorInput).toHaveAttribute('type', 'color');
    });

    test('should show brush size slider', async ({ page }) => {
        const brushSize = page.locator('#brush-size');
        await expect(brushSize).toBeVisible();
        await expect(brushSize).toHaveAttribute('type', 'range');
    });

    test('should display zoom controls', async ({ page }) => {
        const zoomIn = page.locator('#zoom-in');
        const zoomOut = page.locator('#zoom-out');

        await expect(zoomIn).toBeVisible();
        await expect(zoomOut).toBeVisible();
    });

    test('should have screenshot button', async ({ page }) => {
        const screenshotBtn = page.locator('#screenshot-btn');
        await expect(screenshotBtn).toBeVisible();
    });
});
