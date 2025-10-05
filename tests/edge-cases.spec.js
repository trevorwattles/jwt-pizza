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

test('menu page add multiple pizzas', async ({ page }) => {
  await page.route('*/**/api/order/menu', async (route) => {
    await route.fulfill({ json: mockMenu });
  });

  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    await route.fulfill({ json: mockFranchises });
  });

  await page.goto('/menu');

  // Select a store
  await page.getByRole('combobox').selectOption('4');

  // Add a pizza
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await expect(page.getByText('Selected pizzas: 1')).toBeVisible();

  // Add it again
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await expect(page.getByText('Selected pizzas: 2')).toBeVisible();
});

test('delivery page loads without order state', async ({ page }) => {
  await page.goto('/delivery');

  // Should still render the page even without state
  await expect(page.getByText('Here is your JWT Pizza!')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Verify' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Order more' })).toBeVisible();
});

test('menu page loads without user authentication', async ({ page }) => {
  await page.route('*/**/api/order/menu', async (route) => {
    await route.fulfill({ json: mockMenu });
  });

  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    await route.fulfill({ json: mockFranchises });
  });

  await page.goto('/menu');

  await expect(page.getByText('Awesome is a click away')).toBeVisible();
});

test('registration with all form fields', async ({ page }) => {
  await page.route('*/**/api/auth', async (route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON();
      // Verify all fields are sent
      expect(body.name).toBeTruthy();
      expect(body.email).toBeTruthy();
      expect(body.password).toBeTruthy();
      
      await route.fulfill({
        json: {
          user: { id: 4, name: body.name, email: body.email, roles: [{ role: 'diner' }] },
          token: 'test-token',
        },
      });
    }
  });

  await page.goto('/register');
  
  await page.getByPlaceholder('Full name').fill('Test User');
  await page.getByPlaceholder('Email address').fill('test@test.com');
  await page.getByPlaceholder('Password').fill('testpass123');
  
  await page.getByRole('button', { name: 'Register' }).click();
  
  await expect(page.getByRole('button', { name: 'Order now' })).toBeVisible({ timeout: 10000 });
});