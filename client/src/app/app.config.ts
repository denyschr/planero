import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';

import Noir from '../custom-theme';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(),
    providePrimeNG({ theme: Noir })
  ]
};
