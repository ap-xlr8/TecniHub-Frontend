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
  selector: 'app-register-technician',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-shell">
      <section class="auth-card auth-card--wide" aria-labelledby="tech-reg-heading">
        <header class="brand-header">
          <div class="brand-badge" aria-hidden="true">TH</div>
          <div>
            <p class="brand-title">TECNIHUB</p>
            <p class="brand-subtitle">Registro de Técnico</p>
          </div>
        </header>

        <h1 id="tech-reg-heading" class="page-title">Crear cuenta de técnico</h1>
        <p class="page-lead">
          Ingresa tus datos personales y profesionales básicos para ofrecer servicios y refacciones.
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
              <label for="tech-first-name">Nombre</label>
              <input
                id="tech-first-name"
                name="firstName"
                type="text"
                class="input-control"
                formControlName="firstName"
                autocomplete="given-name"
                enterkeyhint="next"
                required
                [attr.aria-invalid]="isInvalid('firstName') ? 'true' : 'false'"
                [attr.aria-describedby]="isInvalid('firstName') ? 'tech-first-name-err' : null"
              />
              @if (isInvalid('firstName')) {
                <p id="tech-first-name-err" class="error-msg">Error: ingresa tu nombre.</p>
              }
            </div>

            <div class="field">
              <label for="tech-last-name">Apellidos</label>
              <input
                id="tech-last-name"
                name="lastName"
                type="text"
                class="input-control"
                formControlName="lastName"
                autocomplete="family-name"
                enterkeyhint="next"
                required
                [attr.aria-invalid]="isInvalid('lastName') ? 'true' : 'false'"
                [attr.aria-describedby]="isInvalid('lastName') ? 'tech-last-name-err' : null"
              />
              @if (isInvalid('lastName')) {
                <p id="tech-last-name-err" class="error-msg">Error: ingresa tus apellidos.</p>
              }
            </div>
          </div>

          <div class="form-grid">
            <div class="field">
              <label for="tech-email">Correo electrónico</label>
              <p id="tech-email-hint" class="field-hint">Formato: correo&#64;ejemplo.com</p>
              <input
                id="tech-email"
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
                  isInvalid('email') ? 'tech-email-hint tech-email-err' : 'tech-email-hint'
                "
              />
              @if (isInvalid('email')) {
                <p id="tech-email-err" class="error-msg">
                  Error: ingresa un correo electrónico válido.
                </p>
              }
            </div>

            <div class="field">
              <label for="tech-phone">Teléfono (opcional)</label>
              <p id="tech-phone-hint" class="field-hint">Entre 7 y 20 caracteres.</p>
              <input
                id="tech-phone"
                name="phone"
                type="tel"
                class="input-control"
                formControlName="phone"
                autocomplete="tel"
                inputmode="tel"
                enterkeyhint="next"
                [attr.aria-invalid]="isInvalid('phone') ? 'true' : 'false'"
                [attr.aria-describedby]="
                  isInvalid('phone') ? 'tech-phone-hint tech-phone-err' : 'tech-phone-hint'
                "
              />
              @if (isInvalid('phone')) {
                <p id="tech-phone-err" class="error-msg">
                  Error: el teléfono debe tener entre 7 y 20 caracteres.
                </p>
              }
            </div>
          </div>

          <div class="field">
            <label for="tech-specialties">Especialidades</label>
            <p id="tech-specialties-hint" class="field-hint">
              Ejemplo: Refrigeradores, lavadoras, microondas, aire acondicionado.
            </p>
            <input
              id="tech-specialties"
              name="specialties"
              type="text"
              class="input-control"
              formControlName="specialties"
              enterkeyhint="next"
              required
              [attr.aria-invalid]="isInvalid('specialties') ? 'true' : 'false'"
              [attr.aria-describedby]="
                isInvalid('specialties')
                  ? 'tech-specialties-hint tech-specialties-err'
                  : 'tech-specialties-hint'
              "
            />
            @if (isInvalid('specialties')) {
              <p id="tech-specialties-err" class="error-msg">
                Error: indica al menos una especialidad técnica.
              </p>
            }
          </div>

          <div class="form-grid">
            <div class="field">
              <label for="tech-experience">Años de experiencia</label>
              <input
                id="tech-experience"
                name="experienceYears"
                type="number"
                min="0"
                max="60"
                inputmode="numeric"
                class="input-control"
                formControlName="experienceYears"
                enterkeyhint="next"
                required
                [attr.aria-invalid]="isInvalid('experienceYears') ? 'true' : 'false'"
                [attr.aria-describedby]="
                  isInvalid('experienceYears') ? 'tech-experience-err' : null
                "
              />
              @if (isInvalid('experienceYears')) {
                <p id="tech-experience-err" class="error-msg">
                  Error: ingresa años de experiencia entre 0 y 60.
                </p>
              }
            </div>

            <div class="field">
              <label for="tech-zone">Zona de atención</label>
              <input
                id="tech-zone"
                name="serviceZone"
                type="text"
                class="input-control"
                formControlName="serviceZone"
                enterkeyhint="next"
                required
                [attr.aria-invalid]="isInvalid('serviceZone') ? 'true' : 'false'"
                [attr.aria-describedby]="isInvalid('serviceZone') ? 'tech-zone-err' : null"
              />
              @if (isInvalid('serviceZone')) {
                <p id="tech-zone-err" class="error-msg">Error: indica tu zona de atención.</p>
              }
            </div>
          </div>

          <div class="field">
            <label for="tech-business">Nombre comercial o taller (opcional)</label>
            <input
              id="tech-business"
              name="businessName"
              type="text"
              class="input-control"
              formControlName="businessName"
              autocomplete="organization"
              enterkeyhint="next"
              [attr.aria-invalid]="isInvalid('businessName') ? 'true' : 'false'"
            />
          </div>

          <div class="field">
            <label for="tech-password">Contraseña</label>
            <ul id="tech-password-rules" class="rules-list" aria-label="Requisitos de contraseña">
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
                id="tech-password"
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
                    ? 'tech-password-rules tech-password-err'
                    : 'tech-password-rules'
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
              <p id="tech-password-err" class="error-msg">
                Error: la contraseña no cumple con todos los requisitos indicados arriba.
              </p>
            }
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="submitting()">
            {{ submitting() ? 'Creando cuenta...' : 'Crear cuenta de técnico' }}
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
export class RegisterTechnicianComponent {
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
    specialties: ['', [Validators.required, Validators.maxLength(300)]],
    experienceYears: [1, [Validators.required, Validators.min(0), Validators.max(60)]],
    serviceZone: ['', [Validators.required, Validators.maxLength(150)]],
    businessName: ['', [Validators.maxLength(120)]],
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
      .registerTechnician({
        firstName: raw.firstName.trim(),
        lastName: raw.lastName.trim(),
        email: raw.email.trim(),
        password: raw.password,
        phone: raw.phone.trim() ? raw.phone.trim() : null,
        specialties: raw.specialties.trim(),
        experienceYears: Number(raw.experienceYears),
        serviceZone: raw.serviceZone.trim(),
        businessName: raw.businessName.trim() ? raw.businessName.trim() : null,
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
