import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { JwtTokenStorage } from './jwt-token-storage';

export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(JwtTokenStorage).get();
  if (token) {
    const clone = request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(clone);
  }
  return next(request);
};
