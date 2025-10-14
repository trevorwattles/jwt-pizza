import { test, expect } from 'playwright-test-coverage';

const mockAdminUser = {
  id: 1,
  name: 'Admin User',
  email: 'admin@jwt.com',
  roles: [{ role: 'admin' }],
};

const mockFranchiseList = {
  franchises: [
    {
      id: 1,
      name: 'PizzaCorp',
      admins: [{ id: 2, name: 'Franchise Admin', email: 'fadmin@jwt.com' }],
      stores: [
        { id: 1, name: 'SLC', totalRevenue: 1000 },
        { id: 2, name: 'Provo', totalRevenue: 2000 },
      ],
    },
    {
      id: 2,
      name: 'LotaPizza',
      admins: [{ id: 3, name: 'Another Admin', email: 'admin2@jwt.com' }],
      stores: [],
    },
  ],
  more: true,
};

test('admin dashboard displays franchise list', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('token', 'admin-token');
  });

  await page.route('*/**/api/user/me', async (route) => {
    await route.fulfill({ json: mockAdminUser });
  });

  await page.route(/\/api\/franchise\?.*/, async (route) => {
    await route.fulfill({ json: mockFranchiseList });
  });

  await page.goto('/admin-dashboard');

  // Verify admin dashboard loaded
  await expect(page.getByText('Mama Ricci\'s kitchen')).toBeVisible();
  await expect(page.getByText('Franchises')).toBeVisible();

  // Verify franchise data is displayed
  await expect(page.getByText('PizzaCorp')).toBeVisible();
  await expect(page.getByText('LotaPizza')).toBeVisible();
  await expect(page.getByText('SLC')).toBeVisible();
  await expect(page.getByText('Provo')).toBeVisible();

  // Verify Add Franchise button exists
  await expect(page.getByRole('button', { name: 'Add Franchise' })).toBeVisible();
});

test('admin dashboard pagination', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('token', 'admin-token');
  });

  await page.route('*/**/api/user/me', async (route) => {
    await route.fulfill({ json: mockAdminUser });
  });

  await page.route(/\/api\/franchise\?.*/, async (route) => {
    await route.fulfill({ json: mockFranchiseList });
  });

  await page.goto('/admin-dashboard');

  // Verify pagination buttons exist (use .first() to get franchise pagination)
  await expect(page.getByRole('button', { name: '«' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: '»' }).first()).toBeVisible();
});

test('admin dashboard filter franchises', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('token', 'admin-token');
  });

  await page.route('*/**/api/user/me', async (route) => {
    await route.fulfill({ json: mockAdminUser });
  });

  await page.route(/\/api\/franchise\?.*/, async (route) => {
    await route.fulfill({ json: mockFranchiseList });
  });

  await page.goto('/admin-dashboard');

  // Use filter (use .first() to target franchise filter)
  await page.getByPlaceholder('Filter franchises').fill('Pizza');
  await page.getByRole('button', { name: 'Submit' }).first().click();

  await page.waitForTimeout(500);
});

test('create franchise page loads', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('token', 'admin-token');
  });

  await page.goto('/admin-dashboard/create-franchise');

  // Verify create franchise page loaded 
  await expect(page.getByText('Want to create franchise?')).toBeVisible();
  await expect(page.getByPlaceholder('franchise name')).toBeVisible();
  await expect(page.getByPlaceholder('franchisee admin email')).toBeVisible();
});

test('create franchise form submission', async ({ page }) => {
  await page.route('*/**/api/franchise', async (route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON();
      expect(body.name).toBe('New Franchise');
      expect(body.admins[0].email).toBe('newadmin@jwt.com');
      
      await route.fulfill({
        json: {
          id: 3,
          name: body.name,
          admins: body.admins,
          stores: [],
        },
      });
    }
  });

  await page.goto('/admin-dashboard/create-franchise');

  // Fill out form
  await page.getByPlaceholder('franchise name').fill('New Franchise');
  await page.getByPlaceholder('franchisee admin email').fill('newadmin@jwt.com');

  // Submit
  await page.getByRole('button', { name: 'Create' }).click();

  // navigate back
  await page.waitForTimeout(500);
});

test('create franchise cancel button', async ({ page }) => {
  await page.goto('/admin-dashboard/create-franchise');

  // Click cancel
  await page.getByRole('button', { name: 'Cancel' }).click();

  // navigate back
  await page.waitForTimeout(500);
});

test('create store page loads', async ({ page }) => {
  const mockFranchise = { id: 1, name: 'TestFranchise', stores: [] };

  await page.goto('/');
  await page.evaluate((franchise) => {
    window.history.pushState({ franchise: franchise }, '', '/franchise-dashboard/create-store');
  }, mockFranchise);

  await page.goto('/franchise-dashboard/create-store');

  // Verify create store page loaded
  await expect(page.getByText('Create store')).toBeVisible();
  await expect(page.getByPlaceholder('store name')).toBeVisible();
});

