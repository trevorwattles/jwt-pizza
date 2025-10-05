import { test, expect } from 'playwright-test-coverage';

const mockUser = {
  id: 3,
  name: 'Kai Chen',
  email: 'd@jwt.com',
  roles: [{ role: 'diner' }],
};

const mockMenu = [
  {
    id: 1,
    title: 'Veggie',
    image: 'pizza1.png',
    price: 0.0038,
    description: 'A garden of delight',
  },
];

const mockFranchises = {
  franchises: [
    {
      id: 2,
      name: 'LotaPizza',
      stores: [{ id: 4, name: 'Lehi' }],
    },
  ],
};

const mockOrder = {
  id: 23,
  franchiseId: 2,
  storeId: 4,
  items: [
    { menuId: 1, description: 'Veggie', price: 0.0038 },
    { menuId: 2, description: 'Pepperoni', price: 0.0042 },
  ],
};

const mockJWTPayload = {
  message: 'valid',
  payload: {
    vendor: {
      id: 'pizza-factory',
      name: 'Pizza Factory'
    },
    diner: {
      id: 3,
      name: 'Kai Chen',
      email: 'd@jwt.com'
    },
    order: mockOrder
  }
};

test('delivery page verify button with valid JWT', async ({ page }) => {
  await page.route('**/factory/api/order/verify', async (route) => {
    await route.fulfill({ json: mockJWTPayload });
  });

  // Navigate directly with state
  await page.goto('/');
  await page.evaluate((orderData) => {
    window.history.pushState(
      { order: orderData.order, jwt: orderData.jwt },
      '',
      '/delivery'
    );
  }, { order: mockOrder, jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test' });
  
  await page.goto('/delivery');

  // Verify delivery page loaded
  await expect(page.getByText('Here is your JWT Pizza!')).toBeVisible();
  
  // Verify buttons are present
  await expect(page.getByRole('button', { name: 'Verify' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Order more' })).toBeVisible();
  
  // Click verify button
  await page.getByRole('button', { name: 'Verify' }).click();
});

test('delivery page verify button with invalid JWT', async ({ page }) => {
  await page.route('**/factory/api/order/verify', async (route) => {
    await route.fulfill({ 
      status: 400,
      json: { message: 'invalid', payload: { error: 'Invalid JWT' } }
    });
  });

  await page.goto('/');
  await page.evaluate((orderData) => {
    window.history.pushState(
      { order: orderData.order, jwt: orderData.jwt },
      '',
      '/delivery'
    );
  }, { order: mockOrder, jwt: 'invalid-jwt' });
  
  await page.goto('/delivery');

  // Click verify button - should handle error
  await page.getByRole('button', { name: 'Verify' }).click();
  
  // Wait a moment for the modal to potentially appear
  await page.waitForTimeout(500);
});

test('delivery page order more button navigates to menu', async ({ page }) => {
  await page.route('*/**/api/order/menu', async (route) => {
    await route.fulfill({ json: mockMenu });
  });

  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    await route.fulfill({ json: mockFranchises });
  });

  await page.goto('/');
  await page.evaluate((orderData) => {
    window.history.pushState(
      { order: orderData.order, jwt: orderData.jwt },
      '',
      '/delivery'
    );
  }, { order: mockOrder, jwt: 'test-jwt' });
  
  await page.goto('/delivery');

  // Click order more button
  await page.getByRole('button', { name: 'Order more' }).click();

  // Should navigate to menu page
  await page.waitForURL('**/menu');
  await expect(page.getByText('Awesome is a click away')).toBeVisible();
});

test('login error handling', async ({ page }) => {
  await page.route('*/**/api/auth', async (route) => {
    if (route.request().method() === 'PUT') {
      await route.fulfill({ 
        status: 401,
        json: { message: 'Invalid credentials' }
      });
    }
  });

  await page.goto('/login');
  
  // Fill out login form with bad credentials
  await page.getByPlaceholder('Email address').fill('wrong@jwt.com');
  await page.getByPlaceholder('Password').fill('wrongpassword');
  
  // Submit login
  await page.getByRole('button', { name: 'Login' }).click();
  
  // Should show error message
  await expect(page.locator('div').filter({ hasText: 'Invalid credentials' }).first()).toBeVisible();
});

test('navigate from login to register', async ({ page }) => {
  await page.goto('/login');
  
  // Click on "Register" span specifically (not the header link)
  await page.locator('span').filter({ hasText: 'Register' }).click();
  
  // Should navigate to register page
  await page.waitForURL('**/register');
  await expect(page.getByText('Welcome to the party')).toBeVisible();
});