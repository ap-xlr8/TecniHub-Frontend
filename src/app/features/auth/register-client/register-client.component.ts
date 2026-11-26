import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import {
  PASSWORD_PATTERN,
  evaluatePassword,
  passwordPolicyValidator,
} from '../../../core/auth/password-policy.validator';

@Component({
  selector: 'app-register-client',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-shell">
      <section class="auth-card auth-card--wide" aria-labelledby="client-reg-heading">
        <header class="brand-header">
          <div class="brand-badge" aria-hidden="true">TH</div>
          <div>
            <p class="brand-title">TECNIHUB</p>
            <p class="brand-subtitle">Registro de Cliente</p>
          </div>
        </header>

        <h1 id="client-reg-heading" class="page-title">Crear cuenta de cliente</h1>
        <p class="page-lead">
          Completa tus datos. Te enviaremos un código de verificación a tu correo electrónico.
        </p>

        @if (errorMessage()) {
          <div class="alert alert-error" role="alert">
            <p style="margin: 0">{{ errorMessage() }}</p>
            @if (emailDeliveryFailed()) {
              <p style="margin: 0.5rem 0 0">
                <a
                  [routerLink]="['/verificar-correo']"
                  [queryParams]="{ email: form.controls.email.value }"
                >
                  Ir a verificar o reenviar código
                </a>
              </p>
            }
          </div>
        }

        <form #formEl class="form-stack" [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <div class="form-grid">
            <div class="field">
              <label for="client-first-name">Nombre</label>
              <input
                id="client-first-name"
                name="firstName"
                type="text"
                class="input-control"
                formControlName="firstName"
                autocomplete="given-name"
                enterkeyhint="next"
                required
                [attr.aria-invalid]="isInvalid('firstName') ? 'true' : 'false'"
                [attr.aria-describedby]="isInvalid('firstName') ? 'client-first-name-err' : null"
              />
              @if (isInvalid('firstName')) {
                <p id="client-first-name-err" class="error-msg">Error: ingresa tu nombre.</p>
              }
            </div>

            <div class="field">
              <label for="client-last-name">Apellidos</label>
              <input
                id="client-last-name"
                name="lastName"
                type="text"
                class="input-control"
                formControlName="lastName"
                autocomplete="family-name"
                enterkeyhint="next"
                required
                [attr.aria-invalid]="isInvalid('lastName') ? 'true' : 'false'"
                [attr.aria-describedby]="isInvalid('lastName') ? 'client-last-name-err' : null"
              />
              @if (isInvalid('lastName')) {
                <p id="client-last-name-err" class="error-msg">Error: ingresa tus apellidos.</p>
              }
            </div>
          </div>

          <div class="form-grid">
            <div class="field">
              <label for="client-email">Correo electrónico</label>
              <p id="client-email-hint" class="field-hint">Formato: correo&#64;ejemplo.com</p>
              <input
                id="client-email"
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
                  isInvalid('email') ? 'client-email-hint client-email-err' : 'client-email-hint'
                "
              />
              @if (isInvalid('email')) {
                <p id="client-email-err" class="error-msg">
                  Error: ingresa un correo electrónico válido.
                </p>
              }
            </div>

            <div class="field">
              <label for="client-phone">Teléfono (opcional)</label>
              <p id="client-phone-hint" class="field-hint">
                Entre 7 y 20 caracteres si deseas agregarlo.
              </p>
              <input
                id="client-phone"
                name="phone"
                type="tel"
                class="input-control"
                formControlName="phone"
                autocomplete="tel"
                inputmode="tel"
                enterkeyhint="next"
                [attr.aria-invalid]="isInvalid('phone') ? 'true' : 'false'"
                [attr.aria-describedby]="
                  isInvalid('phone') ? 'client-phone-hint client-phone-err' : 'client-phone-hint'
                "
              />
              @if (isInvalid('phone')) {
                <p id="client-phone-err" class="error-msg">
                  Error: el teléfono debe tener entre 7 y 20 caracteres.
                </p>
              }
            </div>
          </div>

          <div class="field">
            <label for="client-password">Contraseña</label>
            <ul id="client-password-rules" class="rules-list" aria-label="Requisitos de contraseña">
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
                <span aria-hidden="true">{{ checks().number ? '✓' : '•' }}</span> Al menos un número
              </li>
              <li [class.rule-ok]="checks().special">
                <span aria-hidden="true">{{ checks().special ? '✓' : '•' }}</span> Al menos un
                carácter especial
              </li>
            </ul>
            <div class="password-row">
              <input
                id="client-password"
                name="password"
                [type]="showPassword() ? 'text' : 'password'"
                class="input-control"
                formControlName="password"
                autocomplete="new-password"
                enterkeyhint="done"
                required
                minlength="8"
                maxlength="16"
                [attr.pattern]="passwordPattern"
                [attr.aria-invalid]="isInvalid('password') ? 'true' : 'false'"
                [attr.aria-describedby]="
                  isInvalid('password')
                    ? 'client-password-rules client-password-err'
                    : 'client-password-rules'
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
            @if (isInvalid('password')) {
              <p id="client-password-err" class="error-msg">
                Error: la contraseña no cumple con todos los requisitos indicados arriba.
              </p>
            }
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="submitting()">
            {{ submitting() ? 'Creando cuenta...' : 'Crear cuenta de cliente' }}
          </button>
        </form>

        <footer class="auth-footer">
          <a routerLink="/registro">Cambiar tipo de cuenta</a>
          <a routerLink="/iniciar-sesion">Ya tengo cuenta</a>
        </footer>
      </section>
    </main>
  `,
})
export class RegisterClientComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly formElement = viewChild<ElementRef<HTMLFormElement>>('formEl');

  protected readonly passwordPattern = PASSWORD_PATTERN;
  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly emailDeliveryFailed = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(80)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.minLength(7), Validators.maxLength(20)]],
    password: ['', [Validators.required, passwordPolicyValidator]],
  });

  private readonly passwordValue = toSignal(this.form.controls.password.valueChanges, {
    initialValue: '',
  });
  protected readonly checks = computed(() => evaluatePassword(this.passwordValue()));

  protected togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  protected isInvalid(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted());
  }

  protected onSubmit(): void {
    this.submitted.set(true);
    this.errorMessage.set(null);
    this.emailDeliveryFailed.set(false);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const first =
        this.formElement()?.nativeElement.querySelector<HTMLElement>('input.ng-invalid');
      first?.focus();
      return;
    }

    const raw = this.form.getRawValue();
    this.submitting.set(true);

    this.auth
      .registerClient({
        firstName: raw.firstName.trim(),
        lastName: raw.lastName.trim(),
        email: raw.email.trim(),
        password: raw.password,
        phone: raw.phone.trim() ? raw.phone.trim() : null,
      })
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          void this.router.navigate(['/verificar-correo'], { queryParams: { email: res.email } });
        },
        error: (err: unknown) => {
          this.submitting.set(false);
          this.errorMessage.set(this.auth.extractErrorMessage(err));
          this.emailDeliveryFailed.set(this.auth.extractErrorCode(err) === 'email_delivery_failed');
        },
      });
  }
}
