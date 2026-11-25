import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-shell">
      <section class="auth-card" aria-labelledby="login-heading">
        <header class="brand-header">
          <div class="brand-badge" aria-hidden="true">TH</div>
          <div>
            <p class="brand-title">TECNIHUB</p>
            <p class="brand-subtitle">Servicios técnicos y refacciones</p>
          </div>
        </header>

        <h1 id="login-heading" class="page-title">Iniciar sesión</h1>
        <p class="page-lead">Accede con tu cuenta de cliente o técnico.</p>

        @if (successNotice()) {
          <div class="alert alert-success" role="status" style="margin-bottom: 1rem">
            {{ successNotice() }}
          </div>
        }

        @if (errorMessage()) {
          <div class="alert alert-error" role="alert">
            <p style="margin: 0">{{ errorMessage() }}</p>
            @if (needsVerification()) {
              <p style="margin: 0.5rem 0 0">
                <a
                  [routerLink]="['/verificar-correo']"
                  [queryParams]="{ email: form.controls.email.value }"
                >
                  Verificar mi correo ahora
                </a>
              </p>
            }
          </div>
        }

        <form #formEl class="form-stack" [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <div class="field">
            <label for="login-email">Correo electrónico</label>
            <p id="login-email-hint" class="field-hint">Formato: correo&#64;ejemplo.com</p>
            <input
              id="login-email"
              name="email"
              type="email"
              class="input-control"
              formControlName="email"
              autocomplete="username"
              spellcheck="false"
              enterkeyhint="next"
              required
              [attr.aria-invalid]="isInvalid('email') ? 'true' : 'false'"
              [attr.aria-describedby]="
                isInvalid('email') ? 'login-email-hint login-email-error' : 'login-email-hint'
              "
            />
            @if (isInvalid('email')) {
              <p id="login-email-error" class="error-msg">
                Error: ingresa un correo electrónico con formato válido.
              </p>
            }
          </div>

          <div class="field">
            <label for="login-password">Contraseña</label>
            <div class="password-row">
              <input
                id="login-password"
                name="password"
                [type]="showPassword() ? 'text' : 'password'"
                class="input-control"
                formControlName="password"
                autocomplete="current-password"
                enterkeyhint="done"
                required
                [attr.aria-invalid]="isInvalid('password') ? 'true' : 'false'"
                [attr.aria-describedby]="isInvalid('password') ? 'login-password-error' : null"
              />
              <button
                type="button"
                class="toggle-password-btn"
                [attr.aria-pressed]="showPassword()"
                (click)="togglePassword()"
              >
                {{ showPassword() ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
            @if (isInvalid('password')) {
              <p id="login-password-error" class="error-msg">Error: ingresa tu contraseña.</p>
            }
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="submitting()">
            {{ submitting() ? 'Verificando acceso...' : 'Iniciar sesión' }}
          </button>
        </form>

        <footer class="auth-footer">
          <a routerLink="/recuperar-contrasena">¿Olvidaste tu contraseña?</a>
          <a routerLink="/registro">Crear una cuenta</a>
          <a routerLink="/">Inicio</a>
        </footer>
      </section>
    </main>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly formElement = viewChild<ElementRef<HTMLFormElement>>('formEl');

  private readonly navigationState = (globalThis.history?.state ?? {}) as {
    notice?: string;
    email?: string;
  };

  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly successNotice = signal<string | null>(this.navigationState.notice ?? null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly needsVerification = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: [this.navigationState.email ?? '', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  protected isInvalid(controlName: 'email' | 'password'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted());
  }

  protected onSubmit(): void {
    this.submitted.set(true);
    this.errorMessage.set(null);
    this.needsVerification.set(false);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }

    this.submitting.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.submitting.set(false);
        void this.auth.navigateToRoleHome();
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        this.errorMessage.set(
          this.auth.extractErrorMessage(err, 'Correo o contraseña no válidos.'),
        );
        this.needsVerification.set(this.auth.extractErrorCode(err) === 'email_not_verified');
      },
    });
  }

  protected goToRegister(): void {
    void this.router.navigateByUrl('/registro');
  }

  private focusFirstInvalid(): void {
    const first = this.formElement()?.nativeElement.querySelector<HTMLElement>(
      'input.ng-invalid, select.ng-invalid, textarea.ng-invalid',
    );
    first?.focus();
  }
}
