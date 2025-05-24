import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { JwtStorage } from './jwt-storage';

export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(JwtStorage).get();
  if (token) {
    const clone = request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    return next(clone);
  }
  return next(request);
};
