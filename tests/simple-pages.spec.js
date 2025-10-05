import { test, expect } from 'playwright-test-coverage';

test('about page loads', async ({ page }) => {
  await page.goto('/about');
  
  await expect(page.getByText('The secret sauce')).toBeVisible();
  await expect(page.getByText('At JWT Pizza, our amazing employees')).toBeVisible();
});

test('history page loads', async ({ page }) => {
  await page.goto('/history');
  
  await expect(page.getByText('Mama Ricci\'s kitchen')).toBeVisible();
});

test('navigate to notFound page', async ({ page }) => {
  await page.goto('/some-invalid-page-that-does-not-exist');
  
  // Verify 404 or not found messaging appears
  await expect(page.getByText(/not found|404|oops/i)).toBeVisible();
});