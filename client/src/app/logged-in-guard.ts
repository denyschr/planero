import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { UserApiClient } from './user-api-client';

export type LoggedInGuardOptions = {
  readonly loggedIn: boolean;
  readonly otherwise: string;
};

export const loggedInGuard = (options: LoggedInGuardOptions): CanActivateFn => {
  const { loggedIn, otherwise } = options;
  return () => {
    const router = inject(Router);
    const user = inject(UserApiClient).currentUser();
    return !!user === loggedIn || router.parseUrl(otherwise);
  };
};
