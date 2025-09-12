import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should redirect to login page when not authenticated', async ({ page }) => {
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('h1')).toContainText('Iniciar Sesión');
  });

  test('should display login form elements', async ({ page }) => {
    await page.goto('/login');
    
    // Check for form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check for forgot password link
    await expect(page.locator('text=¿Olvidaste tu contraseña?')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=Credenciales inválidas')).toBeVisible({ timeout: 10000 });
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/login');
    
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('text=Email es requerido')).toBeVisible();
    await expect(page.locator('text=Contraseña es requerida')).toBeVisible();
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/login');
    
    await page.click('text=¿Olvidaste tu contraseña?');
    
    await expect(page).toHaveURL(/.*forgot-password/);
    await expect(page.locator('h1')).toContainText('Recuperar Contraseña');
  });

  test('should show loading state during login', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Start login process
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Button should be disabled during loading
    await expect(submitButton).toBeDisabled();
  });

  // Test for successful login would require test user setup
  test.skip('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'admin@sisdat.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=¡Bienvenido,')).toBeVisible();
  });
});