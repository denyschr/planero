import { Page, test } from '@playwright/test';

test.describe('Boards', () => {
  const BOARD_BACKGROUNDS = [
    'rgb(0, 121, 191)',
    'rgb(210, 144, 52)',
    'rgb(81, 152, 57)',
    'rgb(176, 70, 50)',
    'rgb(137, 96, 158)',
    'rgb(205, 90, 145)'
  ];

  const fakeUser = {
    id: '1',
    username: 'foo',
    email: 'foo@gmail.com',
    token: 'eyJhbGciOiJIUzI1Ni.eyJpZCI6IjY4MmVjM2E5ZD.0rWhF8l0CcwojYv3tWbGRjjRC4'
  };

  const fakeBoards = [
    {
      id: '1',
      title: 'First board',
      backgroundColor: 'rgb(255, 0, 0)'
    },
    {
      id: '2',
      title: 'Second board',
      backgroundColor: 'rgb(0, 0, 255)'
    },
    {
      id: '3',
      title: 'Third board',
      backgroundColor: 'rgb(0, 255, 0)'
    }
  ];

  const fakeNewBoard = {
    id: '4',
    title: 'New Board',
    backgroundColor: 'rgb(128, 0, 128)'
  };

  test.beforeEach(async ({ page }) => {
    await page.addInitScript((token) => {
      localStorage.setItem('token', token);
    }, fakeUser.token);
    await page.route('**/api/user', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(fakeUser)
      });
    });
    await page.route('**/api/boards', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(fakeBoards)
      });
    });
  });

  const getToggleMenuButton = (page: Page) => page.locator('#toggle-menu-button');
  const getCurrentUser = (page: Page) => page.locator('#current-user');

  test('should display a topbar', async ({ page }) => {
    await page.goto('/boards');

    await test.expect(page.getByRole('link', { name: 'Planero' })).toHaveAttribute('href', '/');
    await test.expect(getCurrentUser(page)).not.toBeVisible();
    await test.expect(page.locator('.p-menu-item-link')).not.toBeVisible();
  });

  test('should display a user menu', async ({ page }) => {
    await page.goto('/boards');
    await getToggleMenuButton(page).click();

    await test
      .expect(getCurrentUser(page).getByText(fakeUser.username, { exact: true }))
      .toBeVisible();
    await test.expect(getCurrentUser(page).getByText(fakeUser.email)).toBeVisible();
    await test.expect(page.locator('.p-menu-item-link')).toBeVisible();
  });

  test('should log out the user', async ({ page }) => {
    await page.goto('/boards');
    await getToggleMenuButton(page).click();
    await page.getByRole('button', { name: 'Log out' }).click();

    await test.expect(page).toHaveURL('/home');
    test.expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
    await test.expect(page.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
  });

  test('should display a list of boards', async ({ page }) => {
    await page.goto('/boards');

    await test.expect(page.getByRole('heading', { name: 'My Boards' })).toBeVisible();
    for (const board of fakeBoards) {
      const link = page.getByRole('link', { name: board.title });
      await test.expect(link).toHaveAttribute('href', `/boards/${board.id}`);
      await test.expect(link).toHaveCSS('background-color', board.backgroundColor);
    }
  });

  const getCreateBoardButton = (page: Page) =>
    page.getByRole('button', { name: 'Create new board' });
  const getCreateBoardDialog = (page: Page) => page.getByRole('dialog', { name: 'Create board' });
  const getTitleInput = (page: Page) => page.getByLabel('Board title');
  const getSubmitButton = (page: Page) => page.getByRole('button', { name: 'Create', exact: true });

  test('should display a button to create a board', async ({ page }) => {
    await page.goto('/boards');
    await page.route('**/api/boards', async (route) => {
      if (route.request().method() === 'POST') {
        await page.waitForTimeout(500);
        await route.fulfill({
          status: 201,
          body: JSON.stringify(fakeNewBoard)
        });
      } else {
        await route.fulfill({
          status: 200,
          body: JSON.stringify([...fakeBoards, fakeNewBoard])
        });
      }
    });

    await getCreateBoardButton(page).click();

    await test.expect(getCreateBoardDialog(page)).toBeVisible();
    await test.expect(getSubmitButton(page)).toBeDisabled();

    const backgroundInputs = page
      .getByRole('group', { name: 'Background' })
      .locator('input[type=radio]');
    await test.expect(backgroundInputs).toHaveCount(BOARD_BACKGROUNDS.length);
    await test.expect(backgroundInputs.first()).toBeChecked();

    for (const [index, color] of BOARD_BACKGROUNDS.entries()) {
      const input = backgroundInputs.nth(index);
      await test.expect(input).toHaveCSS('background-color', color);
      if (index === 0) {
        await test.expect(input.locator('~ .pi-check')).not.toHaveClass(/hidden/);
      } else {
        await test.expect(input.locator('~ .pi-check')).toHaveClass(/hidden/);
      }
    }

    await getTitleInput(page).fill('f');
    await getTitleInput(page).clear();

    const titleRequiredError = page.locator('#title-required-error');
    await test.expect(titleRequiredError).toContainText('Board title is required');
    await getTitleInput(page).fill(fakeNewBoard.title);
    await test.expect(titleRequiredError).not.toBeVisible();

    await getSubmitButton(page).click();

    await test.expect(getTitleInput(page)).toBeDisabled();
    await test.expect(getSubmitButton(page)).toBeDisabled();
    await test.expect(getCreateBoardDialog(page)).not.toBeVisible();

    const createdBoard = page.getByRole('link', { name: fakeNewBoard.title });
    await test.expect(createdBoard).toHaveAttribute('href', `/boards/${fakeNewBoard.id}`);
    await test.expect(createdBoard).toHaveCSS('background-color', fakeNewBoard.backgroundColor);
  });

  test('should display a toast if creating a board fails', async ({ page }) => {
    await page.goto('/boards');
    await page.route('**/api/boards', async (route) => {
      if (route.request().method() === 'POST') {
        await page.waitForTimeout(500);
        await route.fulfill({
          status: 500
        });
      }
    });

    await getCreateBoardButton(page).click();

    await test.expect(getCreateBoardDialog(page)).toBeVisible();

    await getTitleInput(page).fill('New board');
    await getSubmitButton(page).click();

    await test.expect(getTitleInput(page)).toBeEnabled();
    await test.expect(getSubmitButton(page)).toBeEnabled();
    await test.expect(getCreateBoardDialog(page)).toBeVisible();
    await test.expect(page.getByText('Failed to create new board')).toBeVisible();
  });
});
