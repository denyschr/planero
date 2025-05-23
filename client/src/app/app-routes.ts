import { Route } from '@angular/router';

export const APP_ROUTES: Array<Route> = [
  {
    path: 'register',
    loadComponent: () => import('./register/register')
  }
];
