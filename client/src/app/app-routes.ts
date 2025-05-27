import { Route } from '@angular/router';

import { loggedInGuard } from './logged-in-guard';

export const APP_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./landing/landing')
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login'),
    canActivate: [loggedInGuard({ loggedIn: false, otherwise: '/' })]
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register'),
    canActivate: [loggedInGuard({ loggedIn: false, otherwise: '/' })]
  }
];
