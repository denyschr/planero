import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Menu } from 'primeng/menu';

import { UserApiClient } from '../user-api-client';
import { User } from '../models/user';

import { Topbar } from './topbar';

describe(Topbar.name, () => {
  function setup() {
    const fakeUser = {
      username: 'foo',
      email: 'foo@gmail.com'
    } as User;
    const currentUser = signal(fakeUser);
    const userApiClientSpy = jasmine.createSpyObj<UserApiClient>('UserApiClient', ['logout'], {
      currentUser
    });
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
    const fixture = TestBed.createComponent(Topbar);
    const element: HTMLElement = fixture.nativeElement;
    const debugElement = fixture.debugElement;
    fixture.detectChanges();

    return { fixture, element, debugElement, userApiClientSpy, fakeUser };
  }

  it('should display a logo', () => {
    const { element } = setup();
    const logo = element.querySelector('a[href="/"]')!;

    expect(logo).withContext('You should have an `a` element to display the logo').toBeTruthy();
    expect(logo.textContent).withContext('The logo should have a text').toContain('Planero');
  });

  it('should toggle the menu on click', fakeAsync(() => {
    const { fixture, element, debugElement, fakeUser } = setup();

    const menu = debugElement.query(By.directive(Menu));
    expect(menu).withContext('You should have a Menu component to display the menu').toBeTruthy();
    const menuComponent: Menu = menu.componentInstance;
    expect(menuComponent.popup).withContext('The menu should be displayed as a popup').toBeTrue();

    spyOn(menuComponent, 'toggle').and.callThrough();

    const toggleButton = element.querySelector<HTMLButtonElement>('#toggle-menu-button button')!;
    expect(toggleButton).withContext('No `button` element to toggle the menu').toBeTruthy();
    toggleButton.click();
    fixture.detectChanges();

    flush();

    expect(menuComponent.toggle).toHaveBeenCalledTimes(1);

    const menuElement: HTMLElement = menu.nativeElement;
    const userInfo = menuElement.querySelector('#current-user')!;
    expect(userInfo)
      .withContext(
        'You should have a `div` element with the id `current-user` to display the user info'
      )
      .toBeTruthy();
    expect(userInfo.textContent)
      .withContext('You should display the username of the user')
      .toContain(fakeUser.username);
    expect(userInfo.textContent)
      .withContext('You should display the email of the user')
      .toContain(fakeUser.email);
  }));

  it('should call the user api client and log out the user', fakeAsync(() => {
    const { fixture, element, debugElement, userApiClientSpy } = setup();
    const menu = debugElement.query(By.directive(Menu));
    expect(menu).withContext('You should have a Menu component to display the menu').toBeTruthy();

    const toggleButton = element.querySelector<HTMLButtonElement>('#toggle-menu-button button')!;
    expect(toggleButton).withContext('No `button` element to toggle the menu').toBeTruthy();
    toggleButton.click();
    fixture.detectChanges();

    flush();

    const logoutButton = (menu.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '#logout-button'
    )!;
    expect(logoutButton).withContext('You should have a `button` element to log out').toBeTruthy();
    expect(logoutButton.textContent)
      .withContext('The button should have a text')
      .toContain('Log out');
    logoutButton.click();
    fixture.detectChanges();

    expect(userApiClientSpy.logout).toHaveBeenCalledTimes(1);
  }));
});
