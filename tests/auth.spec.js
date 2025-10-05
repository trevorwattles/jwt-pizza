import { test, expect } from 'playwright-test-coverage';

const mockUser = {
  id: 4,
  name: 'New User',
  email: 'newuser@jwt.com',
  roles: [{ role: 'diner' }],
};

test('user registration success', async ({ page }) => {
  await page.route('*/**/api/auth', async (route) => {
    if (route.request().method() === 'POST') {
      const registerReq = { name: 'New User', email: 'newuser@jwt.com', password: 'password123' };
      const registerRes = {
        user: mockUser,
        token: 'newtoken123',
      };
      expect(route.request().postDataJSON()).toMatchObject(registerReq);
      await route.fulfill({ json: registerRes });
    }
  });

  await page.goto('/');
  
  // Navigate to register page
  await page.getByRole('link', { name: 'Register' }).click();
  
  // Verify we're on register page
  await expect(page.getByText('Welcome to the party')).toBeVisible();
  
  // Fill out registration form
  await page.getByPlaceholder('Full name').fill('New User');
  await page.getByPlaceholder('Email address').fill('newuser@jwt.com');
  await page.getByPlaceholder('Password').fill('password123');
  
  // Submit registration
  await page.getByRole('button', { name: 'Register' }).click();
  
  // Should redirect to home page after successful registration
  await expect(page.getByRole('button', { name: 'Order now' })).toBeVisible({ timeout: 10000 });
});

test('registration error handling', async ({ page }) => {
  await page.route('*/**/api/auth', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ 
        status: 400,
        json: { message: 'Email already exists' }
      });
    }
  });

  await page.goto('/register');
  
  // Fill out registration form
  await page.getByPlaceholder('Full name').fill('Existing User');
  await page.getByPlaceholder('Email address').fill('existing@jwt.com');
  await page.getByPlaceholder('Password').fill('password123');
  
  // Submit registration
  await page.getByRole('button', { name: 'Register' }).click();
  
  // Should show error message
  await expect(page.locator('div').filter({ hasText: 'Email already exists' }).first()).toBeVisible();
});

test('logout flow', async ({ page }) => {
  await page.route('*/**/api/auth', async (route) => {
    if (route.request().method() === 'DELETE') {
      await route.fulfill({ json: { message: 'logout successful' } });
    }
  });

  await page.goto('/logout');
  
  // Should redirect to home page
  await expect(page.getByRole('button', { name: 'Order now' })).toBeVisible({ timeout: 10000 });
});