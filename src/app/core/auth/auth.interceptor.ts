import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiRequest =
    req.url.startsWith('/api') ||
    (Boolean(environment.apiUrl) && req.url.startsWith(environment.apiUrl));

  if (!isApiRequest) {
    return next(req);
  }

  const authService = inject(AuthService);
  const isAuthRefreshOrLogin =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/refresh') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/password-reset');

  const token = authService.accessToken();
  const cloned = req.clone({
    withCredentials: true,
    setHeaders: token && !isAuthRefreshOrLogin ? { Authorization: `Bearer ${token}` } : {},
  });

  return next(cloned).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !isAuthRefreshOrLogin &&
        !req.url.includes('/auth/logout')
      ) {
        return authService.refreshSession().pipe(
          switchMap((session) => {
            if (!session) {
              return throwError(() => error);
            }

            const retried = req.clone({
              withCredentials: true,
              setHeaders: { Authorization: `Bearer ${session.accessToken}` },
            });
            return next(retried);
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};
