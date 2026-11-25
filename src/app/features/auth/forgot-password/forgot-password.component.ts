import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import {
  PASSWORD_PATTERN,
  evaluatePassword,
  passwordPolicyValidator,
} from '../../../core/auth/password-policy.validator';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-shell">
      <section class="auth-card" aria-labelledby="reset-heading">
        <header class="brand-header">
          <div class="brand-badge" aria-hidden="true">TH</div>
          <div>
            <p class="brand-title">TECNIHUB</p>
            <p class="brand-subtitle">Recuperar contraseña</p>
          </div>
        </header>

        <h1 id="reset-heading" class="page-title">Recuperar contraseña</h1>

        @if (errorMessage()) {
          <div class="alert alert-error" role="alert">{{ errorMessage() }}</div>
        }

        @if (completedMessage()) {
          <div class="alert alert-success" role="status">
            <p style="margin: 0">{{ completedMessage() }}</p>
            <p style="margin: 0.75rem 0 0">
              <a routerLink="/iniciar-sesion" class="btn btn-primary">Volver a iniciar sesión</a>
            </p>
          </div>
        } @else if (step() === 'request') {
          <p class="page-lead">
            Ingresa el correo de tu cuenta. Te enviaremos un código de un solo uso válido por 10
            minutos.
          </p>

          <form
            #requestFormEl
            class="form-stack"
            [formGroup]="requestForm"
            (ngSubmit)="onRequestSubmit()"
            novalidate
          >
            <div class="field">
              <label for="reset-email">Correo electrónico</label>
              <p id="reset-email-hint" class="field-hint">Formato: correo&#64;ejemplo.com</p>
              <input
                id="reset-email"
                name="email"
                type="email"
                class="input-control"
                formControlName="email"
                autocomplete="username"
                spellcheck="false"
                enterkeyhint="done"
                required
                [attr.aria-invalid]="isRequestInvalid() ? 'true' : 'false'"
                [attr.aria-describedby]="
                  isRequestInvalid() ? 'reset-email-hint reset-email-err' : 'reset-email-hint'
                "
              />
              @if (isRequestInvalid()) {
                <p id="reset-email-err" class="error-msg">
                  Error: ingresa un correo electrónico con formato válido.
                </p>
              }
            </div>

            <button type="submit" class="btn btn-primary" [disabled]="submitting()">
              {{ submitting() ? 'Enviando...' : 'Enviar instrucciones' }}
            </button>
          </form>
        } @else {
          @if (genericNotice()) {
            <div class="alert alert-info" role="status" style="margin-bottom: 1rem">
              {{ genericNotice() }}
            </div>
          }

          <form
            #confirmFormEl
            class="form-stack"
            [formGroup]="confirmForm"
            (ngSubmit)="onConfirmSubmit()"
            novalidate
          >
            <div class="field">
              <label for="reset-code">Código de recuperación (6 dígitos)</label>
              <input
                id="reset-code"
                name="code"
                type="text"
                inputmode="numeric"
                autocomplete="one-time-code"
                maxlength="6"
                class="input-control"
                formControlName="code"
                enterkeyhint="next"
                required
                [attr.aria-invalid]="isConfirmInvalid('code') ? 'true' : 'false'"
                [attr.aria-describedby]="isConfirmInvalid('code') ? 'reset-code-err' : null"
              />
              @if (isConfirmInvalid('code')) {
                <p id="reset-code-err" class="error-msg">
                  Error: ingresa el código de 6 dígitos recibido por correo.
                </p>
              }
            </div>

            <div class="field">
              <label for="reset-new-password">Nueva contraseña</label>
              <ul
                id="reset-password-rules"
                class="rules-list"
                aria-label="Requisitos de contraseña"
              >
                <li [class.rule-ok]="checks().length">
                  <span aria-hidden="true">{{ checks().length ? '✓' : '•' }}</span> De 8 a 16
                  caracteres
                </li>
                <li [class.rule-ok]="checks().uppercase">
                  <span aria-hidden="true">{{ checks().uppercase ? '✓' : '•' }}</span> Al menos una
                  mayúscula
                </li>
                <li [class.rule-ok]="checks().lowercase">
                  <span aria-hidden="true">{{ checks().lowercase ? '✓' : '•' }}</span> Al menos una
                  minúscula
                </li>
                <li [class.rule-ok]="checks().number">
                  <span aria-hidden="true">{{ checks().number ? '✓' : '•' }}</span> Al menos un
                  número
                </li>
                <li [class.rule-ok]="checks().special">
                  <span aria-hidden="true">{{ checks().special ? '✓' : '•' }}</span> Al menos un
                  carácter especial
                </li>
              </ul>
              <div class="password-row">
                <input
                  id="reset-new-password"
                  name="newPassword"
                  [type]="showPassword() ? 'text' : 'password'"
                  class="input-control"
                  formControlName="newPassword"
                  autocomplete="new-password"
                  enterkeyhint="done"
                  required
                  minlength="8"
                  maxlength="16"
                  [attr.pattern]="passwordPattern"
                  [attr.aria-invalid]="isConfirmInvalid('newPassword') ? 'true' : 'false'"
                  [attr.aria-describedby]="
                    isConfirmInvalid('newPassword')
                      ? 'reset-password-rules reset-password-err'
                      : 'reset-password-rules'
                  "
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
              @if (isConfirmInvalid('newPassword')) {
                <p id="reset-password-err" class="error-msg">
                  Error: la nueva contraseña no cumple con todos los requisitos.
                </p>
              }
            </div>

            <button type="submit" class="btn btn-primary" [disabled]="submitting()">
              {{ submitting() ? 'Actualizando...' : 'Actualizar contraseña' }}
            </button>
          </form>
        }

        <footer class="auth-footer">
          <a routerLink="/iniciar-sesion">Volver a iniciar sesión</a>
        </footer>
      </section>
    </main>
  `,
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  private readonly requestFormElement = viewChild<ElementRef<HTMLFormElement>>('requestFormEl');
  private readonly confirmFormElement = viewChild<ElementRef<HTMLFormElement>>('confirmFormEl');

  protected readonly passwordPattern = PASSWORD_PATTERN;
  protected readonly step = signal<'request' | 'confirm'>('request');
  protected readonly submitting = signal(false);
  protected readonly requestSubmitted = signal(false);
  protected readonly confirmSubmitted = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly genericNotice = signal<string | null>(null);
  protected readonly completedMessage = signal<string | null>(null);

  protected readonly requestForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected readonly confirmForm = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    newPassword: ['', [Validators.required, passwordPolicyValidator]],
  });

  private readonly newPasswordValue = toSignal(this.confirmForm.controls.newPassword.valueChanges, {
    initialValue: '',
  });
  protected readonly checks = computed(() => evaluatePassword(this.newPasswordValue()));

  protected togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  protected isRequestInvalid(): boolean {
    const control = this.requestForm.controls.email;
    return control.invalid && (control.touched || this.requestSubmitted());
  }

  protected isConfirmInvalid(controlName: 'code' | 'newPassword'): boolean {
    const control = this.confirmForm.controls[controlName];
    return control.invalid && (control.touched || this.confirmSubmitted());
  }

  protected onRequestSubmit(): void {
    this.requestSubmitted.set(true);
    this.errorMessage.set(null);

    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      this.requestFormElement()
        ?.nativeElement.querySelector<HTMLElement>('input.ng-invalid')
        ?.focus();
      return;
    }

    this.submitting.set(true);
    const email = this.requestForm.controls.email.value.trim();

    this.auth.requestPasswordReset(email).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.genericNotice.set(res.message);
        this.step.set('confirm');
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        this.errorMessage.set(this.auth.extractErrorMessage(err));
      },
    });
  }

  protected onConfirmSubmit(): void {
    this.confirmSubmitted.set(true);
    this.errorMessage.set(null);

    if (this.confirmForm.invalid) {
      this.confirmForm.markAllAsTouched();
      this.confirmFormElement()
        ?.nativeElement.querySelector<HTMLElement>('input.ng-invalid')
        ?.focus();
      return;
    }

    this.submitting.set(true);
    this.auth
      .confirmPasswordReset({
        email: this.requestForm.controls.email.value.trim(),
        code: this.confirmForm.controls.code.value.trim(),
        newPassword: this.confirmForm.controls.newPassword.value,
      })
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          this.completedMessage.set(res.message);
        },
        error: (err: unknown) => {
          this.submitting.set(false);
          this.errorMessage.set(this.auth.extractErrorMessage(err));
        },
      });
  }
}
