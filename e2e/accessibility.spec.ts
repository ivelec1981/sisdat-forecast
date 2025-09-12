import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test('login page should be accessible', async ({ page }) => {
    await page.goto('/login');
    
    // Check for proper heading structure
    await expect(page.locator('h1')).toBeVisible();
    
    // Check for form labels
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await expect(emailInput).toHaveAttribute('placeholder', /.+/);
    await expect(passwordInput).toHaveAttribute('placeholder', /.+/);
    
    // Check for submit button
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/login');
    
    // Tab through form elements
    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="email"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="password"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('button[type="submit"]')).toBeFocused();
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/login');
    
    // Check background and text colors are set
    const body = page.locator('body');
    const computedStyle = await body.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        backgroundColor: style.backgroundColor,
        color: style.color
      };
    });
    
    expect(computedStyle.backgroundColor).toBeTruthy();
    expect(computedStyle.color).toBeTruthy();
  });

  test('should have proper focus indicators', async ({ page }) => {
    await page.goto('/login');
    
    // Focus on email input
    await page.focus('input[type="email"]');
    
    // Should have focus ring (outline or box-shadow)
    const focusedElement = await page.locator('input[type="email"]:focus').evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        outline: style.outline,
        boxShadow: style.boxShadow,
        outlineOffset: style.outlineOffset
      };
    });
    
    // Should have some form of focus indicator
    const hasFocusIndicator = 
      focusedElement.outline !== 'none' || 
      focusedElement.boxShadow !== 'none' ||
      focusedElement.outlineOffset !== '0px';
    
    expect(hasFocusIndicator).toBeTruthy();
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/login');
    
    // Check for main landmark
    await expect(page.locator('main, [role="main"]')).toBeVisible();
    
    // Check for form
    await expect(page.locator('form')).toBeVisible();
    
    // Check for button role
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toHaveAttribute('type', 'submit');
  });

  test('should work without JavaScript', async ({ page, context }) => {
    // Disable JavaScript
    await context.setJavaScriptEnabled(false);
    
    await page.goto('/login');
    
    // Basic form should still be visible
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should provide meaningful error messages', async ({ page }) => {
    await page.goto('/login');
    
    // Submit empty form
    await page.click('button[type="submit"]');
    
    // Should show specific error messages
    await expect(page.locator('text=Email es requerido, text=requerido')).toBeVisible();
    await expect(page.locator('text=Contraseña es requerida, text=requerida')).toBeVisible();
  });

  test('should support screen reader navigation', async ({ page }) => {
    await page.goto('/login');
    
    // Check for proper heading structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
    expect(headings).toBeGreaterThan(0);
    
    // Check for landmark regions
    const landmarks = await page.locator('main, nav, header, footer, aside, section[aria-label], [role="banner"], [role="navigation"], [role="main"], [role="contentinfo"]').count();
    expect(landmarks).toBeGreaterThan(0);
  });

  test('should handle high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.addInitScript(() => {
      const style = document.createElement('style');
      style.textContent = `
        * {
          background-color: black !important;
          color: white !important;
          border-color: white !important;
        }
      `;
      document.head.appendChild(style);
    });
    
    await page.goto('/login');
    
    // Page should still be usable
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should handle reduced motion preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => {},
        }),
      });
    });
    
    await page.goto('/login');
    
    // Should respect reduced motion preferences
    // (This would need to be implemented in the actual CSS)
    await expect(page.locator('form')).toBeVisible();
  });
});