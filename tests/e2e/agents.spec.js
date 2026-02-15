import { test, expect } from '@playwright/test';

test.describe('Agents Management', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Clear localStorage to start fresh
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        await page.waitForLoadState('networkidle');
    });

    test('should open agents panel', async ({ page }) => {
        const agentsBtn = page.locator('button:has-text("Agents")');
        await agentsBtn.click();

        const agentsPanel = page.locator('#agents-panel');
        await expect(agentsPanel).toBeVisible();
    });

    test('should show empty state message', async ({ page }) => {
        // Open agents panel
        await page.locator('button:has-text("Agents")').click();

        const agentsList = page.locator('#agents-list');
        await expect(agentsList).toContainText('No agents yet');
    });

    test('should add a new agent', async ({ page }) => {
        // Open agents panel
        await page.locator('button:has-text("Agents")').click();

        // Add agent
        const nameInput = page.locator('#agent-name-input');
        const addButton = page.locator('#add-agent-btn');

        await nameInput.fill('Test Agent');
        await addButton.click();

        // Verify agent appears in list
        const agentItem = page.locator('.agent-item');
        await expect(agentItem).toBeVisible();
        await expect(agentItem).toContainText('Test Agent');
    });

    test('should add multiple agents', async ({ page }) => {
        await page.locator('button:has-text("Agents")').click();

        // Add first agent
        await page.locator('#agent-name-input').fill('Agent 1');
        await page.locator('#add-agent-btn').click();

        // Add second agent
        await page.locator('#agent-name-input').fill('Agent 2');
        await page.locator('#add-agent-btn').click();

        // Verify both agents exist
        const agentItems = page.locator('.agent-item');
        await expect(agentItems).toHaveCount(2);
    });

    test('should persist agents after reload', async ({ page }) => {
        await page.locator('button:has-text("Agents")').click();

        // Add an agent
        await page.locator('#agent-name-input').fill('Persistent Agent');
        await page.locator('#add-agent-btn').click();

        // Reload page
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Open agents panel again
        await page.locator('button:has-text("Agents")').click();

        // Verify agent still exists
        const agentItem = page.locator('.agent-item');
        await expect(agentItem).toContainText('Persistent Agent');
    });

    test('should remove an agent', async ({ page }) => {
        await page.locator('button:has-text("Agents")').click();

        // Add an agent
        await page.locator('#agent-name-input').fill('To Be Removed');
        await page.locator('#add-agent-btn').click();

        // Wait for agent to appear
        await expect(page.locator('.agent-item')).toBeVisible();

        // Remove the agent
        const removeBtn = page.locator('.agent-remove-btn');
        await removeBtn.click();

        // Verify agent is removed
        await expect(page.locator('.agent-item')).not.toBeVisible();
        await expect(page.locator('#agents-list')).toContainText('No agents yet');
    });

    test('should view agent workspace', async ({ page }) => {
        await page.locator('button:has-text("Agents")').click();

        // Add an agent
        await page.locator('#agent-name-input').fill('Workspace Agent');
        await page.locator('#add-agent-btn').click();

        // Click view button
        const viewBtn = page.locator('.agent-view-btn');
        await viewBtn.click();

        // Verify floating window appears
        const floatingWindow = page.locator('.floating-window');
        await expect(floatingWindow).toBeVisible();
        await expect(floatingWindow).toContainText('Workspace Agent');
    });
});
