import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { ApiProblemResponse } from '../auth/auth.models';
import { GlobalErrorService } from './global-error.service';

const SILENT_BACKGROUND_PATHS = ['/api/chat/unread-count', '/api/auth/refresh'];
const INLINE_HANDLED_503_CODES = new Set([
  'email_delivery_failed',
  'image_upload_failed',
  'media_service_unavailable',
]);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const globalErrors = inject(GlobalErrorService);
  const isSilentBackground = SILENT_BACKGROUND_PATHS.some((path) => req.url.includes(path));

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse && !isSilentBackground && globalErrors.error() !== null) {
        globalErrors.dismiss();
      }
    }),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && !isSilentBackground) {
        if (error.status === 0) {
          globalErrors.reportNetworkError();
        } else if (error.status >= 500) {
          const problem = error.error as ApiProblemResponse | null;
          if (!problem?.code || !INLINE_HANDLED_503_CODES.has(problem.code)) {
            globalErrors.reportServerError(error.status, problem?.detail || problem?.title);
          }
        }
      }

      return throwError(() => error);
    }),
  );
};
