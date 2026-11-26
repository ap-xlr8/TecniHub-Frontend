import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from './auth.models';
import { AuthService } from './auth.service';

export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.ensureSessionInitialized();
  if (auth.isAuthenticated()) {
    return router.createUrlTree([auth.getHomeRouteForRole(auth.userRole())]);
  }

  return true;
};

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.ensureSessionInitialized();
  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/iniciar-sesion']);
  }

  return true;
};

export function roleGuard(allowedRole: UserRole): CanActivateFn {
  return async () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    await auth.ensureSessionInitialized();
    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/iniciar-sesion']);
    }

    if (auth.userRole() !== allowedRole) {
      return router.createUrlTree([auth.getHomeRouteForRole(auth.userRole())]);
    }

    return true;
  };
}
