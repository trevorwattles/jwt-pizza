import { test, expect } from 'playwright-test-coverage';

const mockMenu = [
  { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
];

const mockFranchises = {
  franchises: [
    { id: 2, name: 'LotaPizza', stores: [{ id: 4, name: 'Lehi' }] },
  ],
};

test('handle API error with error message', async ({ page }) => {
  await page.route('*/**/api/order/menu', async (route) => {
    await route.fulfill({
      status: 500,
      json: { message: 'Internal server error' },
    });
  });

  await page.goto('/menu');
  
  await expect(page.getByText('Awesome is a click away')).toBeVisible();
});

test('handle API network failure', async ({ page }) => {
  await page.route('*/**/api/order/menu', async (route) => {
    await route.abort('failed');
  });

  await page.goto('/menu');
  
  await expect(page.getByText('Awesome is a click away')).toBeVisible();
});

test('handle franchise API error', async ({ page }) => {
  await page.route('*/**/api/order/menu', async (route) => {
    await route.fulfill({ json: mockMenu });
  });

  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 404,
      json: { message: 'Not found' },
    });
  });

  await page.goto('/menu');
  
  await expect(page.getByText('Awesome is a click away')).toBeVisible();
});

test('handle user API returning error', async ({ page }) => {
  await page.goto('/');
  
  await page.evaluate(() => {
    localStorage.setItem('token', 'invalid-token');
  });

  await page.route('*/**/api/user/me', async (route) => {
    await route.fulfill({
      status: 401,
      json: { message: 'Unauthorized' },
    });
  });

  await page.goto('/diner-dashboard');
  
  await page.waitForTimeout(1000);
});