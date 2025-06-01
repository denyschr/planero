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
import { MessageService } from 'primeng/api';

import Noir from '../custom-theme';

import { JwtStorage } from './jwt-storage';
import { UserApiClient } from './user-api-client';
import { APP_ROUTES } from './routes';
import { jwtInterceptor } from './jwt-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(APP_ROUTES),
    provideAppInitializer(() => {
      const jwtStorage = inject(JwtStorage);
      const userApiClient = inject(UserApiClient);
      return jwtStorage.get() ? userApiClient.get().pipe(catchError(() => EMPTY)) : EMPTY;
    }),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({ theme: Noir }),
    MessageService
  ]
};
