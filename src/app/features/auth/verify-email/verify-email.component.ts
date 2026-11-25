import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-verify-email',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-shell">
      <section class="auth-card" aria-labelledby="verify-heading">
        <header class="brand-header">
          <div class="brand-badge" aria-hidden="true">TH</div>
          <div>
            <p class="brand-title">TECNIHUB</p>
            <p class="brand-subtitle">Verificación de correo</p>
          </div>
        </header>

        <h1 id="verify-heading" class="page-title">Verifica tu correo</h1>
        <p class="page-lead">
          Ingresa el código de 6 dígitos enviado a tu correo. El código vence en 10 minutos (máximo
          5 intentos).
        </p>

        @if (errorMessage()) {
          <div class="alert alert-error" role="alert">{{ errorMessage() }}</div>
        }

        <form #formEl class="form-stack" [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <div class="field">
            <label for="verify-email">Correo electrónico</label>
            <input
              id="verify-email"
              name="email"
              type="email"
              class="input-control"
              formControlName="email"
              autocomplete="username"
              spellcheck="false"
              enterkeyhint="next"
              required
              [attr.aria-invalid]="isInvalid('email') ? 'true' : 'false'"
              [attr.aria-describedby]="isInvalid('email') ? 'verify-email-err' : null"
            />
            @if (isInvalid('email')) {
              <p id="verify-email-err" class="error-msg">Error: ingresa un correo válido.</p>
            }
          </div>

          <div class="field">
            <label for="verify-code">Código de verificación (6 dígitos)</label>
            <input
              id="verify-code"
              name="code"
              type="text"
              inputmode="numeric"
              autocomplete="one-time-code"
              maxlength="6"
              class="input-control"
              formControlName="code"
              enterkeyhint="done"
              required
              [attr.aria-invalid]="isInvalid('code') ? 'true' : 'false'"
              [attr.aria-describedby]="isInvalid('code') ? 'verify-code-err' : null"
            />
            @if (isInvalid('code')) {
              <p id="verify-code-err" class="error-msg">
                Error: ingresa el código numérico de 6 dígitos.
              </p>
            }
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="submitting()">
            {{ submitting() ? 'Validando...' : 'Verificar correo' }}
          </button>

          <button
            type="button"
            class="btn btn-secondary"
            [disabled]="resending()"
            (click)="onResend()"
          >
            {{ resending() ? 'Reenviando...' : 'Reenviar código' }}
          </button>
        </form>

        @if (infoMessage()) {
          <div class="alert alert-info" role="status" style="margin-top: 1rem">
            {{ infoMessage() }}
          </div>
        }

        <footer class="auth-footer">
          <a routerLink="/iniciar-sesion">Volver a iniciar sesión</a>
        </footer>
      </section>
    </main>
  `,
})
export class VerifyEmailComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly formElement = viewChild<ElementRef<HTMLFormElement>>('formEl');

  protected readonly submitting = signal(false);
  protected readonly resending = signal(false);
  protected readonly submitted = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly infoMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: [
      this.route.snapshot.queryParamMap.get('email') ?? '',
      [Validators.required, Validators.email],
    ],
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  protected isInvalid(controlName: 'email' | 'code'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted());
  }

  protected onSubmit(): void {
    this.submitted.set(true);
    this.errorMessage.set(null);
    this.infoMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const first =
        this.formElement()?.nativeElement.querySelector<HTMLElement>('input.ng-invalid');
      first?.focus();
      return;
    }

    this.submitting.set(true);
    this.auth.verifyEmail(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.submitting.set(false);
        void this.router.navigate(['/iniciar-sesion'], {
          state: {
            notice: res.message,
            email: this.form.controls.email.value.trim(),
          },
        });
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        this.errorMessage.set(this.auth.extractErrorMessage(err));
      },
    });
  }

  protected onResend(): void {
    this.errorMessage.set(null);
    this.infoMessage.set(null);
    if (this.form.controls.email.invalid) {
      this.form.controls.email.markAsTouched();
      return;
    }

    this.resending.set(true);
    this.auth.resendVerification(this.form.controls.email.value.trim()).subscribe({
      next: (res) => {
        this.resending.set(false);
        this.infoMessage.set(res.message);
      },
      error: (err: unknown) => {
        this.resending.set(false);
        this.errorMessage.set(this.auth.extractErrorMessage(err));
      },
    });
  }
}
