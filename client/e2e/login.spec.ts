import { Page, test } from '@playwright/test';

test.describe('Login', () => {
  const fakeUser = {
    id: '1',
    username: 'foo',
    email: 'foo@gmail.com',
    token: 'eyJhbGciOiJIUzI1Ni.eyJpZCI6IjY4MmVjM2E5ZD.0rWhF8l0CcwojYv3tWbGRjjRC4'
  };

  const getEmailInput = (page: Page) => page.getByPlaceholder('Email');
  const getPasswordInput = (page: Page) => page.getByPlaceholder('Password');
  const getSubmitButton = (page: Page) => page.getByRole('button', { name: 'Sign in' });

  test('should display a login page', async ({ page }) => {
    await page.goto('/login');

    await page.route('**/api/users/login', async (route) => {
      await page.waitForTimeout(500);
      await route.fulfill({
        status: 200,
        body: JSON.stringify(fakeUser)
      });
    });

    await test.expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await test.expect(page.getByText('Have an account? Sign up')).toBeVisible();
    await test.expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();

    await test.expect(getSubmitButton(page)).toBeDisabled();

    await getEmailInput(page).fill('f');
    await getEmailInput(page).clear();

    const emailRequiredError = page.locator('#email-required-error');
    await test.expect(emailRequiredError).toBeVisible();
    await test.expect(emailRequiredError).toContainText('Email is required');
    await getEmailInput(page).fill('foo@');

    const emailInvalidError = page.locator('#email-invalid-error');
    await test.expect(emailInvalidError).toBeVisible();
    await test.expect(emailInvalidError).toContainText('Email is invalid');
    await getEmailInput(page).fill('foo@gmail.com');
    await test.expect(emailInvalidError).not.toBeVisible();

    await getPasswordInput(page).fill('1');
    await getPasswordInput(page).clear();

    const passwordRequiredError = page.locator('#password-required-error');
    await test.expect(passwordRequiredError).toBeVisible();
    await test.expect(passwordRequiredError).toContainText('Password is required');
    await getPasswordInput(page).fill('1234');

    const passwordLengthError = page.locator('#password-length-error');
    await test.expect(passwordLengthError).toBeVisible();
    await test.expect(passwordLengthError).toContainText('Password must be at least 8 characters');
    await getPasswordInput(page).fill('12345678');
    await test.expect(passwordLengthError).not.toBeVisible();

    await getSubmitButton(page).click();

    await test.expect(getEmailInput(page)).toBeDisabled();
    await test.expect(getPasswordInput(page)).toBeDisabled();
    await test.expect(getSubmitButton(page)).toBeDisabled();
    await test.expect(page).toHaveURL('/');
  });

  test('should navigate to the register page when clicking the link', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('link', { name: 'Sign up' }).click();

    await test.expect(page).toHaveURL('/register');
  });

  test('should display a message if login fails', async ({ page }) => {
    await page.goto('/login');

    await page.route('**/api/users/login', async (route) => {
      await page.waitForTimeout(500);
      await route.fulfill({
        status: 401
      });
    });

    await getEmailInput(page).fill('foo@gmail.com');
    await getPasswordInput(page).fill('12345678');
    await getSubmitButton(page).click();

    await test.expect(getEmailInput(page)).toBeDisabled();
    await test.expect(getPasswordInput(page)).toBeDisabled();
    await test.expect(getSubmitButton(page)).toBeDisabled();
    await test.expect(page).toHaveURL('/login');

    const message = page.locator('#login-failed-message');
    await test.expect(message).toBeVisible();
    await test.expect(message).toContainText('Incorrect email or password');

    await test.expect(getEmailInput(page)).toBeEnabled();
    await test.expect(getPasswordInput(page)).toBeEnabled();
    await test.expect(getSubmitButton(page)).toBeEnabled();
  });
});
