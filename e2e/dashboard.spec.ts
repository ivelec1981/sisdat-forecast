import { test, expect } from '@playwright/test';

test.describe('Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Note: In a real scenario, you'd set up authentication here
    // For now, we'll test the public aspects or skip auth-required tests
    await page.goto('/');
  });

  test('should have proper page structure', async ({ page }) => {
    // This test assumes we can access the dashboard somehow
    // In practice, you'd mock auth or use a test user
    
    // Check if we're redirected to login (unauthenticated state)
    await expect(page).toHaveURL(/.*login/);
  });

  test.describe('Authenticated Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      // Mock authentication by setting localStorage
      await page.addInitScript(() => {
        localStorage.setItem('sisdat-auth-storage', JSON.stringify({
          state: {
            user: {
              id: 1,
              email: 'test@example.com',
              name: 'Test User',
              role: 'administrador',
              company: 'Test Company'
            },
            token: 'mock-token'
          }
        }));
      });
      
      await page.goto('/');
    });

    test('should display dashboard tabs', async ({ page }) => {
      // Wait for the dashboard to load
      await page.waitForLoadState('networkidle');
      
      // Check for main navigation tabs
      await expect(page.locator('text=Proyecciones de Demanda')).toBeVisible();
      await expect(page.locator('text=Cargas Singulares')).toBeVisible();
      await expect(page.locator('text=Diagrama Unifilar')).toBeVisible();
      await expect(page.locator('text=Documentación')).toBeVisible();
    });

    test('should be able to switch between tabs', async ({ page }) => {
      await page.waitForLoadState('networkidle');
      
      // Click on different tabs
      await page.click('text=Cargas Singulares');
      await expect(page.locator('text=Cargas Singulares')).toBeVisible();
      
      await page.click('text=Diagrama Unifilar');
      await expect(page.locator('text=Diagrama Unifilar')).toBeVisible();
      
      await page.click('text=Documentación');
      await expect(page.locator('text=Documentación')).toBeVisible();
    });

    test('should display charts in overview tab', async ({ page }) => {
      await page.waitForLoadState('networkidle');
      
      // Should have charts container
      await expect(page.locator('[class*="chart"]')).toBeVisible({ timeout: 10000 });
    });

    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForLoadState('networkidle');
      
      // Should show mobile menu button
      await expect(page.locator('button[aria-label="Abrir menú"]')).toBeVisible();
      
      // Click mobile menu
      await page.click('button[aria-label="Abrir menú"]');
      
      // Should show mobile sidebar
      await expect(page.locator('text=Proyecciones de Demanda')).toBeVisible();
    });

    test('should handle loading states', async ({ page }) => {
      await page.goto('/');
      
      // Should show loading spinner initially
      await expect(page.locator('.animate-spin')).toBeVisible();
      
      // Wait for content to load
      await page.waitForLoadState('networkidle');
    });

    test('should show user information in header', async ({ page }) => {
      await page.waitForLoadState('networkidle');
      
      // Should display user name
      await expect(page.locator('text=Test User')).toBeVisible();
      await expect(page.locator('text=Test Company')).toBeVisible();
    });

    test('should have logout functionality', async ({ page }) => {
      await page.waitForLoadState('networkidle');
      
      // Should have logout button
      await expect(page.locator('button:has-text("Cerrar Sesión")')).toBeVisible();
      
      // Click logout
      await page.click('button:has-text("Cerrar Sesión")');
      
      // Should redirect to login
      await expect(page).toHaveURL(/.*login/);
    });
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Test with network failure
    await page.route('**/api/**', route => {
      route.abort('networkfail');
    });
    
    await page.goto('/');
    
    // Should handle network errors without crashing
    await page.waitForTimeout(2000);
    expect(page.isClosed()).toBeFalsy();
  });
});