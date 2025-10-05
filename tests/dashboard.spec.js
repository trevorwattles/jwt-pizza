import { test, expect } from 'playwright-test-coverage';

const mockUser = {
  id: 3,
  name: 'Kai Chen',
  email: 'd@jwt.com',
  roles: [{ role: 'diner' }],
};

const mockOrderHistory = {
  orders: [
    {
      id: 1,
      franchiseId: 2,
      storeId: 4,
      date: '2024-06-05T12:00:00.000Z',
      items: [
        { id: 1, menuId: 1, description: 'Veggie', price: 0.0038 },
        { id: 2, menuId: 2, description: 'Pepperoni', price: 0.0042 },
      ],
    },
  ],
  dinerId: 3,
  dinerName: 'Kai Chen',
  dinerEmail: 'd@jwt.com',
};

test('view diner dashboard with orders', async ({ page }) => {
  // Set up authentication token in localStorage before navigation
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('token', 'test-token-123');
  });

  await page.route('*/**/api/user/me', async (route) => {
    await route.fulfill({ json: mockUser });
  });

  await page.route('*/**/api/order', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: mockOrderHistory });
    }
  });

  await page.goto('/diner-dashboard');
  
  // Verify dashboard content
  await expect(page.getByText('Your pizza kitchen')).toBeVisible();
  
  // Check that user info labels are displayed
  await expect(page.locator('text=name:')).toBeVisible();
  await expect(page.locator('text=email:')).toBeVisible();
  await expect(page.locator('text=role:')).toBeVisible();
  
  // Verify order history table
  await expect(page.getByText('Here is your history of all the good times')).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();
});

test('view diner dashboard without orders', async ({ page }) => {
  // Set up authentication token
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('token', 'test-token-123');
  });

  await page.route('*/**/api/user/me', async (route) => {
    await route.fulfill({ json: mockUser });
  });

  await page.route('*/**/api/order', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: { orders: [], dinerId: 3, dinerName: 'Kai Chen', dinerEmail: 'd@jwt.com' } });
    }
  });

  await page.goto('/diner-dashboard');
  
  // Verify empty state message
  await expect(page.getByText('How have you lived this long without having a pizza?')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buy one' })).toBeVisible();
});

test('dashboard displays user roles correctly', async ({ page }) => {
  const franchiseeUser = {
    id: 5,
    name: 'Franchise Owner',
    email: 'owner@jwt.com',
    roles: [
      { role: 'diner' },
      { role: 'franchisee', objectId: 'LotaPizza' }
    ],
  };

  // Set up authentication token
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('token', 'test-token-123');
  });

  await page.route('*/**/api/user/me', async (route) => {
    await route.fulfill({ json: franchiseeUser });
  });

  await page.route('*/**/api/order', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: { orders: [], dinerId: 5, dinerName: 'Franchise Owner', dinerEmail: 'owner@jwt.com' } });
    }
  });

  await page.goto('/diner-dashboard');
  
  // Verify role section exists
  await expect(page.locator('text=role:')).toBeVisible();
  
  // Verify diner role is displayed
  await expect(page.getByText('diner', { exact: true })).toBeVisible();
});