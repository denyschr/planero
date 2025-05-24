import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { catchError, EMPTY } from 'rxjs';
import { provideRouter } from '@angular/router';

import Noir from '../custom-theme';

import { JwtTokenStorage } from './jwt-token-storage';
import { UserApiClient } from './user-api-client';
import { APP_ROUTES } from './app-routes';
import { jwtInterceptor } from './jwt-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(APP_ROUTES),
    provideAppInitializer(() => {
      const jwtTokenStorage = inject(JwtTokenStorage);
      const userApiClient = inject(UserApiClient);
      return jwtTokenStorage.get() ? userApiClient.get().pipe(catchError(() => EMPTY)) : EMPTY;
    }),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({ theme: Noir })
  ]
};
