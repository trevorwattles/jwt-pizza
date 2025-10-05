import { test, expect } from 'playwright-test-coverage';

// Shared mock data
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
  {
    id: 2,
    title: 'Pepperoni',
    image: 'pizza2.png',
    price: 0.0042,
    description: 'Spicy treat',
  },
];

const mockFranchises = {
  franchises: [
    {
      id: 2,
      name: 'LotaPizza',
      stores: [
        { id: 4, name: 'Lehi' },
        { id: 5, name: 'Springville' },
        { id: 6, name: 'American Fork' },
      ],
    },
    { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
    { id: 4, name: 'topSpot', stores: [] },
  ],
};

// Helper function to set up common mocks
async function setupBasicMocks(page) {
  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: mockUser });
  });

  await page.route('*/**/api/order/menu', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: mockMenu });
  });

  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: mockFranchises });
  });
}

test('home page', async ({ page }) => {
  await page.goto('/');
  expect(await page.title()).toBe('JWT Pizza');
});

test('navigate to order page', async ({ page }) => {
  await setupBasicMocks(page);
  await page.goto('/');
  
  await page.getByRole('button', { name: 'Order now' }).click();
  await expect(page.locator('h2')).toContainText('Awesome is a click away');
});

test('select store and pizzas', async ({ page }) => {
  await setupBasicMocks(page);
  await page.goto('/');
  
  await page.getByRole('button', { name: 'Order now' }).click();
  
  // Select store
  await page.getByRole('combobox').selectOption('4');
  
  // Add pizzas
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');
});

test('login flow', async ({ page }) => {
  await setupBasicMocks(page);
  
  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'd@jwt.com', password: 'a' };
    const loginRes = {
      user: mockUser,
      token: 'abcdef',
    };
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Order now' }).click();
  
  // Select items and proceed to checkout
  await page.getByRole('combobox').selectOption('4');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await page.getByRole('button', { name: 'Checkout' }).click();

  // Perform login
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();
  
  // Verify we're on the payment page
  await expect(page.getByRole('button', { name: 'Pay now' })).toBeVisible();
});

test('complete purchase flow', async ({ page }) => {
  await setupBasicMocks(page);

  await page.route('*/**/api/auth', async (route) => {
    const loginRes = {
      user: mockUser,
      token: 'abcdef',
    };
    expect(route.request().method()).toBe('PUT');
    await route.fulfill({ json: loginRes });
  });

  await page.route('*/**/api/order', async (route) => {
    const orderReq = {
      items: [
        { menuId: 1, description: 'Veggie', price: 0.0038 },
        { menuId: 2, description: 'Pepperoni', price: 0.0042 },
      ],
      storeId: '4',
      franchiseId: 2,
    };
    const orderRes = {
      order: {
        items: [
          { menuId: 1, description: 'Veggie', price: 0.0038 },
          { menuId: 2, description: 'Pepperoni', price: 0.0042 },
        ],
        storeId: '4',
        franchiseId: 2,
        id: 23,
      },
      jwt: 'eyJpYXQ',
    };
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toMatchObject(orderReq);
    await route.fulfill({ json: orderRes });
  });

  await page.goto('/');

  // Navigate to order page
  await page.getByRole('button', { name: 'Order now' }).click();

  // Create order
  await expect(page.locator('h2')).toContainText('Awesome is a click away');
  await page.getByRole('combobox').selectOption('4');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');
  await page.getByRole('button', { name: 'Checkout' }).click();

  // Login
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  // Verify payment page
  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
  await expect(page.locator('tbody')).toContainText('Veggie');
  await expect(page.locator('tbody')).toContainText('Pepperoni');
  await expect(page.locator('tfoot')).toContainText('0.008 ₿');
  
  // Complete payment
  await page.getByRole('button', { name: 'Pay now' }).click();

  // Verify balance updated
  await expect(page.getByText('0.008')).toBeVisible();
});