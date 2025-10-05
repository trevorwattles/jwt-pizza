import { test, expect } from 'playwright-test-coverage';

const mockDocs = {
  endpoints: [
    {
      method: 'GET',
      path: '/api/order/menu',
      description: 'Get the pizza menu',
      example: 'curl localhost:3000/api/order/menu',
      response: { menu: [] },
      requiresAuth: false,
    },
    {
      method: 'POST',
      path: '/api/order',
      description: 'Create a new order',
      example: 'curl -X POST localhost:3000/api/order',
      response: { order: {} },
      requiresAuth: true,
    },
  ],
};

test('navigate to about page', async ({ page }) => {
  await page.goto('/');
  
  await page.getByRole('link', { name: 'About' }).click();
  
  await expect(page.getByText('The secret sauce')).toBeVisible();
  await expect(page.getByText('At JWT Pizza, our amazing employees')).toBeVisible();
});

test('navigate to history page', async ({ page }) => {
  await page.goto('/');
  
  await page.getByRole('link', { name: 'History' }).click();
  
  await expect(page.getByText('Mama Ricci\'s kitchen')).toBeVisible();
});

test('view service docs page', async ({ page }) => {
  await page.route('*/**/api/docs', async (route) => {
    await route.fulfill({ json: mockDocs });
  });

  await page.goto('/docs/service');
  
  // Verify docs content
  await expect(page.getByText('JWT Pizza API')).toBeVisible();
  await expect(page.getByText('[GET] /api/order/menu')).toBeVisible();
  await expect(page.getByText('[POST] /api/order')).toBeVisible();
  await expect(page.getByText('Get the pizza menu')).toBeVisible();
});

test('view factory docs page', async ({ page }) => {
  await page.route('**/factory/api/docs', async (route) => {
    await route.fulfill({ json: mockDocs });
  });

  await page.goto('/docs/factory');
  
  // Verify docs page loads
  await expect(page.getByText('JWT Pizza API')).toBeVisible();
});