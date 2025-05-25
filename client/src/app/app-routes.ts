import { Route } from '@angular/router';

import { loggedInGuard } from './logged-in-guard';

export const APP_ROUTES: Route[] = [
  {
    path: 'login',
    loadComponent: () => import('./login/login'),
    canActivate: [loggedInGuard({ loggedIn: false, otherwise: '/boards' })]
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register'),
    canActivate: [loggedInGuard({ loggedIn: false, otherwise: '/boards' })]
  }
];
