import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { UserApiClient } from '../user-api-client';
import { User } from '../models/user';

import Login from './login';

describe(Login.name, () => {
  function setup() {
    const userApiClientSpy = jasmine.createSpyObj<UserApiClient>('UserApiClient', ['login']);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        {
          provide: UserApiClient,
          useValue: userApiClientSpy
        }
      ]
    });
    const fixture = TestBed.createComponent(Login);
    const element: HTMLElement = fixture.nativeElement;
    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl');
    fixture.detectChanges();

    const fakeCredentials = {
      email: 'foo@gmail.com',
      password: '12345678'
    };

    return { fixture, element, userApiClientSpy, router, fakeCredentials };
  }

  it('should have a title', () => {
    const { element } = setup();
    const title = element.querySelector('h1')!;

    expect(title).withContext('You should have an `h1` element to display the title').toBeTruthy();
    expect(title.textContent).withContext('The title should have a text').toContain('Sign in');
  });

  it('should have a prompt text with the link to the register page', () => {
    const { element } = setup();
    const text = element.querySelector('p#register-prompt-text')!;

    expect(text)
      .withContext('You should have a `p` element to display the prompt text')
      .toBeTruthy();
    expect(text.textContent).toContain("Don't have an account?");
    expect(text.textContent)
      .withContext('You should have the `a` element inside the `p` element')
      .toContain('Sign up');

    const link = text.querySelector('a[href="/register"]')!;
    expect(link)
      .withContext('You should have an `a` element to display the link to the register page')
      .toBeTruthy();
    expect(link.textContent).withContext('The link should have a text').toContain('Sign up');
  });

  it('should have a disabled submit button if the form is incomplete', () => {
    const { element } = setup();
    const button = element.querySelector('button[type=submit]')!;

    expect(button).withContext('The template should have a button').toBeTruthy();
    expect(button.hasAttribute('disabled'))
      .withContext('The button should be disabled if the form is invalid')
      .toBeTruthy();
  });

  it('should be possible to log in if the form is complete', () => {
    const { fixture, element, fakeCredentials } = setup();
    const emailInput = element.querySelector<HTMLInputElement>('input[type=email]')!;
    expect(emailInput).withContext('You should have an input for the email').toBeTruthy();
    emailInput.value = fakeCredentials.email;
    emailInput.dispatchEvent(new Event('input'));

    const passwordInput = element.querySelector<HTMLInputElement>('input[type=password]')!;
    expect(passwordInput).withContext('You should have an input for the password').toBeTruthy();
    passwordInput.value = fakeCredentials.password;
    passwordInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(element.querySelector('button[type=submit]')!.hasAttribute('disabled')).toBeFalsy();
  });

  it('should display validation error messages if fields are dirty and invalid', () => {
    const { fixture, element, fakeCredentials } = setup();
    const emailInput = element.querySelector<HTMLInputElement>('input[type=email]')!;
    expect(emailInput).withContext('You should have an input for the email').toBeTruthy();
    emailInput.value = fakeCredentials.email;
    emailInput.dispatchEvent(new Event('input'));
    emailInput.value = '';
    emailInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const emailRequiredError = element.querySelector('#email-required-error')!;
    expect(emailRequiredError)
      .withContext('You should have an error message if the email field is required and dirty')
      .toBeTruthy();
    expect(emailRequiredError.textContent)
      .withContext('The error message for the email field is incorrect')
      .toContain('Email is required');

    emailInput.value = 'foo@';
    emailInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const emailInvalidError = element.querySelector('#email-invalid-error')!;
    expect(emailInvalidError)
      .withContext('You should have an error message if the email field is invalid and dirty')
      .toBeTruthy();
    expect(emailInvalidError.textContent)
      .withContext('The error message for the email field is incorrect')
      .toContain('Email is invalid');

    const passwordInput = element.querySelector<HTMLInputElement>('input[type="password"]')!;
    expect(passwordInput)
      .withContext('You should have an input with the type `password` for the password')
      .not.toBeNull();
    passwordInput.value = fakeCredentials.password;
    passwordInput.dispatchEvent(new Event('input'));
    passwordInput.value = '';
    passwordInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const passwordRequiredError = element.querySelector('#password-required-error')!;
    expect(passwordRequiredError)
      .withContext('You should have an error message if the password field is required and dirty')
      .not.toBeNull();
    expect(passwordRequiredError.textContent)
      .withContext('The error message for the password field is incorrect')
      .toContain('Password is required');

    passwordInput.value = '1234';
    passwordInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const passwordLengthError = element.querySelector('#password-length-error')!;
    expect(passwordLengthError)
      .withContext('You should have an error message if the password field is too short and dirty')
      .not.toBeNull();
    expect(passwordLengthError.textContent)
      .withContext('The error message for the password field is incorrect')
      .toContain('Password must be at least 8 characters');
  });

  it('should call the user api client and redirect on success', () => {
    const { fixture, element, userApiClientSpy, router, fakeCredentials } = setup();
    userApiClientSpy.login.and.returnValue(of({ id: '1' } as User));

    const emailInput = element.querySelector<HTMLInputElement>('input[type=email]')!;
    emailInput.value = fakeCredentials.email;
    emailInput.dispatchEvent(new Event('input'));

    const passwordInput = element.querySelector<HTMLInputElement>('input[type=password]')!;
    passwordInput.value = fakeCredentials.password;
    passwordInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const button = element.querySelector<HTMLButtonElement>('button[type=submit]')!;
    button.click();
    fixture.detectChanges();

    expect(emailInput.hasAttribute('disabled'))
      .withContext('Your email field should be disabled when the form is submitted')
      .toBeTruthy();
    expect(passwordInput.hasAttribute('disabled'))
      .withContext('Your password field should be disabled when the form is submitted')
      .toBeTruthy();
    expect(button.hasAttribute('disabled'))
      .withContext('Your submit button should be disabled when the form is submitted')
      .toBeTruthy();
    expect(userApiClientSpy.login).toHaveBeenCalledOnceWith(fakeCredentials);
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/boards');
  });

  it('should call the user api client and display a message on failure', () => {
    const { fixture, element, userApiClientSpy, router, fakeCredentials } = setup();
    userApiClientSpy.login.and.callFake(() => throwError(() => new Error('error')));

    const emailInput = element.querySelector<HTMLInputElement>('input[type=email]')!;
    emailInput.value = fakeCredentials.email;
    emailInput.dispatchEvent(new Event('input'));

    const passwordInput = element.querySelector<HTMLInputElement>('input[type=password]')!;
    passwordInput.value = fakeCredentials.password;
    passwordInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const button = element.querySelector<HTMLButtonElement>('button[type=submit]')!;
    button.click();
    fixture.detectChanges();

    expect(emailInput.hasAttribute('disabled'))
      .withContext('Your email field should NOT be disabled when the form submission fails')
      .toBeFalsy();
    expect(passwordInput.hasAttribute('disabled'))
      .withContext('Your password field should NOT be disabled when the form submission fails')
      .toBeFalsy();
    expect(button.hasAttribute('disabled'))
      .withContext('Your submit button should NOT be disabled when the form submission fails')
      .toBeFalsy();
    expect(userApiClientSpy.login).toHaveBeenCalledOnceWith(fakeCredentials);
    expect(router.navigateByUrl).not.toHaveBeenCalled();

    const message = element.querySelector('#login-failed-message')!;
    expect(message)
      .withContext('You should display an error message if the login fails')
      .toBeTruthy();
    expect(message.textContent).toContain('Incorrect email or password');
  });
});
