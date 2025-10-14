import { test, expect } from 'playwright-test-coverage';

test('updateUser', async ({ page }) => {
  const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
  const mockUser = {
    id: 1,
    name: 'pizza diner',
    email: email,
    roles: [{ role: 'diner' }],
  };

  await page.goto('/');
  
  // Mock the register endpoint
  await page.route('*/**/api/auth', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        json: {
          user: mockUser,
          token: 'test-token-123',
        },
      });
    }
  });

  // Mock the user/me endpoint
  await page.route('*/**/api/user/me', async (route) => {
    await route.fulfill({ json: mockUser });
  });

  // Mock the order endpoint
  await page.route('*/**/api/order', async (route) => {
    await route.fulfill({ json: { orders: [], dinerId: 1 } });
  });

  // Mock the update user endpoint
  let updatedUser = { ...mockUser };
  await page.route('*/**/api/user/1', async (route) => {
    if (route.request().method() === 'PUT') {
      const body = route.request().postDataJSON();
      updatedUser = { ...updatedUser, ...body };
      await route.fulfill({
        json: {
          user: updatedUser,
          token: 'test-token-123',
        },
      });
    }
  });

  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Register' }).click();

  await page.getByRole('link', { name: 'pd' }).click();

  await expect(page.getByRole('main')).toContainText('pizza diner');

  // Test the dialog and update the name
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');
  await page.getByRole('textbox').first().fill('pizza dinerx');
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

  await expect(page.getByRole('main')).toContainText('pizza dinerx');

  // Mock auth endpoints for logout/login
  await page.route('*/**/api/auth', async (route) => {
    if (route.request().method() === 'DELETE') {
      await route.fulfill({ json: {} });
    } else if (route.request().method() === 'PUT') {
      await route.fulfill({
        json: {
          user: updatedUser,
          token: 'test-token-456',
        },
      });
    }
  });

  // Test persistence - logout and login again
  await page.getByRole('link', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Login' }).click();

  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'pd' }).click();

  await expect(page.getByRole('main')).toContainText('pizza dinerx');
});