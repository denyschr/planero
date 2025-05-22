import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { provideHttpClient } from '@angular/common/http';
import { catchError, EMPTY } from 'rxjs';

import Noir from '../custom-theme';

import { JwtTokenStorage } from './jwt-token-storage';
import { UserApiClient } from './user-api-client';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAppInitializer(() => {
      const jwtTokenStorage = inject(JwtTokenStorage);
      const userApiClient = inject(UserApiClient);
      return jwtTokenStorage.get() ? userApiClient.get().pipe(catchError(() => EMPTY)) : EMPTY;
    }),
    provideHttpClient(),
    provideAnimationsAsync(),
    providePrimeNG({ theme: Noir })
  ]
};
