import { Route } from '@angular/router';

export const APP_ROUTES: Array<Route> = [
  {
    path: 'login',
    loadComponent: () => import('./login/login')
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register')
  }
];
