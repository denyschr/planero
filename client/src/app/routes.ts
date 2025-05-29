import { Route } from '@angular/router';

import { loggedInGuard } from './logged-in-guard';

export const APP_ROUTES: Route[] = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./landing/landing'),
    canActivate: [loggedInGuard({ loggedIn: false, otherwise: '/boards' })]
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login'),
    canActivate: [loggedInGuard({ loggedIn: false, otherwise: '/boards' })]
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register'),
    canActivate: [loggedInGuard({ loggedIn: false, otherwise: '/boards' })]
  },
  {
    path: '',
    loadComponent: () => import('./main-layout/main-layout'),
    canActivate: [loggedInGuard({ loggedIn: true, otherwise: '/home' })],
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard-layout/dashboard-layout'),
        loadChildren: () => import('./dashboard-layout/routes')
      }
    ]
  }
];
