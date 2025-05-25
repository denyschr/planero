import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { loggedInGuard, LoggedInGuardOptions } from './logged-in-guard';
import { User } from './models/user';
import { UserApiClient } from './user-api-client';

describe(loggedInGuard.name, () => {
  function setup() {
    const currentUser = signal<User | null>(null);
    const userApiClientSpy = jasmine.createSpyObj<UserApiClient>('UserApiClient', [], {
      currentUser
    });
    TestBed.configureTestingModule({
      providers: [
        {
          provide: UserApiClient,
          useValue: userApiClientSpy
        }
      ]
    });
    const executeGuard = (options: LoggedInGuardOptions) =>
      TestBed.runInInjectionContext(() =>
        loggedInGuard(options)({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
      );

    return { currentUser, userApiClientSpy, executeGuard };
  }

  it('should allow activation if the user is logged in', () => {
    const { currentUser, executeGuard } = setup();
    currentUser.set({} as User);

    expect(executeGuard({ loggedIn: true, otherwise: '/login' })).toBe(true);
  });

  it('should forbid activation if the user is not logged in, and navigate to the provided url', () => {
    const { executeGuard } = setup();
    const router = TestBed.inject(Router);
    const urlTree: UrlTree = router.parseUrl('/login');

    expect(executeGuard({ loggedIn: true, otherwise: '/login' })).toEqual(urlTree);
  });
});