test('create store form submission', async ({ page }) => {
  const mockFranchise = { id: 1, name: 'TestFranchise', stores: [] };

  await page.route('*/**/api/franchise/1/store', async (route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON();
      expect(body.name).toBe('New Store');
      
      await route.fulfill({
        json: {
          id: 5,
          name: body.name,
          totalRevenue: 0,
        },
      });
    }
  });

  await page.goto('/');
  await page.evaluate((franchise) => {
    window.history.pushState({ franchise: franchise }, '', '/franchise-dashboard/create-store');
  }, mockFranchise);

  await page.goto('/franchise-dashboard/create-store');

  // Fill out form
  await page.getByPlaceholder('store name').fill('New Store');

  // Submit
  await page.getByRole('button', { name: 'Create' }).click();

  await page.waitForTimeout(500);
});

test('admin dashboard close franchise button', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('token', 'admin-token');
  });

  await page.route('*/**/api/user/me', async (route) => {
    await route.fulfill({ json: mockAdminUser });
  });

  await page.route(/\/api\/franchise\?.*/, async (route) => {
    await route.fulfill({ json: mockFranchiseList });
  });

  await page.goto('/admin-dashboard');

  // Click close button on first franchise
  const closeButtons = page.getByRole('button', { name: /Close/ });
  await closeButtons.first().click();

  // navigate to close franchise page
  await page.waitForTimeout(500);
});

test('list users as admin', async ({ page }) => {
  const mockUsersList = {
    users: [
      { id: 1, name: 'Admin User', email: 'admin@jwt.com', roles: [{ role: 'admin' }] },
      { id: 2, name: 'Franchise Admin', email: 'fadmin@jwt.com', roles: [{ role: 'franchisee' }] },
      { id: 3, name: 'Pizza Diner', email: 'diner@jwt.com', roles: [{ role: 'diner' }] },
    ],
    more: false,
  };

  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('token', 'admin-token');
  });

  await page.route('*/**/api/user/me', async (route) => {
    await route.fulfill({ json: mockAdminUser });
  });

  await page.route(/\/api\/franchise\?.*/, async (route) => {
    await route.fulfill({ json: mockFranchiseList });
  });

  await page.route(/\/api\/user\?.*/, async (route) => {
    await route.fulfill({ json: mockUsersList });
  });

  await page.goto('/admin-dashboard');

  // Check that we can see a "Users" heading
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
  
  // Check that user data is displayed
  await expect(page.getByText('Pizza Diner')).toBeVisible();
  await expect(page.getByText('diner@jwt.com')).toBeVisible();
});
test('delete user as admin', async ({ page }) => {
  const mockUsersList = {
    users: [
      { id: 1, name: 'Admin User', email: 'admin@jwt.com', roles: [{ role: 'admin' }] },
      { id: 2, name: 'Franchise Admin', email: 'fadmin@jwt.com', roles: [{ role: 'franchisee' }] },
      { id: 3, name: 'Pizza Diner', email: 'diner@jwt.com', roles: [{ role: 'diner' }] },
    ],
    more: false,
  };

  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('token', 'admin-token');
  });

  await page.route('*/**/api/user/me', async (route) => {
    await route.fulfill({ json: mockAdminUser });
  });

  await page.route(/\/api\/franchise\?.*/, async (route) => {
    await route.fulfill({ json: mockFranchiseList });
  });

  await page.route(/\/api\/user\?.*/, async (route) => {
    await route.fulfill({ json: mockUsersList });
  });

  let deleteCallMade = false;
  await page.route('*/**/api/user/3', async (route) => {
    if (route.request().method() === 'DELETE') {
      deleteCallMade = true;
      await route.fulfill({ json: {} });
    }
  });

  await page.goto('/admin-dashboard');

  // Find and click delete button for Pizza Diner
  const deleteButtons = page.getByRole('button', { name: /Delete/ });
  await deleteButtons.last().click();

  await page.waitForTimeout(500);
  expect(deleteCallMade).toBe(true);
});

test('filter users by name', async ({ page }) => {
  const mockUsersList = {
    users: [
      { id: 1, name: 'Admin User', email: 'admin@jwt.com', roles: [{ role: 'admin' }] },
      { id: 3, name: 'Pizza Diner', email: 'diner@jwt.com', roles: [{ role: 'diner' }] },
    ],
    more: false,
  };

  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('token', 'admin-token');
  });

  await page.route('*/**/api/user/me', async (route) => {
    await route.fulfill({ json: mockAdminUser });
  });

  await page.route(/\/api\/franchise\?.*/, async (route) => {
    await route.fulfill({ json: mockFranchiseList });
  });

  await page.route(/\/api\/user\?.*/, async (route) => {
    await route.fulfill({ json: mockUsersList });
  });

  await page.goto('/admin-dashboard');

  // Use user filter
  await page.getByPlaceholder('Filter users').fill('Pizza');
  await page.getByRole('button', { name: 'Submit' }).nth(1).click();

  await page.waitForTimeout(500);
});