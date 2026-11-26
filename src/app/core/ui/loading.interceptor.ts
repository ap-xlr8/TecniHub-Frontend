import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingStateService } from './loading-state.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingState = inject(LoadingStateService);
  loadingState.beginHttpRequest();
  return next(req).pipe(finalize(() => loadingState.endHttpRequest()));
};
