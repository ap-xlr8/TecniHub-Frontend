import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, firstValueFrom, map, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiProblemResponse,
  AuthSessionResponse,
  ConfirmPasswordResetPayload,
  GenericMessageResponse,
  LoginPayload,
  RegisterClientPayload,
  RegisterTechnicianPayload,
  RegistrationResponse,
  UserRole,
  UserSummaryDto,
  VerifyEmailPayload,
} from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private static readonly SESSION_HINT_KEY = 'tecnihub_has_session';

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiBase = `${environment.apiUrl}/auth`;

  private readonly accessTokenSignal = signal<string | null>(null);
  private readonly userSignal = signal<UserSummaryDto | null>(null);
  private readonly initializedSignal = signal(false);

  private refreshInFlight$: Observable<AuthSessionResponse | null> | null = null;

  readonly user = this.userSignal.asReadonly();
  readonly accessToken = this.accessTokenSignal.asReadonly();
  readonly isAuthenticated = computed(
    () => this.userSignal() !== null && this.accessTokenSignal() !== null,
  );
  readonly userRole = computed<UserRole | null>(() => this.userSignal()?.role ?? null);

  async ensureSessionInitialized(): Promise<void> {
    if (this.initializedSignal()) {
      return;
    }

    if (this.hasSessionHint()) {
      await firstValueFrom(this.refreshSession());
    }

    this.initializedSignal.set(true);
  }

  registerClient(payload: RegisterClientPayload): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(`${this.apiBase}/register/client`, payload, {
      withCredentials: true,
    });
  }

  registerTechnician(payload: RegisterTechnicianPayload): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(`${this.apiBase}/register/technician`, payload, {
      withCredentials: true,
    });
  }

  verifyEmail(payload: VerifyEmailPayload): Observable<GenericMessageResponse> {
    return this.http.post<GenericMessageResponse>(`${this.apiBase}/verify-email`, payload, {
      withCredentials: true,
    });
  }

  resendVerification(email: string): Observable<GenericMessageResponse> {
    return this.http.post<GenericMessageResponse>(
      `${this.apiBase}/resend-verification`,
      { email },
      { withCredentials: true },
    );
  }

  login(payload: LoginPayload): Observable<AuthSessionResponse> {
    return this.http
      .post<AuthSessionResponse>(`${this.apiBase}/login`, payload, { withCredentials: true })
      .pipe(
        tap((session) => {
          this.setSession(session);
          this.initializedSignal.set(true);
        }),
      );
  }

  refreshSession(): Observable<AuthSessionResponse | null> {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    this.refreshInFlight$ = this.http
      .post<AuthSessionResponse>(`${this.apiBase}/refresh`, {}, { withCredentials: true })
      .pipe(
        tap((session) => this.setSession(session)),
        catchError(() => {
          this.clearSession();
          return of(null);
        }),
        finalize(() => {
          this.refreshInFlight$ = null;
        }),
        shareReplay(1),
      );

    return this.refreshInFlight$;
  }

  logout(): Observable<void> {
    return this.http
      .post<GenericMessageResponse>(`${this.apiBase}/logout`, {}, { withCredentials: true })
      .pipe(
        catchError(() => of(null)),
        tap(() => this.clearSession()),
        map(() => undefined),
      );
  }

  requestPasswordReset(email: string): Observable<GenericMessageResponse> {
    return this.http.post<GenericMessageResponse>(
      `${this.apiBase}/password-reset/request`,
      { email },
      { withCredentials: true },
    );
  }

  confirmPasswordReset(payload: ConfirmPasswordResetPayload): Observable<GenericMessageResponse> {
    return this.http.post<GenericMessageResponse>(
      `${this.apiBase}/password-reset/confirm`,
      payload,
      {
        withCredentials: true,
      },
    );
  }

  requestAccountDeletion(): Observable<GenericMessageResponse> {
    return this.http
      .delete<GenericMessageResponse>(`${this.apiBase}/account`, { withCredentials: true })
      .pipe(tap(() => this.clearSession()));
  }

  updateCurrentUser(user: UserSummaryDto): void {
    this.userSignal.set(user);
  }

  getHomeRouteForRole(role: UserRole | null): string {
    if (role === 'Technician') {
      return '/tecnico';
    }

    if (role === 'Client') {
      return '/cliente';
    }

    return '/iniciar-sesion';
  }

  navigateToRoleHome(): Promise<boolean> {
    return this.router.navigateByUrl(this.getHomeRouteForRole(this.userRole()));
  }

  extractErrorMessage(
    error: unknown,
    fallback = 'Ocurrió un error inesperado. Intenta de nuevo.',
  ): string {
    if (error instanceof HttpErrorResponse) {
      const problem = error.error as ApiProblemResponse | null;
      if (problem?.errors && problem.errors.length > 0) {
        return problem.errors.join(' ');
      }

      if (problem?.detail) {
        return problem.detail;
      }

      if (problem?.title) {
        return problem.title;
      }
    }

    return fallback;
  }

  extractErrorCode(error: unknown): string | null {
    if (error instanceof HttpErrorResponse) {
      const problem = error.error as ApiProblemResponse | null;
      return problem?.code ?? null;
    }

    return null;
  }

  private setSession(session: AuthSessionResponse): void {
    this.accessTokenSignal.set(session.accessToken);
    this.userSignal.set(session.user);
    this.setSessionHint(true);
  }

  private clearSession(): void {
    this.accessTokenSignal.set(null);
    this.userSignal.set(null);
    this.setSessionHint(false);
  }

  private hasSessionHint(): boolean {
    try {
      return globalThis.localStorage?.getItem(AuthService.SESSION_HINT_KEY) === '1';
    } catch {
      return false;
    }
  }

  private setSessionHint(active: boolean): void {
    try {
      if (active) {
        globalThis.localStorage?.setItem(AuthService.SESSION_HINT_KEY, '1');
      } else {
        globalThis.localStorage?.removeItem(AuthService.SESSION_HINT_KEY);
      }
    } catch {
      // Ignore storage restrictions in private browsing modes.
    }
  }
}
