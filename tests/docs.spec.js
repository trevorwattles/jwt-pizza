import { test, expect } from 'playwright-test-coverage';

const mockServiceDocs = {
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

const mockFactoryDocs = {
  endpoints: [
    {
      method: 'POST',
      path: '/api/order/verify',
      description: 'Verify a JWT pizza token',
      example: 'curl -X POST localhost:3000/api/order/verify',
      response: { message: 'valid' },
      requiresAuth: false,
    },
  ],
};

test('docs page displays service documentation', async ({ page }) => {
  await page.route('*/**/api/docs', async (route) => {
    await route.fulfill({ json: mockServiceDocs });
  });

  await page.goto('/docs/service');

  // Verify docs page loaded
  await expect(page.getByText('JWT Pizza API')).toBeVisible();

  // Verify method tags are shown
  await expect(page.getByText('[GET]')).toBeVisible();
  await expect(page.getByText('[POST]')).toBeVisible();
});

test('docs page displays factory documentation', async ({ page }) => {
  await page.route('**/factory/api/docs', async (route) => {
    await route.fulfill({ json: mockFactoryDocs });
  });

  await page.goto('/docs/factory');

  // Verify docs page loaded
  await expect(page.getByText('JWT Pizza API')).toBeVisible();
});

test('docs page shows example requests', async ({ page }) => {
  await page.route('*/**/api/docs', async (route) => {
    await route.fulfill({ json: mockServiceDocs });
  });

  await page.goto('/docs/service');

  // Verify example label is shown 
  await expect(page.getByText('Example request').first()).toBeVisible();
});

test('docs page shows response sections', async ({ page }) => {
  await page.route('*/**/api/docs', async (route) => {
    await route.fulfill({ json: mockServiceDocs });
  });

  await page.goto('/docs/service');

  // Verify response label is shown 
  await expect(page.getByText('Response').first()).toBeVisible();
});